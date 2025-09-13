function extract(tree, config) {
    const results = { functions: [], classes: [], imports: [] };
    const contextStack = [];

    function getParams(parametersNode) {
        if (!parametersNode) return [];
        return parametersNode.children
            .filter(c => c.type === 'parameter_declaration')
            .map(p => p.childForFieldName('declarator')?.text || '')
            .filter(Boolean);
    }

    function traverse(node) {
        let isClassNode = false;
        let isFunctionNode = false;

        // Find #include directives
        if (node.type === 'include_directive') {
            const pathNode = node.childForFieldName('path');
            if (pathNode) results.imports.push({ source: pathNode.text });
        }

        // Find class definitions
        if (node.type === 'class_specifier') {
            const nameNode = node.childForFieldName('name');
            if (nameNode) {
                const classObj = { name: nameNode.text, properties: [], methods: [], is_exported: true };
                results.classes.push(classObj);
                contextStack.push(classObj);
                isClassNode = true;
            }
        }
        
        // Find function and method definitions
        if (node.type === 'function_definition') {
            const declarator = node.childForFieldName('declarator');
            const nameNode = declarator?.childForFieldName('declarator');
            const paramsNode = declarator?.childForFieldName('parameters');
            
            if (nameNode) {
                const currentContext = contextStack[contextStack.length - 1];
                const isMethod = currentContext && results.classes.some(c => c.name === currentContext.name);

                const funcObj = {
                    name: nameNode.text,
                    params: getParams(paramsNode),
                    calls: [],
                    return_types: [node.childForFieldName('type')?.text || 'void'],
                    is_exported: true,
                    is_method_of: isMethod ? currentContext.name : null,
                };
                results.functions.push(funcObj);

                if (isMethod) {
                    currentContext.methods.push(funcObj.name);
                }
                
                contextStack.push(funcObj);
                isFunctionNode = true;
            }
        }
        
        // Find member variables inside classes
        if (node.type === 'field_declaration') {
            const currentContext = contextStack[contextStack.length - 1];
            if (currentContext && results.classes.some(c => c.name === currentContext.name)) {
                node.children.filter(c => c.type === 'field_declarator').forEach(declarator => {
                    currentContext.properties.push(declarator.text);
                });
            }
        }

        // Find function calls
        if (node.type === 'call_expression') {
            const currentContext = contextStack.find(c => c.calls);
            const callName = node.childForFieldName('function')?.text;
            if (currentContext && callName) {
                currentContext.calls.push(callName);
            }
        }

        for (const child of node.children) traverse(child);

        if (isClassNode || isFunctionNode) contextStack.pop();
    }

    traverse(tree.rootNode);
    return results;
}
module.exports = { extract };
