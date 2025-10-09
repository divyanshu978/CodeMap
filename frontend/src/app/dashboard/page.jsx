"use client";
import Navbar from "../component/Navbar";
import QueryDashboard from "../component/QueryDashboard";
import { useState } from "react";
import GraphView from "../component/GraphView";

export default function Dashboard() {
  const [file, setFile] = useState(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [message, setMessage] = useState("");
  const [uploadType, setUploadType] = useState("zip"); // "zip" or "github"
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleZipUpload = async () => {
    if (!file) {
      setMessage("Please select a file first.");
      return;
    }

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
        setMessage("Error: " + (data.error || "Upload failed"));
      } else {
        setMessage(data.message || "Upload successful!");
      }
    } catch (err) {
      setMessage("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGithubUpload = async () => {
    if (!githubUrl) {
      setMessage("Please enter a GitHub repository URL.");
      return;
    }

    if (!githubUrl.includes("github.com")) {
      setMessage("Please enter a valid GitHub repository URL.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/v1/github", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repo_url: githubUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage("Error: " + (data.error || "GitHub upload failed"));
      } else {
        setMessage(data.message || "GitHub repository uploaded successfully!");
      }
    } catch (err) {
      setMessage("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = () => {
    if (uploadType === "zip") {
      handleZipUpload();
    } else {
      handleGithubUpload();
    }
  };

  return (
    <>
      <div className="bg-gradient-to-b from-teal-800 to-teal-950 min-h-screen text-white">
        <Navbar />

        <div className=" mx-auto px-4 py-8">
          {/* <div className="text-center mb-8">
            <h1 className="text-4xl font-bold">CodeMap Dashboard</h1>
            <p className="mt-4 text-lg text-gray-300">
              Upload your code and explore with intelligent queries
            </p>
          </div> */}

          {/* Responsive two-section layout */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-8 items-start">
            {/* Input Section */}
            <section className="bg-gray-800 rounded-lg p-8 shadow-lg ">
              <div>
                <h2 className="text-2xl font-semibold mb-6 text-center"> Upload Your Codebase</h2>
                {/* Upload Type Toggle */}
                <div className="flex justify-center mb-8">
                  <div className="flex bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => {
                        setUploadType("zip");
                        setMessage("");
                      }}
                      className={`px-6 py-2 rounded-md transition-colors ${
                        uploadType === "zip"
                          ? "bg-teal-500 text-white"
                          : "text-gray-300 hover:text-white"
                      }`}
                    >
                      📁 Zip File
                    </button>
                    <button
                      onClick={() => {
                        setUploadType("github");
                        setMessage("");
                      }}
                      className={`px-6 py-2 rounded-md transition-colors ${
                        uploadType === "github"
                          ? "bg-teal-500 text-white"
                          : "text-gray-300 hover:text-white"
                      }`}
                    >
                      🐙 GitHub Repo
                    </button>
                  </div>
                </div>

                {/* Upload Forms */}
                {uploadType === "zip" ? (
                  <div className="space-y-6">
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-teal-500 transition-colors">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".zip"
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <div className="text-4xl mb-4">📁</div>
                        <p className="text-lg mb-2">
                          {file ? file.name : "Click to select a zip file"}
                        </p>
                        <p className="text-gray-400">Upload your codebase for analysis</p>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <input
                        type="url"
                        placeholder="https://github.com/username/repository"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                      />
                      <p className="text-sm text-gray-400">
                        Enter a public GitHub repository URL to analyze
                      </p>
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                <div className="mt-6">
                  <button
                    onClick={handleUpload}
                    disabled={loading || (uploadType === "zip" ? !file : !githubUrl)}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                      loading || (uploadType === "zip" ? !file : !githubUrl)
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : "bg-teal-500 hover:bg-teal-600 text-white"
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        {uploadType === "zip" ? "Uploading..." : "Cloning & Uploading..."}
                      </span>
                    ) : (
                      `Analyze ${uploadType === "zip" ? "Zip File" : "GitHub Repo"}`
                    )}
                  </button>
                </div>

                {/* Message Display */}
                {message && (
                  <div className={`mt-6 p-4 rounded-lg ${
                    message.includes("Error") 
                      ? "bg-red-900/50 border border-red-500 text-red-200" 
                      : "bg-green-900/50 border border-green-500 text-green-200"
                  }`}>
                    <p>{message}</p>
                  </div>
                )}
              </div>
            </section>

            {/* Query Section */}
            <section className="bg-gray-800 rounded-lg p-8 shadow-lg h-98% h- flex flex-col">
              {/* <h2 className="text-2xl font-semibold mb-6 text-center"> Demo Analyzing graph</h2> */}
              <GraphView/>
            </section>
          </div>
        </div>

  <section className="bg-gray-800 rounded-lg p-8 shadow-lg h-full flex flex-col">
              <h2 className="text-2xl font-semibold mb-6 text-center"> Query & Analyze</h2>
              <QueryDashboard />
            </section>

      </div>
    </>
  );
}