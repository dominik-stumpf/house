package main

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
)

//go:embed all:spa
var BuildFs embed.FS

func BuildHTTPFS() http.FileSystem {
	build, err := fs.Sub(BuildFs, "spa")
	if err != nil {
		log.Fatal(err)
	}
	return http.FS(build)
}
