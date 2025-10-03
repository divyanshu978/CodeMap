// backend/internal/analysis/runner.go
package analysis

import (
	"bytes"
	"codemap/backend/internal/models"
	"encoding/json"
	"fmt"
	"os/exec"
)

// Run executes the Node.js analysis tool and returns the parsed data.
func Run(toolsPath string, targetDir string) (*models.Analysis, error) {

	// The command and its directory are now configured externally.
	cmd := exec.Command("node", "main.js", targetDir)
	cmd.Dir = toolsPath 

	fmt.Printf("Running analysis tool in: %s\n", toolsPath)
	fmt.Printf("Target directory: %s\n", targetDir)
	
	// Capture stdout and stderr separately
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	
	err := cmd.Run()
	if err != nil {
		return nil, fmt.Errorf("failed to run analysis tool: %w\nStderr: %s", err, stderr.String())
	}
	
	// Log stderr for debugging (contains console.error and console.log messages from the tool)
	if stderr.Len() > 0 {
		fmt.Printf("Analysis tool stderr:\n%s\n", stderr.String())
	}

	// Only parse stdout which contains the JSON
	output := stdout.Bytes()
	if len(output) == 0 {
		return nil, fmt.Errorf("no output received from analysis tool")
	}
	
	var analysisResult models.Analysis
	err = json.Unmarshal(output, &analysisResult)
	if err != nil {
		// Show what we received to help debug
		if len(output) > 500 {
			return nil, fmt.Errorf("failed to unmarshal analysis result: %w\nOutput preview: %s...", err, string(output[:500]))
		}
		return nil, fmt.Errorf("failed to unmarshal analysis result: %w\nOutput received: %s", err, string(output))
	}

	fmt.Printf("Successfully parsed analysis output. Found %d files.\n", len(analysisResult.Files))
	return &analysisResult, nil
}
