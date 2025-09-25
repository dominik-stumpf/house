package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/filesystem"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()
	app := fiber.New()
	app.Get("/health", handleHealth)
	app.Use("/", filesystem.New(filesystem.Config{
		Root:         BuildHTTPFS(),
		NotFoundFile: "index.html",
	}))
	log.Fatal(app.Listen(fmt.Sprintf(":%s", os.Getenv("APP_PORT"))))
}

func handleHealth(c *fiber.Ctx) error {
	return c.SendString("OK")
}
