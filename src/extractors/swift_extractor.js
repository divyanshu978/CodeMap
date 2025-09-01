function extract(tree, config) {
    const results = { functions: [], classes: [], imports: [] };
    const contextStack = [];

    function getParams(parametersNode) {
        if (!parametersNode) return [];
        return parametersNode.children
            .filter(c => c.type === 'parameter')
            .map(p => p.childForFieldName('name')?.text || '')
            .filter(Boolean);
    }

    function traverse(node) {
        let isClassNode = false;
        let isFunctionNode = false;

        if (node.type === 'import_declaration') {
            const pathNode = node.childForFieldName('path');
            if (pathNode) results.imports.push({ source: pathNode.text });
        }
        
        const isClassLike = node.type === 'class_declaration' || node.type === 'struct_declaration';
        if (isClassLike) {
            const nameNode = node.childForFieldName('name');
            if (nameNode) {
                const isExported = node.childForFieldName('modifiers')?.text.includes('public') ?? false;
                const classObj = { name: nameNode.text, properties: [], methods: [], is_exported: isExported };
                results.classes.push(classObj);
                contextStack.push(classObj);
                isClassNode = true;
            }
        }
        
        if (node.type === 'function_declaration') {
            const nameNode = node.childForFieldName('name');
            const paramsNode = node.childForFieldName('parameters');
            if (nameNode) {
                const currentContext = contextStack[contextStack.length - 1];
                const isMethod = currentContext && results.classes.some(c => c.name === currentContext.name);
                const isExported = node.childForFieldName('modifiers')?.text.includes('public') ?? false;

                const funcObj = {
                    name: nameNode.text,
                    params: getParams(paramsNode),
                    calls: [],
                    return_types: [node.childForFieldName('return_type')?.text || 'Void'],
                    is_exported: isExported,
                    is_method_of: isMethod ? currentContext.name : null,
                };
                results.functions.push(funcObj);
                if (isMethod) currentContext.methods.push(funcObj.name);
                
                contextStack.push(funcObj);
                isFunctionNode = true;
            }
        }
        
        if (node.type === 'variable_declaration') {
             const currentContext = contextStack[contextStack.length - 1];
             if (currentContext && results.classes.some(c => c.name === currentContext.name)) {
                node.childForFieldName('pattern')?.children.forEach(id => {
                     currentContext.properties.push(id.text);
                });
             }
        }

        if (node.type === 'function_call_expression') {
            const currentContext = contextStack.find(c => c.calls);
            const callName = node.childForFieldName('name')?.text;
            if (currentContext && callName) currentContext.calls.push(callName);
        }

        for (const child of node.children) traverse(child);

        if (isClassNode || isFunctionNode) contextStack.pop();
    }
    traverse(tree.rootNode);
    results.functions.forEach(f => { f.calls = [...new Set(f.calls)]; });
    return results;
}
module.exports = { extract };
