"use client";
import Navbar from "../component/Navbar";
import QueryDashboard from "../component/QueryDashboard";
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
  const [githubUrl, setGithubUrl] = useState("");
  const [message, setMessage] = useState("");

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setMessage("");
    }
  };

  const handleZipUpload = async () => {
    if (!file) {
      setMessage("⚠️ Please select a file first.");
      return;
    }

    setLoading(true);
    setMessage("📤 Uploading and analyzing...");

    setLoading(true);
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
      setMessage("Error: " + err.message);
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
    <>
      <div className="bg-gradient-to-b from-teal-800 to-teal-950 min-h-screen flex flex-col items-center text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-4xl font-bold mt-10">Welcome to the Dashboard</h1>
          <p className="mt-4 text-lg">
            This is your dashboard where you can manage your activities.
          </p>
        </div>

        <div className="mt-6">
          <input
            type="file"
            onChange={handleFileChange}
            className="mt-4 p-2 border border-gray-300 rounded text-black"
          />
          <button
            className="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleUpload}
          >
            Upload
          </button>
        </div>

        {message && <p className="mt-4">{message}</p>}
      </div>

      <div>
        
      </div>
    </div>
  );
}
