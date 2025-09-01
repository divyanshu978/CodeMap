const Parser = require('tree-sitter');
const fs = require('fs');
const path = require('path');
const { languageConfig, ignoreExtensions } = require('./language');

const parser = new Parser();

// --- Centralized list of directories to completely ignore ---
const ignoreDirs = new Set(['.git', 'node_modules', 'temp-uploads', 'temp-clones']);

function analyzeFile(filePath) {
    const extension = path.extname(filePath);

    // Skip files based on extension or if they have no extension
    if (ignoreExtensions.has(extension) || extension === '') {
        return null;
    }

    const config = languageConfig[extension];

    // Skip files for which we have no defined language configuration
    if (!config) {
        console.log(`[Processor] Skipping unsupported file type: ${filePath}`);
        return null;
    }

    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        parser.setLanguage(config.grammar);
        const tree = parser.parse(fileContent);
        const analysis = config.extractor.extract(tree, config);

        return {
            path: filePath,
            language: config.grammar.name,
            ...analysis,
        };
    } catch (err) {
        // --- Enhanced Error Handling ---
        // Specifically check for the known parser incompatibility error
        if (err.message && err.message.includes('Invalid language object')) {
            console.error(`[Processor CRITICAL] The parser for ${extension} is incompatible. Skipping file: ${filePath}`);
        } else {
            console.error(`[Processor] Failed to parse ${filePath}. Error: ${err.message}`);
        }
        // Return a structured error object for the final report
        return {
            path: filePath,
            error: `Failed to parse file due to an internal parser error.`,
        };
    }
}

function analyzeDirectory(directoryPath) {
    let results = [];
    let items;

    try {
        items = fs.readdirSync(directoryPath);
    } catch (err) {
        console.error(`[Processor] Could not read directory: ${directoryPath}. Skipping.`);
        return []; // Return empty array if directory is inaccessible
    }

    for (const item of items) {
        // Check if the directory itself should be ignored
        if (ignoreDirs.has(item)) {
            continue; // Skip this directory entirely
        }

        const itemPath = path.join(directoryPath, item);
        let stat;

        try {
            stat = fs.statSync(itemPath);
        } catch (err) {
            console.error(`[Processor] Could not access item stats: ${itemPath}. Skipping.`);
            continue;
        }

        if (stat.isDirectory()) {
            results = results.concat(analyzeDirectory(itemPath));
        } else {
            const fileAnalysis = analyzeFile(itemPath);
            if (fileAnalysis) {
                results.push(fileAnalysis);
            }
        }
    }
    return results;
}

module.exports = { analyzeDirectory };
