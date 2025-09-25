package main

import (
	"log"
	"net/http"
	"os"
)

const port = "8080"

func main() {
	http.HandleFunc("/", handleSPA)
	log.Println("the server is listening to port", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func handleSPA(w http.ResponseWriter, r *http.Request) {
	http.FileServer(HTMLDir{http.Dir("spa")}).ServeHTTP(w, r)
}

type HTMLDir struct {
	d http.Dir
}

func (d HTMLDir) Open(name string) (http.File, error) {
	f, err := d.d.Open(name)
	if os.IsNotExist(err) {
		if f, err := d.d.Open(name + ".html"); err == nil {
			return f, nil
		}
	}
	return f, err
}
