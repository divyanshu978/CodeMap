package analysis

import (
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
	output, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("failed to run analysis tool: %w\nOutput: %s", err, string(output))
	}

	var analysisResult models.Analysis
	err = json.Unmarshal(output, &analysisResult)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal analysis result: %w", err)
	}

	fmt.Println("Successfully parsed analysis output.")
	return &analysisResult, nil
}
