// backend/cmd/api/routes.go
package main

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func (app *application) routes() http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.Recoverer)
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)

	// API v1 routes
	r.Route("/v1", func(r chi.Router) {
		r.Get("/healthcheck", app.healthCheckHandler)
		r.Post("/upload", app.uploadHandler)
		r.Post("/analyze-local",app.analyzeLocalHandler)
		r.Post("/query", app.queryHandler)
	})

	return r
}
