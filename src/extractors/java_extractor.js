function extract(tree, config) {
    const results = { functions: [], classes: [], imports: [] };
    function traverse(node) {
        if (node.type === 'method_declaration') {
            const nameNode = node.childForFieldName('name');
            if (nameNode) results.functions.push({ name: nameNode.text });
        }
        if (node.type === 'class_declaration') {
            const nameNode = node.childForFieldName('name');
            if (nameNode) results.classes.push({ name: nameNode.text });
        }
        if (node.type === 'import_declaration') {
            const nameNode = node.childForFieldName('name');
            if (nameNode) results.imports.push({ source: nameNode.text });
        }
        for (const child of node.children) traverse(child);
    }
    traverse(tree.rootNode);
    return results;
}
module.exports = { extract };
