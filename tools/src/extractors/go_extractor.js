function extract(tree, config) {
    const results = { functions: [], classes: [], imports: [] };
    const contextStack = [];

    function getParams(parametersNode) {
        if (!parametersNode || !parametersNode.children) return [];
        return parametersNode.children
            .filter(c => c.type === 'parameter_declaration')
            .flatMap(p => p.children.filter(id => id.type === 'identifier').map(id => id.text));
    }

    function traverse(node) {
        let isClassNode = false;
        let isFunctionNode = false;

        if (node.type === 'import_spec') {
            const pathNode = node.childForFieldName('path');
            if (pathNode) results.imports.push({ source: pathNode.text.replace(/['"]/g, '') });
        }

        if (node.type === 'type_spec' && node.childForFieldName('type')?.type === 'struct_type') {
            const nameNode = node.childForFieldName('name');
            if (nameNode) {
                const isExported = /[A-Z]/.test(nameNode.text[0]);
                const properties = node.childForFieldName('type').childForFieldName('body')?.children
                    .filter(c => c.type === 'field_declaration')
                    .flatMap(f => f.children.filter(id => id.type === 'field_identifier').map(id => id.text)) || [];

                const classObj = { name: nameNode.text, properties, methods: [], is_exported: isExported };
                results.classes.push(classObj);
                contextStack.push(classObj);
                isClassNode = true;
            }
        }
        
        const isFunc = node.type === 'function_declaration' || node.type === 'method_declaration';
        if (isFunc) {
            const nameNode = node.childForFieldName('name');
            const paramsNode = node.childForFieldName('parameters');
            const receiverNode = node.childForFieldName('receiver');

            if (nameNode) {
                const isExported = /[A-Z]/.test(nameNode.text[0]);
                const receiverType = receiverNode?.childForFieldName('type')?.text;
                
                const funcObj = {
                    name: nameNode.text,
                    params: getParams(paramsNode),
                    calls: [],
                    return_types: [node.childForFieldName('result')?.text || 'void'],
                    is_exported: isExported,
                    is_method_of: receiverType || null,
                };
                results.functions.push(funcObj);

                if (receiverType) {
                    const parentClass = results.classes.find(c => c.name === receiverType);
                    if (parentClass) parentClass.methods.push(funcObj.name);
                }
                
                contextStack.push(funcObj);
                isFunctionNode = true;
            }
        }
        
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
    results.functions.forEach(f => { f.calls = [...new Set(f.calls)]; });
    return results;
}
module.exports = { extract };
