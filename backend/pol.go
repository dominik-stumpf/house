package main

import (
	"bufio"
	"fmt"
	"log"
	"os"
	"strconv"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
	"github.com/valyala/fasthttp"
)

type clientChan chan string

type sseHub struct {
	clients map[clientChan]bool
	lock    sync.Mutex
}

func newHub() *sseHub {
	return &sseHub{
		clients: make(map[clientChan]bool),
	}
}

func (hub *sseHub) addClient(ch clientChan) {
	hub.lock.Lock()
	defer hub.lock.Unlock()
	hub.clients[ch] = true
}

func (hub *sseHub) removeClient(ch clientChan) {
	hub.lock.Lock()
	defer hub.lock.Unlock()
	delete(hub.clients, ch)
	close(ch)
}

func (hub *sseHub) broadcast(msg string) {
	hub.lock.Lock()
	defer hub.lock.Unlock()
	fmt.Println(msg)
	for ch := range hub.clients {
		select {
		case ch <- msg:
		default:
			hub.removeClient(ch)
		}
	}
}

var hub = newHub()
var greetMessage = "the heart who beats"

func handleStream(c *fiber.Ctx) error {
	c.Set("Content-Type", "text/event-stream")
	c.Set("Cache-Control", "no-cache")
	c.Set("Connection", "keep-alive")
	c.Set("Access-Control-Allow-Origin", "*")

	msgChan := make(clientChan)
	hub.addClient(msgChan)

	notify := c.Context().Done()

	c.Context().SetBodyStreamWriter(fasthttp.StreamWriter(func(w *bufio.Writer) {
		defer hub.removeClient(msgChan)

		if currentBpm > 0 {
			fmt.Fprintf(w, "data: %v\n\n", greetMessage)
			w.Flush()
		}

		heartbeat := time.NewTicker(15 * time.Second)
		defer heartbeat.Stop()

		// listen to signal to close and unregister
		go func() {
			<-notify
			log.Printf("Client disconnected\n")
			heartbeat.Stop()
		}()

		for loop := true; loop; {
			select {
			case msg := <-msgChan:
				fmt.Fprintf(w, "data: %s\n\n", msg)
				if err := w.Flush(); err != nil {
					log.Printf("Error while flushing data: %v\n", err)
					loop = false
				}
			case <-heartbeat.C:
				fmt.Fprintf(w, ": keep-alive\n\n")
				if err := w.Flush(); err != nil {
					log.Printf("Error while flushing keep-alive: %v\n", err)
					loop = false
				}
			}
		}

		log.Println("Exiting stream")
	}))

	return nil
}

var (
	currentBpm    int
	bpmTicker     *time.Ticker
	bpmStopChan   chan struct{}
	bpmTimeout    *time.Timer
	bpmTickerLock sync.Mutex
)

func resetBpmTimeout() {
	if bpmTimeout != nil {
		bpmTimeout.Stop()
	}

	bpmTimeout = time.AfterFunc(5*time.Second, func() {
		bpmTickerLock.Lock()
		defer bpmTickerLock.Unlock()

		if bpmTicker != nil {
			bpmTicker.Stop()
			close(bpmStopChan)
			bpmTicker = nil
		}

		currentBpm = 0
		log.Println("BPM timeout — beat stopped after due to inactivity")
	})
}

func handleBroadcast(c *fiber.Ctx) error {
	c.Set("Access-Control-Allow-Origin", "*")
	c.Set("Access-Control-Allow-Methods", "POST")
	c.Set("Access-Control-Allow-Headers", "Content-Type")

	authHeader := c.Get("Authorization")
	isAuthorized := authHeader == "Basic "+authToken

	if !isAuthorized {
		return c.Status(fiber.StatusUnauthorized).SendString(fiber.ErrUnauthorized.Message)
	}

	if c.Method() != fiber.MethodPost {
		return c.Status(fiber.StatusMethodNotAllowed).SendString(fiber.ErrMethodNotAllowed.Message)
	}

	body := c.Body()
	bpmVal, err := strconv.Atoi(string(body))

	if err != nil || 0 > bpmVal || bpmVal > 302 {
		return c.Status(fiber.StatusUnprocessableEntity).SendString("Unprocessable Entity")
	}

	bpmTickerLock.Lock()
	defer bpmTickerLock.Unlock()

	if bpmTicker != nil {
		bpmTicker.Stop()
	}

	if bpmVal == 0 {
		return c.SendStatus(fiber.StatusOK)
	}

	interval := time.Minute / time.Duration(float32(bpmVal)*1.2)
	bpmTicker = time.NewTicker(interval)
	bpmStopChan = make(chan struct{})
	currentBpm = bpmVal
	log.Printf("BPM updated to %d (interval %s)", bpmVal, interval)

	go func(t *time.Ticker, stop <-chan struct{}) {
		for {
			select {
			case <-t.C:
				hub.broadcast("b")
			case <-stop:
				return
			}
		}
	}(bpmTicker, bpmStopChan)

	resetBpmTimeout()

	return c.SendStatus(fiber.StatusOK)
}

var authToken string
var bpmChan = make(chan int)

func init() {
	authToken = os.Getenv("AUTH_TOKEN")
	if authToken == "" {
		err := godotenv.Load()
		if err != nil {
			log.Fatal("Error loading .env file")
		}
		authToken = os.Getenv("AUTH_TOKEN")
	}
	if authToken == "" {
		log.Panicf("failed to parse auth token %v", authToken)
	}
}
