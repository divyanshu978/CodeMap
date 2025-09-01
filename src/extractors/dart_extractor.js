function extract(tree, config) {
    const results = { functions: [], classes: [], imports: [] };
    const contextStack = [];

    function getParams(parametersNode) {
        if (!parametersNode) return [];
        return parametersNode.children
            .filter(c => c.type === 'formal_parameter')
            .map(p => p.childForFieldName('name')?.text || '')
            .filter(Boolean);
    }
    
    function traverse(node) {
        let isClassNode = false;
        let isFunctionNode = false;

        if (node.type === 'import_directive') {
            const uriNode = node.childForFieldName('uri');
            if (uriNode) results.imports.push({ source: uriNode.text.replace(/['"]/g, '') });
        }
        
        if (node.type === 'class_definition') {
            const nameNode = node.childForFieldName('name');
            if (nameNode) {
                const classObj = { name: nameNode.text, properties: [], methods: [], is_exported: !nameNode.text.startsWith('_') };
                results.classes.push(classObj);
                contextStack.push(classObj);
                isClassNode = true;
            }
        }
        
        const isFunc = node.type === 'function_signature' && node.parent.type === 'function_declaration' || node.type === 'method_signature';
        if (isFunc) {
            const nameNode = node.childForFieldName('name');
            const paramsNode = node.childForFieldName('parameters');
            if (nameNode) {
                const currentContext = contextStack[contextStack.length - 1];
                 const isMethod = node.type === 'method_signature';

                const funcObj = {
                    name: nameNode.text,
                    params: getParams(paramsNode),
                    calls: [],
                    return_types: [node.childForFieldName('return_type')?.text || 'dynamic'],
                    is_exported: !nameNode.text.startsWith('_'),
                    is_method_of: isMethod ? currentContext.name : null,
                };
                results.functions.push(funcObj);
                 if (isMethod) currentContext.methods.push(funcObj.name);

                // For functions, the body is a sibling, so we need to find it and push context there.
                const bodyNode = node.parent.childForFieldName('body');
                if (bodyNode) {
                     contextStack.push(funcObj);
                     traverse(bodyNode);
                     contextStack.pop();
                     return; // Skip normal child traversal
                }
            }
        }

        if (node.type === 'call_expression') {
            const currentContext = contextStack.find(c => c.calls);
            const callName = node.childForFieldName('function')?.text;
            if (currentContext && callName) currentContext.calls.push(callName);
        }

        for (const child of node.children) traverse(child);

        if (isClassNode) contextStack.pop();
    }
    traverse(tree.rootNode);
    results.functions.forEach(f => { f.calls = [...new Set(f.calls)]; });
    return results;
}
module.exports = { extract };
