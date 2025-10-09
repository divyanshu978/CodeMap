"use client";
import { useState } from "react";
import GraphView from "./GraphView";

const QueryDashboard = () => {
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  // Real queries that help users understand their codebase COMPLETELY
  const queryTemplates = [
    // 🔍 UNDERSTANDING: What's in my codebase?
    {
      id: "codebase_overview",
      name: "� Codebase Overview",
      description: "Complete summary of your codebase structure",
      icon: "�",
      category: "🔍 Understanding",
      query: "MATCH (n) RETURN labels(n)[0] as type, count(n) as count ORDER BY count DESC",
      resultType: "table"
    },
    {
      id: "file_languages",
      name: "🌍 Languages Used", 
      description: "Programming languages in your project",
      icon: "🌍",
      category: "🔍 Understanding",
      query: "MATCH (f:File) WHERE f.language IS NOT NULL RETURN f.language as language, count(f) as files ORDER BY files DESC",
      resultType: "table"
    },
    {
      id: "largest_files",
      name: "📈 Largest Files",
      description: "Files with most functions/classes",
      icon: "�", 
      category: "🔍 Understanding",
      query: "MATCH (f:File)-[:CONTAINS]->(item) WITH f.path as file, count(item) as size ORDER BY size DESC RETURN file, size LIMIT 20",
      resultType: "table"
    },

    // 🔗 CONNECTIONS: How things relate to each other
    {
      id: "complete_graph",
      name: "🌐 Complete Code Graph",
      description: "Full visualization of your codebase relationships", 
      icon: "🌐",
      category: "🔗 Connections",
      query: "MATCH (n)-[r]->(m) RETURN n, r, m LIMIT 200",
      resultType: "graph"
    },
    {
      id: "file_dependencies",
      name: "📁 File Import Network",
      description: "How files depend on each other",
      icon: "�",
      category: "🔗 Connections", 
      query: "MATCH (source:File)-[r:IMPORTS]->(target:File) RETURN source, r, target LIMIT 50",
      resultType: "graph"
    },
    {
      id: "function_network", 
      name: "⚡ Function Call Network",
      description: "Which functions call which functions",
      icon: "⚡",
      category: "🔗 Connections",
      query: "MATCH (caller:Function)-[r:CALLS]->(callee:Function) RETURN caller, r, callee LIMIT 50",
      resultType: "graph"
    },
    {
      id: "class_hierarchy",
      name: "🏗️ Class & Method Structure", 
      description: "Classes and their methods relationship",
      icon: "🏗️",
      category: "🔗 Connections",
      query: "MATCH (c:Class)-[r:HAS_METHOD]->(m:Function) RETURN c, r, m LIMIT 40",
      resultType: "graph"
    },

    // 🎯 INSIGHTS: Important patterns and hotspots  
    {
      id: "central_files",
      name: "🔥 Most Important Files",
      description: "Files that many others depend on",
      icon: "�",
      category: "🎯 Insights",
      query: "MATCH (f:File)<-[:IMPORTS]-(importer) WITH f, count(importer) as importers WHERE importers > 1 RETURN f.path as file, importers ORDER BY importers DESC LIMIT 15",
      resultType: "table"
    },
    {
      id: "popular_functions",
      name: "⭐ Most Called Functions", 
      description: "Functions used throughout your codebase",
      icon: "⭐",
      category: "🎯 Insights",
      query: "MATCH (fn:Function)<-[:CALLS]-(caller) WITH fn, count(caller) as calls WHERE calls > 1 RETURN fn.name as function, calls ORDER BY calls DESC LIMIT 15",
      resultType: "table"
    },
    {
      id: "isolated_components",
      name: "🏝️ Isolated Components",
      description: "Files or functions with no connections",
      icon: "🏝️", 
      category: "🎯 Insights",
      query: "MATCH (n) WHERE NOT (n)--() RETURN labels(n)[0] as type, n.name as name, n.path as path LIMIT 20",
      resultType: "table"
    },

    // 🔬 EXPLORATION: Deep dive into specific areas
    {
      id: "exported_items",
      name: "🚀 Public API Surface",
      description: "All exported functions and classes",
      icon: "🚀",
      category: "🔬 Exploration", 
      query: "MATCH (n) WHERE n.is_exported = true RETURN labels(n)[0] as type, n.name as name ORDER BY type, name",
      resultType: "table"
    },
    {
      id: "file_contents",
      name: "📋 File Contents Breakdown",
      description: "What each file contains (functions, classes)",
      icon: "📋",
      category: "🔬 Exploration",
      query: "MATCH (f:File)-[:CONTAINS]->(item) RETURN f.path as file, labels(item)[0] as contains, item.name as name ORDER BY file LIMIT 100", 
      resultType: "table"
    }
  ];

  const categories = [...new Set(queryTemplates.map(q => q.category))];

  // Convert Neo4j results to Cytoscape format
  const getCytoscapeData = () => {
    if (!results || results.error) return { nodes: [], edges: [] };
    
    const nodes = new Map();
    const edges = [];
    
    results.forEach((row, index) => {
      Object.values(row).forEach(item => {
        if (item && typeof item === 'object') {
          // Handle nodes
          if (item.elementId || item.identity) {
            const nodeId = item.elementId || item.identity || `node_${index}`;
            const labels = item.labels || ['Unknown'];
            const properties = item.properties || {};
            
            nodes.set(nodeId, {
              data: {
                id: nodeId,
                label: properties.name || properties.path || labels[0] || nodeId,
                type: labels[0] || 'Unknown',
                ...properties
              }
            });
          }
          
          // Handle relationships
          if (item.type && (item.startNodeElementId || item.start)) {
            const startId = item.startNodeElementId || item.start;
            const endId = item.endNodeElementId || item.end;
            const edgeId = item.elementId || `edge_${index}`;
            
            edges.push({
              data: {
                id: edgeId,
                source: startId,
                target: endId,
                label: item.type,
                type: item.type,
                ...item.properties
              }
            });
          }
        }
      });
    });
    
    return {
      nodes: Array.from(nodes.values()),
      edges: edges
    };
  };

  const downloadJSON = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Data copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const executeQuery = async (template) => {
    setLoading(true);
    setSelectedQuery(template);
    
    try {
      const response = await fetch("http://localhost:8080/v1/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: template.query,
          params: {}
        }),
      });

      const data = await response.json();

      console.log("Backend data" , data[0])
      
      if (response.ok) {
        setResults(data);
      } else {
        console.error("Query failed:", data.error);
        setResults({ error: data.error });
      }
    } catch (error) {
      console.error("Network error:", error);
      setResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const renderResults = () => {
    if (!results) return null;
    
    if (results.error) {
      return (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg">
          <p>Error: {results.error}</p>
        </div>
      );
    }

    if (selectedQuery?.resultType === "table") {
      return (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Results</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-600">
                  {results.length > 0 && Object.keys(results[0]).map(key => (
                    <th key={key} className="text-left p-2">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((row, i) => (
                  <tr key={i} className="border-b border-gray-700">
                    {Object.values(row).map((value, j) => (
                      <td key={j} className="p-2">{String(value)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // For graph results, prepare Cytoscape-ready data
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Graph Data (Cytoscape Ready)</h3>
        
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-900 p-3 rounded">
            <h4 className="font-medium mb-2 text-teal-300">Statistics</h4>
            <p className="text-sm">Total Results: {results.length}</p>
            <p className="text-sm">Unique Nodes: {getCytoscapeData().nodes.length}</p>
            <p className="text-sm">Relationships: {getCytoscapeData().edges.length}</p>
          </div>
          
          <div className="bg-gray-900 p-3 rounded">
            <h4 className="font-medium mb-2 text-teal-300">Actions</h4>
            <button 
              onClick={() => downloadJSON(getCytoscapeData(), 'graph-data.json')}
              className="bg-teal-500 hover:bg-teal-600 px-3 py-1 rounded text-sm mr-2"
            >
              📥 Download JSON
            </button>
            <button 
              onClick={() => copyToClipboard(JSON.stringify(getCytoscapeData(), null, 2))}
              className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-sm"
            >
              📋 Copy Data  
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2 text-teal-300">Cytoscape Format Preview:</h4>
            <pre className="bg-gray-900 p-3 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(getCytoscapeData(), null, 2)}
            </pre>
          </div>

          <div>
            <h4 className="font-medium mb-2 text-orange-300">Raw Neo4j Data:</h4>
            <pre className="bg-gray-900 p-3 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(results.slice(0, 3), null, 2)}
            </pre>
            {results.length > 3 && (
              <p className="text-sm text-gray-400 mt-2">
                Showing first 3 raw results. Total: {results.length}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Codebase Analysis Dashboard</h1>
        <p className="text-gray-300">
          Understand your codebase completely - explore structure, dependencies, and relationships with interactive visualizations.
        </p>
      </div>

      {/* Analysis Categories */}
      {categories.map(category => (
        <div key={category} className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">{category}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {queryTemplates
              .filter(template => template.category === category)
              .map(template => (
                <div
                  key={template.id}
                  onClick={() => executeQuery(template)}
                  className="bg-gray-800 hover:bg-gray-700 p-6 rounded-lg cursor-pointer transition-colors border border-gray-700 hover:border-teal-500"
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{template.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{template.name}</h3>
                      <p className="text-sm text-gray-400">{template.description}</p>
                      <span className="inline-block mt-2 text-xs px-2 py-1 bg-teal-900/50 text-teal-300 rounded">
                        {template.resultType}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      ))}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
          <p className="text-gray-300 mt-2">Executing query...</p>
        </div>
      )}

      {/* Results */}
      {results && !loading && (
        <div className="mt-8">
          {renderResults()}
        </div>
      )}

        <GraphView neo4jData={results} />
    </div>
  );
};

function neo4jToCytoscape(neo4jData) {
  if (!neo4jData || !Array.isArray(neo4jData)) return { nodes: [], edges: [] };

  const nodes = new Map();
  const edges = [];
  const referencedNodeIds = new Set();

  neo4jData.forEach((row, index) => {
    // Support both n/m/r and source/target
    const nodeKeys = Object.keys(row).filter(k => k.length === 1 && k !== "r");
    nodeKeys.forEach(k => {
      const item = row[k];
      if (item && item.Labels) {
        const nodeId = item.ElementId || item.Id || `${k}_${index}`;
        nodes.set(nodeId, {
          data: {
            id: nodeId,
            label: item.Props?.name || item.Props?.path || item.Labels[0] || nodeId,
            type: item.Labels[0] || "Unknown",
            ...item.Props
          }
        });
      }
    });

    // Relationship
    if (row.r && row.r.Type && row.r.StartElementId && row.r.EndElementId) {
      referencedNodeIds.add(row.r.StartElementId);
      referencedNodeIds.add(row.r.EndElementId);
      edges.push({
        data: {
          id: row.r.ElementId || `edge_${index}`,
          source: row.r.StartElementId,
          target: row.r.EndElementId,
          label: row.r.Type,
          ...row.r.Props
        }
      });
    }
  });

  // Add placeholder nodes for any referenced node IDs not already present
  referencedNodeIds.forEach(nodeId => {
    if (!nodes.has(nodeId)) {
      nodes.set(nodeId, {
        data: {
          id: nodeId,
          label: "Unknown",
          type: "Unknown"
        }
      });
    }
  });

  return {
    nodes: Array.from(nodes.values()),
    edges
  };
}

export default QueryDashboard;