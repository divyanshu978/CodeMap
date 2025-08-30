function extract(tree, config) {
    const results = { functions: [], classes: [], imports: [], exports: [] };
    function traverse(node) {
        if (node.type === 'function_declaration') {
            const nameNode = node.childForFieldName('name');
            if (nameNode) results.functions.push({ name: nameNode.text, exported: false });
        }
        if (node.type === 'class_declaration') {
            const nameNode = node.childForFieldName('name');
            if (nameNode) results.classes.push({ name: nameNode.text, exported: false });
        }
        if (node.type === 'import_statement') {
            const sourceNode = node.childForFieldName('source');
            if (sourceNode) results.imports.push({ source: sourceNode.text });
        }
        if (node.type === 'export_statement' && node.declaration) {
            const declaration = node.declaration;
            if (declaration.type === 'function_declaration' || declaration.type === 'class_declaration') {
                const nameNode = declaration.childForFieldName('name');
                if (nameNode) {
                    const exportedName = nameNode.text;
                    if (!results.exports.some(e => e.name === exportedName)) {
                        results.exports.push({ name: exportedName });
                    }
                    const func = results.functions.find(f => f.name === exportedName);
                    if (func) func.exported = true;
                    const cls = results.classes.find(c => c.name === exportedName);
                    if (cls) cls.exported = true;
                }
            }
        }
        for (const child of node.children) traverse(child);
    }
    traverse(tree.rootNode);
    return results;
}
module.exports = { extract };
