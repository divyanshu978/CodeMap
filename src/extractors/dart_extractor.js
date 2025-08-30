function extract(tree, config) {
    const results = { functions: [], classes: [], imports: [] };
    function traverse(node) {
        if (node.type === 'function_signature') {
            const nameNode = node.childForFieldName('name');
            if (nameNode) results.functions.push({ name: nameNode.text });
        }
        if (node.type === 'class_definition') {
            const nameNode = node.childForFieldName('name');
            if (nameNode) results.classes.push({ name: nameNode.text });
        }
        if (node.type === 'import_directive') {
            const uriNode = node.childForFieldName('uri');
            if (uriNode) results.imports.push({ source: uriNode.text });
        }
        for (const child of node.children) traverse(child);
    }
    traverse(tree.rootNode);
    return results;
}
module.exports = { extract };
