// src/file_processor.js - CORRECTED

const Parser = require('tree-sitter');
const fs = require('fs');
const path = require('path');
const languageConfig = require('./language');

const parser = new Parser();

function analyzeFile(filePath) {
    const extension = path.extname(filePath);
    const config = languageConfig[extension];

    if (!config) {
        return null;
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    parser.setLanguage(config.grammar);
    const tree = parser.parse(fileContent);

    // Pass the entire config object to the extractor
    const analysis = config.extractor.extract(tree, config);

    return {
        path: filePath,
        language: config.grammar.name,
        ...analysis,
    };
}

function analyzeDirectory(directoryPath) {
    let results = [];
    const items = fs.readdirSync(directoryPath);

    for (const item of items) {
        const itemPath = path.join(directoryPath, item);
        const stat = fs.statSync(itemPath);

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
