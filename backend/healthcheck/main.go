package main

import (
	"net/http"
	"os"
)

func main() {
  resp, err := http.Get("http://localhost:8080")
  if err != nil || resp.StatusCode != 200 {
    os.Exit(1)
  }
}
