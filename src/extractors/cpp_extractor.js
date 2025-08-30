function extract(tree, config) {
    const results = { functions: [], classes: [], imports: [] };
    function traverse(node) {
        if (node.type === 'function_definition') {
            const nameNode = node.childForFieldName('declarator')?.childForFieldName('declarator');
            if (nameNode) results.functions.push({ name: nameNode.text });
        }
        if (node.type === 'class_specifier') {
            const nameNode = node.childForFieldName('name');
            if (nameNode) results.classes.push({ name: nameNode.text });
        }
        if (node.type === 'include_directive') {
            const pathNode = node.childForFieldName('path');
            if (pathNode) results.imports.push({ source: pathNode.text });
        }
        for (const child of node.children) traverse(child);
    }
    traverse(tree.rootNode);
    return results;
}
module.exports = { extract };
