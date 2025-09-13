function extract(tree, config) {
    const results = { functions: [], classes: [], imports: [] };
    const contextStack = [];

    function getParams(parametersNode) {
        if (!parametersNode) return [];
        return parametersNode.children
            .filter(c => c.type === 'function_value_parameter')
            .map(p => p.childForFieldName('name')?.text || '')
            .filter(Boolean);
    }

    function traverse(node) {
        let isClassNode = false;
        let isFunctionNode = false;
        
        if (node.type === 'import_header') {
            node.children.forEach(imp => results.imports.push({ source: imp.text }));
        }
        
        if (node.type === 'class_declaration') {
            const nameNode = node.childForFieldName('name');
            if (nameNode) {
                const isExported = node.parent.childForFieldName('modifiers')?.text.includes('public') ?? true; // Default public
                const classObj = { name: nameNode.text, properties: [], methods: [], is_exported: isExported };
                results.classes.push(classObj);
                contextStack.push(classObj);
                isClassNode = true;
            }
        }
        
        if (node.type === 'function_declaration') {
            const nameNode = node.childForFieldName('name');
            const paramsNode = node.childForFieldName('value_parameters');
            if (nameNode) {
                const currentContext = contextStack[contextStack.length - 1];
                const isMethod = currentContext && results.classes.some(c => c.name === currentContext.name);
                const isExported = node.parent.childForFieldName('modifiers')?.text.includes('public') ?? true;

                const funcObj = {
                    name: nameNode.text,
                    params: getParams(paramsNode),
                    calls: [],
                    return_types: [node.childForFieldName('type')?.text || 'Unit'],
                    is_exported: isExported,
                    is_method_of: isMethod ? currentContext.name : null,
                };
                results.functions.push(funcObj);
                if (isMethod) currentContext.methods.push(funcObj.name);
                
                contextStack.push(funcObj);
                isFunctionNode = true;
            }
        }
        
        if (node.type === 'property_declaration') {
             const currentContext = contextStack[contextStack.length - 1];
             if (currentContext && results.classes.some(c => c.name === currentContext.name)) {
                 currentContext.properties.push(node.childForFieldName('name').text);
             }
        }
        
        if (node.type === 'call_expression') {
            const currentContext = contextStack.find(c => c.calls);
            const callName = node.childForFieldName('callee_expression')?.text;
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
