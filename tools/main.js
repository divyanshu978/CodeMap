// tools/main.js
const fs = require('fs');
const path = require('path');
const { processFile } = require('./src/file_processor');

// Get the target directory from the command-line arguments.
// process.argv[0] is 'node', process.argv[1] is 'main.js'.
const targetDir = process.argv[2];

if (!targetDir) {
  console.error('Error: Please provide a directory to analyze.');
  process.exit(1);
}

// This function recursively walks through a directory and finds all files.
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      // Ignore node_modules directories.
      if (path.basename(fullPath) !== 'node_modules') {
        getAllFiles(fullPath, arrayOfFiles);
      }
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

// --- Main Execution Logic ---
try {
  const allFilePaths = getAllFiles(targetDir);
  const analysisResults = [];

  for (const filePath of allFilePaths) {
    const fileAnalysis = processFile(filePath, targetDir);
    if (fileAnalysis) {
      analysisResults.push(fileAnalysis);
    }
  }

  const finalOutput = {
    files: analysisResults,
  };

  // The most important step: Print the final JSON to standard output.
  // The Go backend will capture this output.
  console.log(JSON.stringify(finalOutput, null, 2));

} catch (error) {
  console.error(`Error during analysis: ${error.message}`);
  process.exit(1);
}
