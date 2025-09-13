function extract(tree, config) {
    const results = { documents: 0, mappings: 0, sequences: 0 };

    function traverse(node) {
        if (node.type === 'document') {
            results.documents++;
        }
        if (node.type === 'block_mapping' || node.type === 'flow_mapping') {
            results.mappings++;
        }
        if (node.type === 'block_sequence' || node.type === 'flow_sequence') {
            results.sequences++;
        }
        for (const child of node.children) {
            traverse(child);
        }
    }

    traverse(tree.rootNode);
    return results;
}

module.exports = { extract };
