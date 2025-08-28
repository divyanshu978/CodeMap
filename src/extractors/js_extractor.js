// src/extractors/js_extractor.js - MANUAL TRAVERSAL VERSION

function extract(tree, config) {
    const results = { functions: [], classes: [], imports: [], exports: [] };

    function traverse(node) {
        // Find function declarations
        if (node.type === 'function_declaration') {
            const nameNode = node.childForFieldName('name');
            if (nameNode) {
                results.functions.push({ name: nameNode.text, exported: false });
            }
        }
        
        // Find class declarations
        if (node.type === 'class_declaration') {
            const nameNode = node.childForFieldName('name');
            if (nameNode) {
                 results.classes.push({ name: nameNode.text, exported: false });
            }
        }

        // Find import statements
        if (node.type === 'import_statement') {
            const sourceNode = node.childForFieldName('source');
            if (sourceNode) {
                results.imports.push({ source: sourceNode.text });
            }
        }

        // Find export statements
        if (node.type === 'export_statement' && node.declaration) {
            const declaration = node.declaration;
            // Check what is being exported (function, class, etc.)
            if (declaration.type === 'function_declaration' || declaration.type === 'class_declaration') {
                const nameNode = declaration.childForFieldName('name');
                if (nameNode) {
                    const exportedName = nameNode.text;
                     if (!results.exports.some(e => e.name === exportedName)) {
                        results.exports.push({ name: exportedName });
                    }
                    // Mark as exported
                    const func = results.functions.find(f => f.name === exportedName);
                    if (func) func.exported = true;
                    const cls = results.classes.find(c => c.name === exportedName);
                    if (cls) cls.exported = true;
                }
            }
        }

        // Recurse into children
        for (const child of node.children) {
            traverse(child);
        }
    }

    traverse(tree.rootNode);
    return results;
}

module.exports = { extract };
