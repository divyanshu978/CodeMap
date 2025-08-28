const { analyzeDirectory } = require('./src/file_processor');

// const projectPath = './sample';
// main.js
const projectPath = process.argv[2] || './sample'; // Use command-line arg if provided



console.log(`Starting analysis of directory: ${projectPath}`);

try {
    const analysisResults = analyzeDirectory(projectPath);

    const finalOutput = {
        files: analysisResults,
    };

    console.log("\n--- Analysis Complete ---");
    console.log(JSON.stringify(finalOutput, null, 2));
} catch (error) {
    console.error(`Failed to analyze directory: ${error.message}`);
}
