package main

import (
	"embed"
	"io/fs"
	"log"
)

//go:embed all:spa_assets
var assets embed.FS

//go:embed all:spa_routes
var routes embed.FS

func createFsWithSub(f embed.FS, sub string) fs.FS {
	build, err := fs.Sub(f, sub)
	if err != nil {
		log.Fatal(err)
	}
	return build
}

var AssetFS = createFsWithSub(assets, "spa_assets")
var RoutesFS = createFsWithSub(routes, "spa_routes")
