function extract(tree, config) {
    const results = { functions: [], classes: [], imports: [] };
    function traverse(node) {
        if (node.type === 'function_declaration') {
            const nameNode = node.childForFieldName('name');
            if (nameNode) results.functions.push({ name: nameNode.text });
        }
        if (node.type === 'class_declaration' || node.type === 'struct_declaration') {
            const nameNode = node.childForFieldName('name');
            if (nameNode) results.classes.push({ name: nameNode.text });
        }
        if (node.type === 'import_declaration') {
            const pathNode = node.childForFieldName('path');
            if (pathNode) results.imports.push({ source: pathNode.text });
        }
        for (const child of node.children) traverse(child);
    }
    traverse(tree.rootNode);
    return results;
}
module.exports = { extract };
