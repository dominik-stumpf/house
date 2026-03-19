package main

import (
	"backend/polife"
	"backend/store"
	"bytes"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"slices"
	"strings"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/log"
	"github.com/gofiber/fiber/v3/middleware/limiter"
	"github.com/gofiber/fiber/v3/middleware/static"
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
		// log.Printf("%s %s",uri.Path(), resolved)
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

func HtmlNotFound(c fiber.Ctx) error {
	return c.SendFile("404.html", fiber.SendFile{FS: RoutesFS, Compress: true})
}

func RemoveLastModified(c fiber.Ctx) error {
	err := c.Next()
	if err != nil {
		return err
	}
	c.Response().Header.Del("last-modified")
	return nil
}

func main() {
	app := fiber.New(fiber.Config{
		IdleTimeout: 10 * time.Second,
		ReadTimeout:  5 * time.Second,
	    WriteTimeout: 60 * time.Second,
	})

	app.Use(limiter.New(limiter.Config{
		MaxFunc: func(c fiber.Ctx) int {
	      if strings.HasPrefix(c.Path(), "/api") {
	        return 100
	      }
	      return 300
	    },
		ExpirationFunc: func(c fiber.Ctx) time.Duration {
	      if strings.HasPrefix(c.Path(), "/api") {
	        return 2 * time.Minute
	      }
	      return 30 * time.Second
	    },
	    LimiterMiddleware: limiter.SlidingWindow{},
	}))

	polife.RegisterRoutes(app)
	store.RegisterRoutes(app)

	app.Get("*", RemoveTrailingSlash, RemoveLastModified, ResolveNoHTMLExtension, static.New("", static.Config{
	    FS:     RoutesFS,
		MaxAge: 0,
		Compress: true,
		IndexNames: []string{},
	}))
	app.Get("*", RemoveTrailingSlash, RemoveLastModified, static.New("", static.Config{
		FS:              AssetFS,
		IndexNames:      []string{},
		Compress:        true,
		MaxAge:          31536000, // 1 year
		NotFoundHandler: HtmlNotFound,
	}))

	log.Fatal(app.Listen(fmt.Sprintf(":%s", os.Getenv("PORT"))))
}
