const neo4j = require('neo4j-driver');
const fs = require('fs');
const path = require('path');

// --- Configuration ---
const URI = 'neo4j://127.0.0.1:7687'; 
const USER = 'neo4j';
const PASSWORD = '123456789'; // Your Neo4j password

const ANALYSIS_FILE = './analysis-output.json';

async function importToNeo4j() {
    console.log('Starting comprehensive graph import process...');
    
    const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
    const session = driver.session({ database: 'neo4j' });

    try {
        console.log('Step 1: Clearing existing database...');
        await session.executeWrite(tx => tx.run('MATCH (n) DETACH DELETE n'));
        
        console.log('Step 2: Creating schema constraints...');
        await session.executeWrite(tx => tx.run('CREATE CONSTRAINT IF NOT EXISTS FOR (f:File) REQUIRE f.path IS UNIQUE'));
        await session.executeWrite(tx => tx.run('CREATE CONSTRAINT IF NOT EXISTS FOR (fn:Function) REQUIRE fn.id IS UNIQUE'));
        await session.executeWrite(tx => tx.run('CREATE CONSTRAINT IF NOT EXISTS FOR (c:Class) REQUIRE c.id IS UNIQUE'));
        await session.executeWrite(tx => tx.run('CREATE CONSTRAINT IF NOT EXISTS FOR (p:Property) REQUIRE p.id IS UNIQUE'));
        await session.executeWrite(tx => tx.run('CREATE CONSTRAINT IF NOT EXISTS FOR (param:Parameter) REQUIRE param.id IS UNIQUE'));
        console.log('Schema setup complete.');

        console.log(`Step 3: Reading and parsing analysis file: ${ANALYSIS_FILE}`);
        const analysisData = JSON.parse(fs.readFileSync(ANALYSIS_FILE, 'utf8'));

        console.log('Step 4: Creating all nodes (Files, Classes, Functions, Properties, Parameters)...');
        for (const file of analysisData.files) {
            if (file.error) continue; // Skip files that had a parsing error

            // --- THIS IS THE FIX ---
            // If file.language is missing (undefined/null), default to 'unknown'.
            const language = file.language || 'unknown';

            await session.executeWrite(tx => tx.run(
                'MERGE (f:File {path: $path}) ON CREATE SET f.language = $language',
                { path: file.path, language: language }
            ));
            
            // ... (The rest of your code for creating classes, functions, etc., remains the same)

            for (const cls of file.classes || []) {
                const classId = `${file.path}#${cls.name}`;
                await session.executeWrite(tx => tx.run(
                    `MERGE (c:Class {id: $id})
                     ON CREATE SET c.name = $name, c.is_exported = $is_exported
                     ON MATCH SET c.name = $name, c.is_exported = $is_exported
                     WITH c
                     MATCH (f:File {path: $filePath})
                     MERGE (f)-[:CONTAINS]->(c)`,
                    { id: classId, name: cls.name, is_exported: cls.is_exported, filePath: file.path }
                ));

                for (const propName of cls.properties || []) {
                    const propId = `${classId}::${propName}`;
                    await session.executeWrite(tx => tx.run(
                        `MERGE (p:Property {id: $id})
                         ON CREATE SET p.name = $name
                         WITH p
                         MATCH (c:Class {id: $classId})
                         MERGE (c)-[:HAS_PROPERTY]->(p)`,
                        { id: propId, name: propName, classId: classId }
                    ));
                }
            }

            for (const func of file.functions || []) {
                const funcId = `${file.path}#${func.name}`;
                await session.executeWrite(tx => tx.run(
                    `MERGE (fn:Function {id: $id})
                     ON CREATE SET 
                        fn.name = $name, 
                        fn.is_exported = $is_exported, 
                        fn.return_type = $return_type,
                        fn.is_method_of = $is_method_of
                     ON MATCH SET
                        fn.name = $name, 
                        fn.is_exported = $is_exported, 
                        fn.return_type = $return_type,
                        fn.is_method_of = $is_method_of
                     WITH fn
                     MATCH (f:File {path: $filePath})
                     MERGE (f)-[:CONTAINS]->(fn)`,
                    { 
                        id: funcId, 
                        name: func.name, 
                        is_exported: func.is_exported, 
                        return_type: (func.return_types || []).join(', '),
                        is_method_of: func.is_method_of,
                        filePath: file.path 
                    }
                ));
                
                for (const paramName of func.params || []) {
                    const paramId = `${funcId}(${paramName})`;
                     await session.executeWrite(tx => tx.run(
                        `MERGE (p:Parameter {id: $id})
                         ON CREATE SET p.name = $name
                         WITH p
                         MATCH (fn:Function {id: $funcId})
                         MERGE (fn)-[:HAS_PARAMETER]->(p)`,
                        { id: paramId, name: paramName, funcId: funcId }
                    ));
                }
            }
        }
        console.log('Node creation complete.');

        console.log('Step 5: Creating all relationships (IMPORTS, HAS_METHOD, CALLS)...');
        for (const file of analysisData.files) {
             if (file.error) continue;
            
            for (const imp of file.imports || []) {
                if (imp.source) {
                    const importSource = imp.source.replace(/['"]/g, '');
                    await session.executeWrite(tx => tx.run(
                        `MATCH (importer:File {path: $importerPath})
                         MATCH (imported:File) WHERE imported.path ENDS WITH $importSource OR imported.path ENDS WITH $importSource + '.js' OR imported.path ENDS WITH $importSource + '.ts'
                         MERGE (importer)-[:IMPORTS]->(imported)`,
                        { importerPath: file.path, importSource: importSource }
                    ));
                }
            }

            for (const cls of file.classes || []) {
                const classId = `${file.path}#${cls.name}`;
                for (const methodName of cls.methods || []) {
                    const methodId = `${file.path}#${methodName}`;
                     await session.executeWrite(tx => tx.run(
                        `MATCH (c:Class {id: $classId})
                         MATCH (fn:Function {id: $methodId})
                         MERGE (c)-[:HAS_METHOD]->(fn)`,
                        { classId: classId, methodId: methodId }
                    ));
                }
            }

            for (const func of file.functions || []) {
                const callerId = `${file.path}#${func.name}`;
                for (const calledName of func.calls || []) {
                     await session.executeWrite(tx => tx.run(
                        `MATCH (caller:Function {id: $callerId})
                         MATCH (callee:Function) WHERE callee.name = $calledName
                         MERGE (caller)-[:CALLS]->(callee)`,
                        { callerId: callerId, calledName: calledName }
                    ));
                }
            }
        }
        console.log('Relationship creation complete.');
        
        console.log('\nGraph import finished successfully! Your comprehensive codebase graph is now in Neo4j.');

    } catch (error) {
        console.error('An error occurred during the Neo4j import process:', error);
    } finally {
        await session.close();
        await driver.close();
        console.log('Connection to Neo4j closed.');
    }
}

importToNeo4j();
