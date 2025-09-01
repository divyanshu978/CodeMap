function extract(tree, config) {
    const results = { functions: [], classes: [], imports: [] };
    const contextStack = [];

    function getParams(parametersNode) {
        if (!parametersNode) return [];
        return parametersNode.children
            .filter(c => c.type === 'required_parameter' || c.type === 'optional_parameter')
            .map(p => p.childForFieldName('pattern')?.text)
            .filter(Boolean);
    }
    
    function markExported(name) {
        const func = results.functions.find(f => f.name === name);
        if (func) func.is_exported = true;
        const cls = results.classes.find(c => c.name === name);
        if (cls) cls.is_exported = true;
    }

    function traverse(node) {
        let isClassNode = false;
        let isFunctionNode = false;

        if (node.type === 'import_statement') {
            const sourceNode = node.childForFieldName('source');
            if (sourceNode) results.imports.push({ source: sourceNode.text.replace(/['"]/g, '') });
        }
        
        if (node.type === 'export_statement') {
             const declaration = node.childForFieldName('declaration');
             if (declaration) {
                 const name = declaration.childForFieldName('name')?.text;
                 if (name) markExported(name);
             } else {
                 node.childForFieldName('clause')?.children.forEach(spec => {
                     if (spec.type === 'export_specifier') {
                         markExported(spec.childForFieldName('name').text);
                     }
                 });
             }
        }

        if (node.type === 'class_declaration') {
            const nameNode = node.childForFieldName('name');
            if (nameNode) {
                const classObj = { name: nameNode.text, properties: [], methods: [], is_exported: false };
                results.classes.push(classObj);
                contextStack.push(classObj);
                isClassNode = true;
            }
        }

        const isFunc = node.type === 'function_declaration' || node.type === 'method_definition' || node.type === 'function';
        if (isFunc) {
            const nameNode = node.childForFieldName('name');
            if (nameNode) {
                const currentContext = contextStack[contextStack.length - 1];
                const isMethod = node.type === 'method_definition';
                
                const funcObj = {
                    name: nameNode.text,
                    params: getParams(node.childForFieldName('parameters')),
                    calls: [],
                    return_types: [node.childForFieldName('return_type')?.text.substring(2) || 'any'], // TS return types have a ': ' prefix
                    is_exported: false,
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
        
        if (node.type === 'public_field_definition') {
            const currentContext = contextStack[contextStack.length - 1];
            if (currentContext && results.classes.some(c => c.name === currentContext.name)) {
                currentContext.properties.push(node.childForFieldName('name').text);
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
