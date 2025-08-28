// src/extractors/py_extractor.js - MANUAL TRAVERSAL VERSION

function extract(tree, config) {
    const results = { functions: [], classes: [], imports: [], calls: [] };

    function traverse(node) {
        if (node.type === 'function_definition') {
            const nameNode = node.childForFieldName('name');
            if (nameNode && !results.functions.some(f => f.name === nameNode.text)) {
                results.functions.push({ name: nameNode.text });
            }
        }

        if (node.type === 'class_definition') {
            const nameNode = node.childForFieldName('name');
            if (nameNode && !results.classes.some(c => c.name === nameNode.text)) {
                results.classes.push({ name: nameNode.text });
            }
        }

        if (node.type === 'import_statement') {
            const sourceNode = node.child(0); // Simple assumption for import
            if (sourceNode && !results.imports.some(i => i.source === sourceNode.text)) {
                 results.imports.push({ source: sourceNode.text });
            }
        }
        
        if (node.type === 'from_import_statement') {
            const sourceNode = node.childForFieldName('module_name');
             if (sourceNode && !results.imports.some(i => i.source === sourceNode.text)) {
                 results.imports.push({ source: sourceNode.text });
            }
        }

        if (node.type === 'call') {
            const funcNode = node.childForFieldName('function');
            if (funcNode) {
                results.calls.push({ name: funcNode.text });
            }
        }
        
        for (const child of node.children) {
            traverse(child);
        }
    }

    traverse(tree.rootNode);
    return results;
}

module.exports = { extract };
