function extract(tree, config) {
    const results = { selectors: [], imports: [] };
    function traverse(node) {
        if (node.type === 'class_selector') {
            results.selectors.push({ name: node.text });
        }
        if (node.type === 'import_statement') {
            const uriNode = node.children.find(c => c.type === 'string_value');
            if (uriNode) results.imports.push({ source: uriNode.text });
        }
        for (const child of node.children) traverse(child);
    }
    traverse(tree.rootNode);
    return results;
}
module.exports = { extract };
