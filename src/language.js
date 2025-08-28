const JavaScript = require('tree-sitter-javascript');
const Python = require('tree-sitter-python');
const Go = require('tree-sitter-go'); // <-- 1. Import the Go grammar

const jsExtractor = require('./extractors/js_extractor');
const pyExtractor = require('./extractors/py_extractor');
const goExtractor = require('./extractors/go_extractor'); // <-- 2. Import the Go extractor

// This map now holds the grammar AND the correct extractor for each language.
const languageConfig = {
    '.js': { grammar: JavaScript, extractor: jsExtractor },
    '.py': { grammar: Python, extractor: pyExtractor },
    '.go': { grammar: Go, extractor: goExtractor }, 
};

module.exports = languageConfig;
