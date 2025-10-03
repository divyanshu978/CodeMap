package database

import (
	"codemap/backend/internal/config"
	"codemap/backend/internal/models"
	"context"
	"fmt"

	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

// DB represents the Neo4j database connection.
type DB struct {
	Driver neo4j.DriverWithContext
}

// NewDB creates and returns a new DB instance.
func NewDB(cfg *config.AppConfig) (*DB, error) {
	driver, err := neo4j.NewDriverWithContext(
		cfg.Neo4jURI,
		neo4j.BasicAuth(cfg.Neo4jUser, cfg.Neo4jPass, ""),
	)
	if err != nil {
		return nil, fmt.Errorf("could not create neo4j driver: %w", err)
	}

	// Verify the connection to the database
	err = driver.VerifyConnectivity(context.Background())
	if err != nil {
		return nil, fmt.Errorf("could not verify neo4j connectivity: %w", err)
	}

	fmt.Println("Successfully connected to Neo4j.")
	return &DB{Driver: driver}, nil
}

// Query executes a read-only Cypher query and returns the results as a slice of maps,
// which is ready to be converted to JSON.
func (db *DB) Query(ctx context.Context, cypher string, params map[string]any) ([]map[string]any, error) {
	session := db.Driver.NewSession(ctx, neo4j.SessionConfig{AccessMode: neo4j.AccessModeRead})
	defer session.Close(ctx)

	result, err := session.ExecuteRead(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		res, err := tx.Run(ctx, cypher, params)
		if err != nil {
			return nil, err
		}

		records, err := res.Collect(ctx)
		if err != nil {
			return nil, err
		}

		var results []map[string]any
		for _, record := range records {
			results = append(results, record.AsMap())
		}
		
		return results, nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed during query execution: %w", err)
	}

	return result.([]map[string]any), nil
}

// ImportAnalysis imports the entire analysis result into Neo4j within a single transaction.
func (db *DB) ImportAnalysis(ctx context.Context, analysisData *models.Analysis) error {
	session := db.Driver.NewSession(ctx, neo4j.SessionConfig{DatabaseName: "neo4j"})
	defer session.Close(ctx)

	_, err := session.ExecuteWrite(ctx, func(tx neo4j.ManagedTransaction) (any, error) {
		// First, clear the existing database to ensure a fresh import
		if _, err := tx.Run(ctx, "MATCH (n) DETACH DELETE n", nil); err != nil {
			return nil, err
		}

		// Create all nodes
		for _, file := range analysisData.Files {
			if err := createNodesForFile(ctx, tx, file); err != nil {
				return nil, fmt.Errorf("failed to create nodes for file %s: %w", file.Path, err)
			}
		}

		// Create all relationships
		for _, file := range analysisData.Files {
			if err := createRelationshipsForFile(ctx, tx, file); err != nil {
				return nil, fmt.Errorf("failed to create relationships for file %s: %w", file.Path, err)
			}
		}
		return nil, nil
	})

	if err != nil {
		return fmt.Errorf("failed to execute import transaction: %w", err)
	}

	fmt.Println("Successfully imported analysis into Neo4j.")
	return nil
}

// Helper functions for the transaction
func createNodesForFile(ctx context.Context, tx neo4j.ManagedTransaction, file models.File) error {
    // Create File node
    _, err := tx.Run(ctx, `
        MERGE (f:File {path: $path})
        ON CREATE SET f.language = $language
    `, map[string]any{
        "path":     file.Path,
        "language": file.Language,
    })
    if err != nil {
        return err
    }

    // Create Class and Property nodes
    for _, class := range file.Classes {
        classID := fmt.Sprintf("%s#%s", file.Path, class.Name)
        _, err := tx.Run(ctx, `
            MATCH (f:File {path: $filePath})
            MERGE (c:Class {id: $classID})
            ON CREATE SET c.name = $name, c.is_exported = $is_exported
            MERGE (f)-[:CONTAINS]->(c)
        `, map[string]any{
            "filePath":    file.Path,
            "classID":     classID,
            "name":        class.Name,
            "is_exported": class.IsExported,
        })
        if err != nil {
            return err
        }

        for _, propName := range class.Properties {
            propID := fmt.Sprintf("%s::%s", classID, propName)
            _, err := tx.Run(ctx, `
                MATCH (c:Class {id: $classID})
                MERGE (p:Property {id: $propID})
                ON CREATE SET p.name = $name
                MERGE (c)-[:HAS_PROPERTY]->(p)
            `, map[string]any{
                "classID": classID,
                "propID":  propID,
                "name":    propName,
            })
            if err != nil {
                return err
            }
        }
    }

    // Create Function and Parameter nodes
    for _, function := range file.Functions {
        funcID := fmt.Sprintf("%s#%s", file.Path, function.Name)
        _, err := tx.Run(ctx, `
            MATCH (f:File {path: $filePath})
            MERGE (fn:Function {id: $funcID})
            ON CREATE SET fn.name = $name, fn.is_exported = $is_exported, fn.is_method_of = $is_method_of
            MERGE (f)-[:CONTAINS]->(fn)
        `, map[string]any{
            "filePath":     file.Path,
            "funcID":       funcID,
            "name":         function.Name,
            "is_exported":  function.IsExported,
            "is_method_of": function.IsMethodOf,
        })
        if err != nil {
            return err
        }
        
        for _, paramName := range function.Params {
            paramID := fmt.Sprintf("%s(%s)", funcID, paramName)
            _, err := tx.Run(ctx, `
                MATCH (fn:Function {id: $funcID})
                MERGE (p:Parameter {id: $paramID})
                ON CREATE SET p.name = $name
                MERGE (fn)-[:HAS_PARAMETER]->(p)
            `, map[string]any{
                "funcID":  funcID,
                "paramID": paramID,
                "name":    paramName,
            })
            if err != nil {
                return err
            }
        }
    }
    return nil
}

func createRelationshipsForFile(ctx context.Context, tx neo4j.ManagedTransaction, file models.File) error {
    // Create IMPORTS relationships
    for _, imp := range file.Imports {
        if imp.Source != "" {
            _, err := tx.Run(ctx, `
                MATCH (importer:File {path: $importerPath})
                MATCH (imported:File) WHERE imported.path ENDS WITH $importSource
                MERGE (importer)-[:IMPORTS]->(imported)
            `, map[string]any{
                "importerPath": file.Path,
                "importSource": imp.Source,
            })
            if err != nil {
                return err
            }
        }
    }

    // Create HAS_METHOD and CALLS relationships
    for _, function := range file.Functions {
        funcID := fmt.Sprintf("%s#%s", file.Path, function.Name)

        if function.IsMethodOf != "" {
            classID := fmt.Sprintf("%s#%s", file.Path, function.IsMethodOf)
            _, err := tx.Run(ctx, `
                MATCH (c:Class {id: $classID})
                MATCH (fn:Function {id: $funcID})
                MERGE (c)-[:HAS_METHOD]->(fn)
            `, map[string]any{
                "classID": classID,
                "funcID":  funcID,
            })
            if err != nil {
                return err
            }
        }

        for _, calledFuncName := range function.Calls {
            _, err := tx.Run(ctx, `
                MATCH (caller:Function {id: $callerID})
                MATCH (callee:Function {name: $calleeName})
                MERGE (caller)-[:CALLS]->(callee)
            `, map[string]any{
                "callerID":   funcID,
                "calleeName": calledFuncName,
            })
            if err != nil {
                // This can fail if a called function is not in our analysis, so we log it but don't stop the import.
                fmt.Printf("Could not create CALLS relationship for %s to %s: %v\n", funcID, calledFuncName, err)
            }
        }
    }
    return nil
}

// Close gracefully closes the database driver.
func (db *DB) Close(ctx context.Context) {
	db.Driver.Close(ctx)
}


