"use client";
import React, { useMemo, useRef, useEffect } from "react";
import dynamic from "next/dynamic";

// Load react-force-graph only on the client
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

const COLORS = {
  function: "#56c2c2", // teal
  param: "#b7f7c8",    // light green
  file: "#f5b7c8",     // light pink
};

export default function AstGraph() {
  const fgRef = useRef();

  const data = useMemo(
    () => ({
      nodes: [
        { id: "main", type: "function" },
        { id: "add", type: "function" },
        { id: "sub", type: "function" },
        { id: "names", type: "function" },
        { id: "a", type: "param" },
        { id: "b", type: "param" },
        { id: "x", type: "param" },
        { id: "y", type: "param" },
        { id: "..\\sample\\check...", type: "file" },
      ],
      links: [
        { source: "main", target: "add", label: "CALLS" },
        { source: "main", target: "sub", label: "CALLS" },
        { source: "names", target: "main", label: "CALLS" },
        { source: "add", target: "a", label: "HAS_PARAMETER" },
        { source: "add", target: "b", label: "HAS_PARAMETER" },
        { source: "sub", target: "x", label: "HAS_PARAMETER" },
        { source: "sub", target: "y", label: "HAS_PARAMETER" },
        { source: "..\\sample\\check...", target: "main", label: "CONTAINS" },
      ],
    }),
    []
  );

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      fgRef.current?.refresh();
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{ height: "80vh", background: "#0b1220", borderRadius: 12 }}>
      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        backgroundColor="#0b1220"
        nodeRelSize={8}
        cooldownTicks={0}
        d3AlphaDecay={0.01}
        d3VelocityDecay={0.2}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleSpeed={() => 0.004}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        onEngineStop={() => fgRef.current?.zoomToFit(400, 50)}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const r = 16;
          const color = COLORS[node.type] || COLORS.function;

          ctx.beginPath();
          ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();

          const t = Date.now() * 0.003 + (node.index || 0);
          const pulse = 2 + Math.sin(t) * 2;
          ctx.beginPath();
          ctx.arc(node.x, node.y, r + pulse, 0, 2 * Math.PI);
          ctx.strokeStyle = "rgba(255,255,255,0.22)";
          ctx.lineWidth = 1;
          ctx.stroke();

          const label = String(node.id);
          const fontSize = Math.max(10, 12 / globalScale);
          ctx.font = `${fontSize}px Inter, system-ui, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#0f172a";
          ctx.fillText(label, node.x, node.y);
        }}
        linkCanvasObject={(link, ctx, globalScale) => {
          if (!link.label) return;
          const start = link.source;
          const end = link.target;
          if (typeof start !== "object" || typeof end !== "object") return;
          const midX = (start.x + end.x) / 2;
          const midY = (start.y + end.y) / 2;
          const fontSize = Math.max(9, 11 / globalScale);
          ctx.font = `${fontSize}px Inter, system-ui, sans-serif`;
          ctx.fillStyle = "rgba(255,255,255,0.6)";
          ctx.fillText(link.label, midX, midY);
        }}
      />
    </div>
  );
}
