// backend/cmd/api/handlers.go
package main

import (
	"archive/zip"
	"codemap/backend/internal/analysis"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// healthCheckHandler is a simple handler to confirm the API is running.
func (app *application) healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	data := map[string]string{
		"status":      "available",
		"environment": "development",
		"version":     "1.0.0",
	}
	app.writeJSON(w, http.StatusOK, data)
}

// uploadHandler handles the file upload and analysis process.
func (app *application) uploadHandler(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(32 << 20); err != nil { // 32MB max
		app.errorResponse(w, r, http.StatusBadRequest, "Could not parse multipart form.")
		return
	}
	file, handler, err := r.FormFile("codebase")
	if err != nil {
		app.errorResponse(w, r, http.StatusBadRequest, "Could not retrieve the file from form.")
		return
	}
	defer file.Close()
	// Use configured path for temporary uploads
	tempDir, err := os.MkdirTemp(app.config.TempUploads, "codemap-upload-*")
	if err != nil {
		app.errorResponse(w, r, http.StatusInternalServerError, "Could not create temp directory.")
		return
	}
	defer os.RemoveAll(tempDir)
	zipPath := filepath.Join(tempDir, handler.Filename)
	tempFile, err := os.Create(zipPath)
	if err != nil {
		app.errorResponse(w, r, http.StatusInternalServerError, "Could not create temp file.")
		return
	}
	_, err = io.Copy(tempFile, file)
	tempFile.Close() // Close file before unzipping
	if err != nil {
		app.errorResponse(w, r, http.StatusInternalServerError, "Could not save uploaded file.")
		return
	}
	// Unzip the file into a subdirectory
	unzipDest := filepath.Join(tempDir, "unzipped")
	if err := unzip(zipPath, unzipDest); err != nil {
		app.errorResponse(w, r, http.StatusInternalServerError, fmt.Sprintf("Failed to unzip file: %v", err))
		return
	}
	// Pass the configured tools path and the unzipped directory to the runner
	analysisResult, err := analysis.Run(app.config.ToolsPath, unzipDest)
	if err != nil {
		app.errorResponse(w, r, http.StatusInternalServerError, err.Error())
		return
	}
	// Import the result into Neo4j
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute) // 5-minute timeout for import
	defer cancel()
	if err := app.db.ImportAnalysis(ctx, analysisResult); err != nil {
		app.errorResponse(w, r, http.StatusInternalServerError, fmt.Sprintf("Failed to import data to Neo4j: %v", err))
		return
	}
	// Send a success response
	app.writeJSON(w, http.StatusAccepted, map[string]string{
		"message": "Upload successful. Codebase has been analyzed and imported.",
	})
}

// analyzeLocalHandler processes a local directory without requiring upload.
func (app *application) analyzeLocalHandler(w http.ResponseWriter, r *http.Request) {
	var payload struct {
		Path string `json:"path"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		app.errorResponse(w, r, http.StatusBadRequest, "Invalid JSON payload")
		return
	}
	if payload.Path == "" {
		app.errorResponse(w, r, http.StatusBadRequest, "Path is required")
		return
	}
	// Check if the directory exists
	if _, err := os.Stat(payload.Path); os.IsNotExist(err) {
		app.errorResponse(w, r, http.StatusBadRequest, fmt.Sprintf("Directory does not exist: %s", payload.Path))
		return
	}
	// Run analysis directly on the local directory
	analysisResult, err := analysis.Run(app.config.ToolsPath, payload.Path)
	if err != nil {
		app.errorResponse(w, r, http.StatusInternalServerError, err.Error())
		return
	}
	// Import to Neo4j
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Minute)
	defer cancel()
	if err := app.db.ImportAnalysis(ctx, analysisResult); err != nil {
		app.errorResponse(w, r, http.StatusInternalServerError, fmt.Sprintf("Failed to import data to Neo4j: %v", err))
		return
	}
	app.writeJSON(w, http.StatusOK, map[string]string{
		"message":       "Local directory analyzed and imported successfully.",
		"analyzed_path": payload.Path,
	})
}

// queryHandler accepts a POST request with a Cypher query and returns the result.
func (app *application) queryHandler(w http.ResponseWriter, r *http.Request) {
	var payload struct {
		Query  string         `json:"query"`
		Params map[string]any `json:"params"`
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		app.errorResponse(w, r, http.StatusBadRequest, "Invalid JSON payload")
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// --- THE ONLY CHANGE IS HERE ---
	// The handler now calls the database method, keeping the logic separate.
	results, err := app.db.Query(ctx, payload.Query, payload.Params)
	if err != nil {
		app.errorResponse(w, r, http.StatusInternalServerError, fmt.Sprintf("Failed to execute query: %v", err))
		return
	}
	// -----------------------------

	// Send the results back as JSON.
	app.writeJSON(w, http.StatusOK, results)
}

// --- HELPER METHODS ---

// writeJSON is a helper for sending JSON responses.
func (app *application) writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		app.logError(nil, err)
	}
}

// errorResponse is a helper for sending consistent error messages.
func (app *application) errorResponse(w http.ResponseWriter, r *http.Request, status int, message string) {
	errData := map[string]string{"error": message}
	app.writeJSON(w, status, errData)
}

// logError is a helper for logging errors.
func (app *application) logError(r *http.Request, err error) {
	app.logger.Println(err)
}

// unzip function to extract a zip archive.
func unzip(src, dest string) error {
	r, err := zip.OpenReader(src)
	if err != nil {
		return err
	}
	defer r.Close()
	os.MkdirAll(dest, 0755)
	for _, f := range r.File {
		fpath := filepath.Join(dest, f.Name)
		if !strings.HasPrefix(fpath, filepath.Clean(dest)+string(os.PathSeparator)) {
			return fmt.Errorf("%s: illegal file path", fpath)
		}
		if f.FileInfo().IsDir() {
			os.MkdirAll(fpath, os.ModePerm)
			continue
		}
		if err := os.MkdirAll(filepath.Dir(fpath), os.ModePerm); err != nil {
			return err
		}
		outFile, err := os.OpenFile(fpath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, f.Mode())
		if err != nil {
			return err
		}
		rc, err := f.Open()
		if err != nil {
			return err
		}
		_, err = io.Copy(outFile, rc)
		outFile.Close()
		rc.Close()
		if err != nil {
			return err
		}
	}
	return nil
}
