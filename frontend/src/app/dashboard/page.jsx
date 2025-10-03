"use client";
import Navbar from "../component/Navbar";
import { useState } from "react";
import { Upload, FolderOpen, Database, Activity } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import AstGraph to avoid SSR issues
const AstGraph = dynamic(() => import("../component/astgraph"), {
  ssr: false,
});

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("upload");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [localPath, setLocalPath] = useState("");
  const [query, setQuery] = useState("");
  const [queryResults, setQueryResults] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);

  // Health Check Handler
  const checkHealth = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("http://localhost:8080/v1/healthcheck");
      const data = await res.json();
      setHealthStatus(data);
      setMessage("✅ Backend is healthy!");
    } catch (err) {
      setMessage("❌ Error: " + err.message);
      setHealthStatus(null);
    }
    setLoading(false);
  };

  // File Upload Handler
  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setMessage("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("⚠️ Please select a file first.");
      return;
    }

    setLoading(true);
    setMessage("📤 Uploading and analyzing...");

    try {
      const formData = new FormData();
      formData.append("codebase", file);

      const res = await fetch("http://localhost:8080/v1/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage("❌ Error: " + (data.error || "Upload failed"));
      } else {
        setMessage("✅ " + (data.message || "Upload successful!"));
      }
    } catch (err) {
      setMessage("❌ Error: " + err.message);
    }
    setLoading(false);
  };

  // Analyze Local Directory Handler
  const handleAnalyzeLocal = async () => {
    if (!localPath) {
      setMessage("⚠️ Please enter a directory path.");
      return;
    }

    setLoading(true);
    setMessage("🔍 Analyzing local directory...");

    try {
      const res = await fetch("http://localhost:8080/v1/analyze-local", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path: localPath }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage("❌ Error: " + (data.error || "Analysis failed"));
      } else {
        setMessage("✅ " + (data.message || "Analysis successful!"));
      }
    } catch (err) {
      setMessage("❌ Error: " + err.message);
    }
    setLoading(false);
  };

  // Query Handler
  const handleQuery = async () => {
    if (!query) {
      setMessage("⚠️ Please enter a Cypher query.");
      return;
    }

    setLoading(true);
    setMessage("🔍 Executing query...");

    try {
      const res = await fetch("http://localhost:8080/v1/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, params: {} }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage("❌ Error: " + (data.error || "Query failed"));
        setQueryResults(null);
      } else {
        setQueryResults(data);
        setMessage("✅ Query executed successfully!");
      }
    } catch (err) {
      setMessage("❌ Error: " + err.message);
      setQueryResults(null);
    }
    setLoading(false);
  };

  const tabs = [
    { id: "upload", label: "Upload Codebase", icon: Upload },
    { id: "local", label: "Analyze Local", icon: FolderOpen },
    { id: "query", label: "Query Database", icon: Database },
    { id: "visualize", label: "Visualize", icon: Activity },
  ];

  return (
    <div className="bg-gradient-to-b from-teal-900 to-slate-950 min-h-screen text-white">
      <Navbar />

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-extrabold mt-8 mb-4 bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
            CodeMap Dashboard
          </h1>
          <p className="text-lg text-gray-300">
            Analyze, visualize, and query your codebase structure
          </p>
        </div>

        {/* Health Check Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={checkHealth}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg font-semibold shadow-lg transition duration-300 disabled:opacity-50"
          >
            Check Backend Health
          </button>
        </div>

        {healthStatus && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-green-900/30 border border-green-500 rounded-lg">
            <p className="text-green-300">
              <strong>Status:</strong> {healthStatus.status} | <strong>Version:</strong> {healthStatus.version} | <strong>Environment:</strong> {healthStatus.environment}
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex justify-center space-x-2 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMessage("");
                  setQueryResults(null);
                }}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition duration-300 ${
                  activeTab === tab.id
                    ? "bg-teal-600 text-white shadow-lg"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="max-w-4xl mx-auto">
          {/* Upload Tab */}
          {activeTab === "upload" && (
            <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-gray-700">
              <h2 className="text-3xl font-bold mb-4 text-teal-400">Upload Codebase (ZIP)</h2>
              <p className="text-gray-300 mb-6">
                Upload a ZIP file containing your codebase. It will be analyzed and imported into Neo4j.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-300">Select ZIP File</label>
                  <input
                    type="file"
                    accept=".zip"
                    onChange={handleFileChange}
                    className="w-full p-3 border border-gray-600 rounded-lg bg-gray-900 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-teal-600 file:text-white hover:file:bg-teal-700 file:cursor-pointer"
                  />
                </div>

                {file && (
                  <div className="text-sm text-gray-400">
                    Selected: <span className="text-teal-400 font-semibold">{file.name}</span>
                  </div>
                )}

                <button
                  onClick={handleUpload}
                  disabled={loading || !file}
                  className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-lg font-semibold shadow-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Processing..." : "Upload & Analyze"}
                </button>
              </div>
            </div>
          )}

          {/* Analyze Local Tab */}
          {activeTab === "local" && (
            <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-gray-700">
              <h2 className="text-3xl font-bold mb-4 text-teal-400">Analyze Local Directory</h2>
              <p className="text-gray-300 mb-6">
                Provide a local directory path to analyze. The backend must have access to this path.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-300">Directory Path</label>
                  <input
                    type="text"
                    value={localPath}
                    onChange={(e) => setLocalPath(e.target.value)}
                    placeholder="e.g., C:\Users\YourName\Projects\MyApp"
                    className="w-full p-3 border border-gray-600 rounded-lg bg-gray-900 text-white placeholder-gray-500"
                  />
                </div>

                <button
                  onClick={handleAnalyzeLocal}
                  disabled={loading || !localPath}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-lg font-semibold shadow-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Analyzing..." : "Analyze Directory"}
                </button>
              </div>
            </div>
          )}

          {/* Query Tab */}
          {activeTab === "query" && (
            <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-gray-700">
              <h2 className="text-3xl font-bold mb-4 text-teal-400">Query Neo4j Database</h2>
              <p className="text-gray-300 mb-6">
                Execute Cypher queries to explore your code structure in Neo4j.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-300">Cypher Query</label>
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="MATCH (n) RETURN n LIMIT 25"
                    rows={6}
                    className="w-full p-3 border border-gray-600 rounded-lg bg-gray-900 text-white font-mono text-sm placeholder-gray-500"
                  />
                </div>

                <button
                  onClick={handleQuery}
                  disabled={loading || !query}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg font-semibold shadow-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Executing..." : "Execute Query"}
                </button>
              </div>

              {queryResults && (
                <div className="mt-6">
                  <h3 className="text-xl font-bold mb-3 text-teal-400">Results:</h3>
                  <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 max-h-96 overflow-auto">
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                      {JSON.stringify(queryResults, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Visualize Tab */}
          {activeTab === "visualize" && (
            <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-gray-700">
              <h2 className="text-3xl font-bold mb-4 text-teal-400">Code Structure Visualization</h2>
              <p className="text-gray-300 mb-6">
                Interactive graph visualization of your code structure.
              </p>
              <AstGraph />
            </div>
          )}

          {/* Message Display */}
          {message && (
            <div
              className={`mt-6 p-4 rounded-lg font-semibold text-center ${
                message.includes("❌")
                  ? "bg-red-900/30 border border-red-500 text-red-300"
                  : message.includes("⚠️")
                  ? "bg-yellow-900/30 border border-yellow-500 text-yellow-300"
                  : "bg-green-900/30 border border-green-500 text-green-300"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
