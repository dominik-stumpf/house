package polife

import (
	"bufio"
	"errors"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/log"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/valyala/fasthttp"
)

const maxSubs = 100
const overOneCentury =  time.Hour * 999999;

func RegisterRoutes(app *fiber.App) {
	if (os.Getenv("ENV") == "development") {
		app.Use(cors.New(cors.Config{
			AllowOrigins: []string{"*"},
			AllowHeaders: []string{"Cache-Control"},
		}))
	}

	bpmTicker := time.NewTicker(overOneCentury)

	type subscriber struct {
		ch   chan time.Time
		resp chan error
	}
	addSub := make(chan subscriber)
	removeSub := make(chan chan time.Time)
	go func() {
		subs := make(map[chan time.Time]struct{})

		for {
			select {
			case s := <-addSub:
				if len(subs) >= maxSubs {
					s.resp <- errors.New("subscriber limit reached")
					continue
				}
				subs[s.ch] = struct{}{}
				s.resp <- nil

			case ch := <-removeSub:
				if _, ok := subs[ch]; ok {
					delete(subs, ch)
					close(ch)
				}

			case t := <-bpmTicker.C:
				for ch := range subs {
					select {
					case ch <- t:
					default:
					}
				}
			}
		}
	}()

	app.Get("/api/pol", func(c fiber.Ctx) error {
		c.Set("Content-Type", "text/event-stream")
		c.Set("Cache-Control", "no-cache")
		c.Set("Connection", "keep-alive")
		c.Set("Transfer-Encoding", "chunked")

		ch := make(chan time.Time)
		resp := make(chan error)
		addSub <- subscriber{ch: ch, resp: resp}
		if err := <-resp; err != nil {
			c.Status(fiber.StatusServiceUnavailable)
			return nil
		}

		c.Status(fiber.StatusOK).RequestCtx().SetBodyStreamWriter(fasthttp.StreamWriter(func(w *bufio.Writer) {
			defer func() {
				removeSub <- ch
			}()
			for range ch {
				fmt.Fprintf(w, "data: %s\n\n", "thump")
				err := w.Flush()
				if err != nil {
					log.Info("error while flushing", "error", err)
					break
				}
			}
		}))

		return nil
	})

	monitorTimeout := time.Second * 20
	monitorTimer := time.NewTimer(0)

	app.Put("/api/pol", func(c fiber.Ctx) error {
		apiKey := os.Getenv("API_KEY")
		authHeader := c.Get("Authorization")
		isAuthorized := authHeader == "Basic "+apiKey
		if apiKey == "" || !isAuthorized {
			return c.
				Status(fiber.StatusUnauthorized).
				SendString(fasthttp.StatusMessage(fiber.StatusUnauthorized))
		}

		bpm, err := strconv.ParseUint(string(c.Body()), 10, 8)
		if err != nil {
			log.Info("failed to parse bpm", "error", err)
			return c.
				Status(fiber.StatusBadRequest).
				SendString(fasthttp.StatusMessage(fiber.StatusBadRequest))
		}

		c.Status(fiber.StatusNoContent)

		monitorTimer.Reset(monitorTimeout)
		if bpm == 0 {
			bpmTicker.Stop()
		} else {
			bpmTicker.Reset(time.Minute / time.Duration(bpm))
		}

		go func() {
			<-monitorTimer.C
			log.Info("monintor timed out")
			bpmTicker.Stop()
		}()

		return nil
	})
}
