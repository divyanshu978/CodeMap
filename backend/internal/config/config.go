// // backend/internal/config/config.go
package config

import (
	// "log"
	"os"
)

// AppConfig holds the application configuration.
type AppConfig struct {
	Port         string
	Neo4jURI     string
	Neo4jUser    string
	Neo4jPass    string
	ToolsPath    string // Path to the Node.js tools directory
	TempUploads  string // Path for temporary file uploads
}

// getEnv reads an environment variable or returns a default value.
func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

// Load loads configuration from environment variables or uses defaults.
func Load() *AppConfig {
	return &AppConfig{
		Port:         getEnv("PORT", "8080"),
		Neo4jURI:     getEnv("NEO4J_URI", "neo4j://127.0.0.1:7687"),
		Neo4jUser:    getEnv("NEO4J_USER", "neo4j"),
		Neo4jPass:    getEnv("NEO4J_PASS", "12345678"), // IMPORTANT: Change this or set env var
		ToolsPath:    getEnv("TOOLS_PATH", "../../../tools"), // Default for local dev
		TempUploads:  getEnv("TEMP_UPLOADS", os.TempDir()), // Use system's temp dir
	}
}
