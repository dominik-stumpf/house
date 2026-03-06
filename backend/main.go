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
		return c.Redirect().Status(fiber.StatusPermanentRedirect).To(uri.String())
	}

	return c.Next()
}

func HtmlNotFound(c fiber.Ctx) error {
	file, err := RoutesFS.Open("404.html")
	if err != nil {
		return err
	}
	c.RequestCtx().SetContentType("text/html")
	return c.SendStream(file)
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
	godotenv.Load()
	app := fiber.New()
	app.Use(RemoveTrailingSlash, RemoveLastModified)
	app.Get("*", ResolveNoHTMLExtension, static.New("", static.Config{
	    FS:     RoutesFS,
		MaxAge: 0,
		Compress: true,
		IndexNames: []string{},
	}))
	app.Get("*", static.New("", static.Config{
	    FS:     AssetFS,
		IndexNames: []string{},
		Compress: true,
		MaxAge: 31536000, // 1 year
		NotFoundHandler: HtmlNotFound,
	}))
	log.Fatal(app.Listen(fmt.Sprintf(":%s", os.Getenv("APP_PORT"))))
}
