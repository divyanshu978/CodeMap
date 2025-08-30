function extract(tree, config) {
    const results = { pairs: 0, hasRootObject: false };

    function traverse(node) {
        if (node.type === 'document' && node.child(0)?.type === 'object') {
            results.hasRootObject = true;
        }
        if (node.type === 'pair') {
            results.pairs++;
        }
        for (const child of node.children) {
            traverse(child);
        }
    }

    traverse(tree.rootNode);
    return results;
}

module.exports = { extract };
