package main

import (
	"bytes"
	"errors"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"slices"
	"strings"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/static"
	"github.com/joho/godotenv"
)

func ResolveNoHTMLExtension(c fiber.Ctx) error {
	uri := c.Request().URI()
	path := uri.Path()
	extension := filepath.Ext(string(uri.LastPathSegment()))
	isRoot := slices.Equal(path, []byte("/"))

	if extension == "" && !isRoot{
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

func RemoveTrailingSlash() fiber.Handler {
	return func(c fiber.Ctx) error {
		path := c.Path()

		if path != "/" && strings.HasSuffix(path, "/") {
			newPath := strings.TrimSuffix(path, "/")
			uri := c.Request().URI()
			uri.SetPath(newPath)
			return c.Redirect().Status(fiber.StatusPermanentRedirect).To(uri.String())
		}

		return c.Next()
	}
}

func main() {
	godotenv.Load()
	app := fiber.New()
	app.Use(RemoveTrailingSlash())
	app.Get("/health", handleHealth)
	app.Get("*", static.New("", static.Config{
	    FS:     AssetFS,
		IndexNames: []string{},
		MaxAge: 31536000, // 1 year
	}))
	app.Get("*", ResolveNoHTMLExtension, static.New("", static.Config{
	    FS:     RoutesFS,
		MaxAge: 0,
	}))

	log.Fatal(app.Listen(fmt.Sprintf(":%s", os.Getenv("APP_PORT"))))
}

func handleHealth(c fiber.Ctx) error {
	return c.SendString("OK o7")
}
