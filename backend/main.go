package main

import (
	"backend/mware"
	"backend/polife"
	"backend/store"
	"fmt"
	"os"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/log"
	"github.com/gofiber/fiber/v3/middleware/static"
)

// TODO: move to mware, move embed
func HtmlNotFound(c fiber.Ctx) error {
	return c.SendFile("404.html", fiber.SendFile{FS: RoutesFS, Compress: true})
}

func main() {
	app := fiber.New(fiber.Config{
		IdleTimeout: 10 * time.Second,
		ReadTimeout:  5 * time.Second,
	    WriteTimeout: 60 * time.Second,
	})

	app.Use(mware.IPRateLimit(3 * time.Minute, 10, 200))

	polife.RegisterRoutes(app)
	store.RegisterRoutes(app)

	app.Get("*", mware.RemoveTrailingSlash, mware.RemoveLastModified, mware.ResolveNoHTMLExtension, static.New("", static.Config{
	    FS:     RoutesFS,
		MaxAge: 0,
		Compress: true,
		IndexNames: []string{},
	}))
	app.Get("*", mware.RemoveTrailingSlash, mware.RemoveLastModified, static.New("", static.Config{
		FS:              AssetFS,
		IndexNames:      []string{},
		Compress:        true,
		MaxAge:          31536000, // 1 year
		NotFoundHandler: HtmlNotFound,
	}))

	log.Fatal(app.Listen(fmt.Sprintf(":%s", os.Getenv("PORT"))))
}
