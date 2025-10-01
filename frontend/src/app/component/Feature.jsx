import React from "react";
import {
  Network,
  GitBranch,
  Database,
  Eye,
  Search,
  Download,
  BarChart3,
  Layers,
  Code2,
} from "lucide-react";

export default function FeatureSection() {
  const features = [
    {
      icon: Network,
      title: "Interactive Graph Visualization",
      description:
        "Explore your code relationships through interactive network graphs powered by D3.js and Cytoscape.",
    },
    {
      icon: Code2,
      title: "AST Analysis Engine",
      description:
        "Advanced Abstract Syntax Tree parsing using Tree-sitter for accurate code structure analysis.",
    },
    {
      icon: Database,
      title: "Graph Database Storage",
      description:
        "Store and query code relationships using Neo4j for complex dependency analysis.",
    },
    {
      icon: Eye,
      title: "Real-time Code Mapping",
      description:
        "Watch your code transform into visual maps as you upload and analyze your projects.",
    },
    {
      icon: Search,
      title: "Smart Code Search",
      description:
        "Find functions, classes, and dependencies across your entire codebase instantly.",
    },
    {
      icon: BarChart3,
      title: "Architecture Analytics",
      description:
        "Get insights into code complexity, coupling, and architectural patterns.",
    },
    {
      icon: Layers,
      title: "Multi-Layer Views",
      description:
        "Switch between different abstraction levels from functions to modules to systems.",
    },
    {
      icon: Download,
      title: "Export & Share",
      description:
        "Export your code maps in various formats and share with your development team.",
    },
    {
      icon: GitBranch,
      title: "Version Comparison",
      description:
        "Compare code structures across different versions and track architectural evolution.",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-teal-800 to-teal-950 w-full">
      <div className="text-center mb-10">
        <div className="inline-flex items-baseline">
          <h2 className="text-5xl font-bold text-white">Our</h2>
          <h1 className="text-5xl font-bold text-teal-400 ml-3">Features</h1>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-6 md:px-12 lg:px-20">
        {features.map((f, idx) => {
          const Icon = f.icon;
          return (
            <div
              key={idx}
              className="relative bg-gradient-to-b from-teal-950/40 to-gray-900/30 border border-gray-800/60 p-8 rounded-2xl shadow-[0_6px_18px_rgba(2,6,23,0.6)] hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-start gap-4 mb-4">
                {/* icon square */}
                <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-[#0b1220] border border-gray-800/40 flex items-center justify-center shadow-inner">
                  <Icon className="w-7 h-7 text-teal-400" />
                </div>

                <h3 className="text-2xl font-semibold text-white leading-tight">
                  {f.title}
                </h3>
              </div>

              <p className="text-gray-300 text-lg">{f.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
