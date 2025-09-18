package main

import (
	"fmt"
	"github.com/joho/godotenv"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"sync"
	"time"
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

func streamHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "streaming unsupported", http.StatusInternalServerError)
		return
	}

	msgChan := make(clientChan)
	hub.addClient(msgChan)
	defer hub.removeClient(msgChan)

	if currentBpm > 0 {
		fmt.Fprintf(w, "data: %v\n\n", greetMessage)
	}
	flusher.Flush()

	heartbeat := time.NewTicker(15 * time.Second)
	defer heartbeat.Stop()

	notify := r.Context().Done()

	for {
		select {
		case msg := <-msgChan:
			fmt.Fprintf(w, "data: %s\n\n", msg)
			flusher.Flush()
		case <-heartbeat.C:
			fmt.Fprintf(w, ": keep-alive\n\n")
			flusher.Flush()
		case <-notify:
			return
		}
	}
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

func broadcastHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	authHeader := r.Header.Get("Authorization")
	isAuthorized := authHeader == "Basic "+authToken

	if !isAuthorized {
		httpError(w, http.StatusUnauthorized)
		return
	}

	if r.Method != http.MethodPost {
		httpError(w, http.StatusMethodNotAllowed)
		return
	}

	defer r.Body.Close()

	msg, err := io.ReadAll(r.Body)
	if err != nil {
		httpError(w, http.StatusBadRequest)
		return
	}

	bpmVal, err := strconv.Atoi(string(msg))

	if err != nil || 0 > bpmVal || bpmVal > 302 {
		httpError(w, http.StatusUnprocessableEntity)
		return
	}

	bpmTickerLock.Lock()
	defer bpmTickerLock.Unlock()

	if bpmTicker != nil {
		bpmTicker.Stop()
	}

	if bpmVal == 0 {
		return
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

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(http.StatusText(http.StatusOK)))
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

func httpError(w http.ResponseWriter, code int) {
	http.Error(w, http.StatusText(code), code)
}

func notFoundHandler(w http.ResponseWriter, r *http.Request) {
	httpError(w, http.StatusNotFound)
	return
}

func rootHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(http.StatusText(http.StatusOK)))
}

func main() {
	http.HandleFunc("/stream", streamHandler)
	http.HandleFunc("/broadcast", broadcastHandler)
	http.Handle("/pol", http.FileServer(http.Dir("./static")))
	http.HandleFunc("/*", notFoundHandler)
	http.HandleFunc("/", rootHandler)

	log.Printf("service started")
	// log.Print(http.ListenAndServeTLS(":443", "server.crt", "server.key", nil))
	log.Fatal(http.ListenAndServe(":8080", nil))
}
