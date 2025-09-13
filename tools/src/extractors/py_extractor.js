// // src/extractors/py_extractor.js - MANUAL TRAVERSAL VERSION

// function extract(tree, config) {
//     const results = { functions: [], classes: [], imports: [], calls: [] };

//     function traverse(node) {
//         if (node.type === 'function_definition') {
//             const nameNode = node.childForFieldName('name');
//             if (nameNode && !results.functions.some(f => f.name === nameNode.text)) {
//                 results.functions.push({ name: nameNode.text });
//             }
//         }

//         if (node.type === 'class_definition') {
//             const nameNode = node.childForFieldName('name');
//             if (nameNode && !results.classes.some(c => c.name === nameNode.text)) {
//                 results.classes.push({ name: nameNode.text });
//             }
//         }

//         if (node.type === 'import_statement') {
//             const sourceNode = node.child(0); // Simple assumption for import
//             if (sourceNode && !results.imports.some(i => i.source === sourceNode.text)) {
//                  results.imports.push({ source: sourceNode.text });
//             }
//         }
        
//         if (node.type === 'from_import_statement') {
//             const sourceNode = node.childForFieldName('module_name');
//              if (sourceNode && !results.imports.some(i => i.source === sourceNode.text)) {
//                  results.imports.push({ source: sourceNode.text });
//             }
//         }

//         if (node.type === 'call') {
//             const funcNode = node.childForFieldName('function');
//             if (funcNode) {
//                 results.calls.push({ name: funcNode.text });
//             }
//         }
        
//         for (const child of node.children) {
//             traverse(child);
//         }
//     }

//     traverse(tree.rootNode);
//     return results;
// }

// module.exports = { extract };
function extract(tree, config) {
    const results = { functions: [], classes: [], imports: [] };
    const contextStack = [];

    function getParams(parametersNode) {
        if (!parametersNode) return [];
        // Filters out 'self'
        return parametersNode.children
            .filter(c => c.type === 'identifier' && c.text !== 'self')
            .map(p => p.text);
    }
    
    function traverse(node) {
        let isClassNode = false;
        let isFunctionNode = false;

        if (node.type === 'import_statement' || node.type === 'from_import_statement') {
            const sourceNode = node.childForFieldName('module_name') || node.child(1);
            if (sourceNode) results.imports.push({ source: sourceNode.text });
        }

        if (node.type === 'class_definition') {
            const nameNode = node.childForFieldName('name');
            if (nameNode) {
                 const properties = node.childForFieldName('body').children
                    .filter(c => c.type === 'expression_statement' && c.child(0).type === 'assignment')
                    .map(a => a.child(0).childForFieldName('left')?.text)
                    .filter(Boolean);
                const classObj = { name: nameNode.text, properties, methods: [], is_exported: !nameNode.text.startsWith('_') };
                results.classes.push(classObj);
                contextStack.push(classObj);
                isClassNode = true;
            }
        }
        
        if (node.type === 'function_definition') {
            const nameNode = node.childForFieldName('name');
            const paramsNode = node.childForFieldName('parameters');
            
            if (nameNode) {
                const currentContext = contextStack[contextStack.length - 1];
                const isMethod = currentContext && results.classes.some(c => c.name === currentContext.name);

                const funcObj = {
                    name: nameNode.text,
                    params: getParams(paramsNode),
                    calls: [],
                    return_types: [node.childForFieldName('return_type')?.text || 'any'],
                    is_exported: !nameNode.text.startsWith('_'),
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
        
        if (node.type === 'call') {
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
