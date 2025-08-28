// src/extractors/go_extractor.js - MANUAL TRAVERSAL VERSION

function extract(tree, config) {
    const results = { package: null, functions: [], structs: [], imports: [], calls: [] };

    function traverse(node) {
        if (node.type === 'package_clause') {
            results.package = node.childForFieldName('name')?.text || null;
        }

        if (node.type === 'import_spec') {
            const pathNode = node.childForFieldName('path');
            if (pathNode && !results.imports.some(i => i.path === pathNode.text)) {
                results.imports.push({ path: pathNode.text });
            }
        }

        if (node.type === 'function_declaration') {
            const nameNode = node.childForFieldName('name');
            if (nameNode && !results.functions.some(f => f.name === nameNode.text)) {
                results.functions.push({ name: nameNode.text });
            }
        }

        if (node.type === 'type_spec' && node.childForFieldName('type')?.type === 'struct_type') {
            const nameNode = node.childForFieldName('name');
            if (nameNode && !results.structs.some(s => s.name === nameNode.text)) {
                 results.structs.push({ name: nameNode.text });
            }
        }
        
        if (node.type === 'call_expression') {
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
