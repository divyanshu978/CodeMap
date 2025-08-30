function extract(tree, config) {
    const results = { functions: [], classes: [], imports: [] };
    function traverse(node) {
        if (node.type === 'function_declaration') {
            const nameNode = node.childForFieldName('name');
            if (nameNode) results.functions.push({ name: nameNode.text });
        }
        if (node.type === 'class_declaration') {
            const nameNode = node.childForFieldName('name');
            if (nameNode) results.classes.push({ name: nameNode.text });
        }
        if (node.type === 'import_header') {
            node.children.forEach(imp => {
                if (imp.type === 'import_alias') {
                    results.imports.push({ source: imp.text });
                }
            });
        }
        for (const child of node.children) traverse(child);
    }
    traverse(tree.rootNode);
    return results;
}
module.exports = { extract };
