package main

import (
	"log"
	"net/http"
)

const port = "8080"

func main() {
	http.HandleFunc("/", handleSPA)
	log.Println("the server is listening to port", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func handleSPA(w http.ResponseWriter, r *http.Request) {
	log.Println(r.RequestURI)
	http.FileServer(BuildHTTPFS()).ServeHTTP(w, r)
}
