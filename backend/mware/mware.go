package mware

import (
	"bytes"
	"errors"
	"net/http"
	"net/netip"
	"path/filepath"
	"slices"
	"strings"
	"sync"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/log"
	"golang.org/x/time/rate"
)

func ResolveNoHTMLExtension(c fiber.Ctx) error {
	uri := c.Request().URI()
	path := uri.Path()
	extension := filepath.Ext(string(uri.LastPathSegment()))
	isRoot := slices.Equal(path, []byte("/"))

	if isRoot {
		uri.SetPath("/index.html")
		return c.Next()
	}

	if extension == "" {
		filename := uri.LastPathSegment()
		resolved := append(filename, []byte(".html")...)
		path = bytes.TrimRight(path, "/")
		i := bytes.LastIndexByte(path, '/')
		if i == -1 {
			return errors.New("failed to parse path")
		}
		resolved = append(path[:i+1], resolved...)
		uri.SetPathBytes(resolved)
	}

	return c.Next()
}

func RemoveTrailingSlash(c fiber.Ctx) error {
	path := c.Path()

	if path != "/" && strings.HasSuffix(path, "/") {
		newPath := strings.TrimSuffix(path, "/")
		uri := c.Request().URI()
		uri.SetPath(newPath)
		return c.
			Redirect().
			Status(fiber.StatusPermanentRedirect).
			To(string(uri.RequestURI()))
	}

	return c.Next()
}

func RemoveLastModified(c fiber.Ctx) error {
	if err := c.Next(); err != nil {
		return err
	}
	c.Response().Header.Del("last-modified")
	return nil
}

func IPRateLimit(expiration time.Duration, rps float64, burst int) func(fiber.Ctx) error {
	type client struct {
		limiter  *rate.Limiter
		lastSeen time.Time
	}
	var (
		mu      sync.Mutex
		clients = make(map[netip.Addr]*client)
	)
	go func() {
		for {
			time.Sleep(time.Minute)
			mu.Lock()
			for ip, client := range clients {
				if time.Since(client.lastSeen) > 3*time.Minute {
					delete(clients, ip)
				}
			}
			mu.Unlock()
		}
	}()
	return func(c fiber.Ctx) error {
		ip, err := netip.ParseAddr(c.RequestCtx().RemoteIP().String())
		if err != nil {
			log.Error("failed to parse ip", "error", err)
			return c.SendStatus(http.StatusInternalServerError)
		}
		mu.Lock()
		if _, found := clients[ip]; !found {
			clients[ip] = &client{
				limiter: rate.NewLimiter(
					rate.Limit(rps), burst,
				),
			}
		}
		clients[ip].lastSeen = time.Now()
		if !clients[ip].limiter.Allow() {
			mu.Unlock()
			return c.SendStatus(http.StatusTooManyRequests)
		}
		mu.Unlock()

		return c.Next()
	}
}
