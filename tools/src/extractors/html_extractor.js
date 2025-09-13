function extract(tree, config) {
    const results = { elements: [], scripts: [] };
    function traverse(node) {
        if (node.type === 'element') {
            const tagNameNode = node.child(1);
            if (tagNameNode) results.elements.push({ tag: tagNameNode.text });
        }
        if (node.type === 'script_element') {
            const srcAttribute = node.children.find(c => c.type === 'attribute' && c.child(0)?.text === 'src');
            if (srcAttribute) {
                const srcValue = srcAttribute.child(2);
                if (srcValue) results.scripts.push({ src: srcValue.text });
            }
        }
        for (const child of node.children) traverse(child);
    }
    traverse(tree.rootNode);
    return results;
}
module.exports = { extract };
