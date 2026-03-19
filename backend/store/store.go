package store

import (
	"database/sql"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/log"

	// _ "github.com/mattn/go-sqlite3"
	_ "modernc.org/sqlite"
)

func initDB() *sql.DB {
	if os.Getenv("ENV") == "development" {
		os.Mkdir("./data", 0o770)
	}
	db, err := sql.Open("sqlite", "./data/main.db")
	if err != nil {
		log.Fatal(err)
	}

	_, err = db.Exec(`
	CREATE TABLE IF NOT EXISTS visits (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		published_at DATE NOT NULL,
		created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
	);
	`)

	if err != nil {
		log.Fatal(err)
	}

	log.Info("db init")

	return db;
}

func RegisterRoutes(app *fiber.App) {
	db := initDB()
	app.Get("api/read/:date", func(c fiber.Ctx) error {
			date, err := strconv.ParseInt(c.Params("date"), 10, 64)
		    if err != nil {
				c.Status(fiber.StatusBadRequest)
				return nil
		    }
		    tm := time.Unix(date, 0)
			if tm.Year() < 2020 || tm.Year() > 2040 {
				c.Status(fiber.StatusBadRequest)
				return nil
			}
			_, err = db.Exec(`INSERT INTO visits (published_at) VALUES (?)`, tm.Format(time.DateOnly))
			if err != nil {
			   fmt.Printf("insert err %s", err)
			}
		    fmt.Println(tm)
			c.Status(fiber.StatusNoContent)
			return nil
		})

	app.Get("api/dates", func(c fiber.Ctx) error {
		rows, err := db.Query(`
			SELECT published_at, count(published_at) FROM visits
			GROUP BY published_at;
		`)
		if err != nil {
			log.Error(err)
			c.Status(fiber.StatusInternalServerError)
			return err
		}
		defer rows.Close()
		visits := map[string]int{};
		for rows.Next() {
			var publishedAt time.Time
			var count int
			if err := rows.Scan(&publishedAt, &count); err != nil {
				log.Error(err)
			}
			visits[publishedAt.Format(time.DateOnly)] = count
		}
		return c.Status(fiber.StatusOK).JSON(visits)
	})
}
