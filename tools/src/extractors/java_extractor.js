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

        if (node.type === 'import_declaration') {
            const nameNode = node.childForFieldName('name');
            if (nameNode) results.imports.push({ source: nameNode.text });
        }

        if (node.type === 'class_declaration') {
            const nameNode = node.childForFieldName('name');
            if (nameNode) {
                const isExported = node.childForFieldName('modifiers')?.text.includes('public') ?? false;
                const classObj = { name: nameNode.text, properties: [], methods: [], is_exported: isExported };
                results.classes.push(classObj);
                contextStack.push(classObj);
                isClassNode = true;
            }
        }
        
        if (node.type === 'method_declaration') {
            const nameNode = node.childForFieldName('name');
            const paramsNode = node.childForFieldName('parameters');
            if (nameNode) {
                const currentContext = contextStack[contextStack.length - 1];
                const isExported = node.childForFieldName('modifiers')?.text.includes('public') ?? false;

                const funcObj = {
                    name: nameNode.text,
                    params: getParams(paramsNode),
                    calls: [],
                    return_types: [node.childForFieldName('type')?.text || 'void'],
                    is_exported: isExported,
                    is_method_of: currentContext ? currentContext.name : null,
                };
                results.functions.push(funcObj);

                if (currentContext) {
                    currentContext.methods.push(funcObj.name);
                }
                
                contextStack.push(funcObj);
                isFunctionNode = true;
            }
        }

        if (node.type === 'field_declaration') {
             const currentContext = contextStack[contextStack.length - 1];
             if (currentContext && results.classes.some(c => c.name === currentContext.name)) {
                 node.childForFieldName('declarator').children.forEach(declarator => {
                     currentContext.properties.push(declarator.text);
                 });
             }
        }
        
        if (node.type === 'method_invocation') {
            const currentContext = contextStack.find(c => c.calls);
            const callName = node.childForFieldName('name')?.text;
            if (currentContext && callName) {
                currentContext.calls.push(callName);
            }
        }

        for (const child of node.children) traverse(child);

        if (isClassNode || isFunctionNode) contextStack.pop();
    }

    traverse(tree.rootNode);
    results.functions.forEach(f => { f.calls = [...new Set(f.calls)]; });
    return results;
}
module.exports = { extract };
