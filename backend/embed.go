package main

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
	"os"
)

//go:embed all:spa
var BuildFs embed.FS

func BuildHTTPFS() http.FileSystem {
	build, err := fs.Sub(BuildFs, "spa")
	if err != nil {
		log.Fatal(err)
	}
	return HTMLFS{http.FS(build)}
}

type HTMLFS struct {
	d http.FileSystem
}

func (d HTMLFS) Open(name string) (http.File, error) {
	f, err := d.d.Open(name)
	if os.IsNotExist(err) {
		if f, err := d.d.Open(name + ".html"); err == nil {
			return f, nil
		}
	}
	return f, err
}
