"use client";
import React, { useEffect, useRef } from "react";
import cytoscape from "cytoscape";

// Helper: Convert Neo4j data to Cytoscape format (with placeholder nodes and safe edges)
// Helper: Convert Neo4j data to Cytoscape format (with placeholder nodes and safe edges)
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

    // Relationship (edge) - only add if source and target are valid, non-empty strings and not null/undefined
    if (
      row.r &&
      row.r.Type &&
      typeof row.r.StartElementId === "string" &&
      typeof row.r.EndElementId === "string" &&
      row.r.StartElementId.trim() !== "" &&
      row.r.EndElementId.trim() !== ""
    ) {
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

  // Add placeholder nodes for any referenced node IDs not already present, and only if valid
  referencedNodeIds.forEach(nodeId => {
    if (
      typeof nodeId === "string" &&
      nodeId.trim() !== "" &&
      !nodes.has(nodeId)
    ) {
      nodes.set(nodeId, {
        data: {
          id: nodeId,
          label: "Unknown",
          type: "Unknown"
        }
      });
    }
  });

  // Remove edges whose source or target is still not present in nodes
  const nodeIdSet = new Set(Array.from(nodes.keys()));
  const safeEdges = edges.filter(
    e => nodeIdSet.has(e.data.source) && nodeIdSet.has(e.data.target)
  );

  return {
    nodes: Array.from(nodes.values()),
    edges: safeEdges
  };
}

const colorMap = {
  File: "#60a5fa",
  Function: "#34d399",
  Class: "#fbbf24",
  Variable: "#f472b6",
  Unknown: "#64748b"
};

export default function GraphView({ neo4jData }) {
  const cyRef = useRef(null);
  const cyInstance = useRef(null);

  useEffect(() => {
    const { nodes, edges } = neo4jToCytoscape(neo4jData);

    if (cyRef.current) {
      cyRef.current.innerHTML = ""; // Clear previous graph

      cyInstance.current = cytoscape({
        container: cyRef.current,
        elements: [...nodes, ...edges],
        style: [
          {
            selector: "node",
            style: {
              "background-color": ele => colorMap[ele.data("type")] || "#38bdf8",
              label: "data(label)",
              "text-valign": "center",
              "color": "#fff",
              "font-size": "14px",
              "text-outline-width": 2,
              "text-outline-color": "#334155",
              "width": 40,
              "height": 40,
              "border-width": 2,
              "border-color": "#fff"
            }
          },
          {
            selector: "edge",
            style: {
              width: 3,
              "line-color": "#64748b",
              "target-arrow-color": "#64748b",
              "target-arrow-shape": "triangle",
              "curve-style": "bezier",
              label: "data(label)",
              "font-size": "12px",
              "color": "#fff",
              "text-background-color": "#334155",
              "text-background-opacity": 1,
              "text-background-padding": 2
            }
          }
        ],
        layout: { name: "cose" },
        minZoom: 0.5,
        maxZoom: 2.5,
        wheelSensitivity: 0.2
      });
    }
  }, [neo4jData]);

  return (
    <div>
      <div className="mb-2 font-semibold text-lg">Graph View</div>
      <div
        ref={cyRef}
        style={{
          width: "100%",
          height: "600px",
          background: "#0f172a",
          borderRadius: "12px"
        }}
      />
    </div>
  );
}