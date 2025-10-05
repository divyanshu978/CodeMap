package main

import (
	"codemap/backend/internal/config"
	"codemap/backend/internal/database"
	"codemap/backend/internal/s3"
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/joho/godotenv"
)

type application struct {
	config *config.AppConfig
	db     *database.DB
	logger *log.Logger
	s3     *s3.Service
}

func main() {

	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using system environment variables.")
	}

	logger := log.New(os.Stdout, "", log.Ldate|log.Ltime)

	cfg := config.Load()

	db, err := database.NewDB(cfg)
	if err != nil {
		logger.Fatalf("Could not connect to database: %v", err)
	}
	defer db.Close(context.Background())

	s3Service, err := s3.NewS3Service(cfg.S3Region, cfg.AWSAccessKey, cfg.AWSSecretKey, cfg.S3Bucket)
	if err != nil {
		logger.Fatalf("Could not initialize S3 service: %v", err)
	}

	app := &application{
		config: cfg,
		db:     db,
		logger: logger,
		s3:     s3Service,
	}

	srv := &http.Server{
		Addr:         fmt.Sprintf(":%s", cfg.Port),
		Handler:      app.routes(),
		ErrorLog:     log.New(logger.Writer(), "", 0),
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	shutdownError := make(chan error)

	go func() {
		quit := make(chan os.Signal, 1)
		signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
		s := <-quit

		logger.Printf("Caught signal: %v. Shutting down server...", s)

		ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
		defer cancel()

		shutdownError <- srv.Shutdown(ctx)
	}()

	logger.Printf("Starting server on %s", srv.Addr)

	err = srv.ListenAndServe()
	if !errors.Is(err, http.ErrServerClosed) {
		logger.Fatalf("Server error: %v", err)
	}

	err = <-shutdownError
	if err != nil {
		logger.Fatalf("Error during shutdown: %v", err)
	}

	logger.Println("Server stopped gracefully.")
}
