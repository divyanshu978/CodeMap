"use client";
import Navbar from "../component/Navbar";
import { useState } from "react";

export default function Dashboard() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first.");
      return;
    }

    try {
      const formData = new FormData();
      // IMPORTANT: backend expects "codebase"
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
    }
  };

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
    </>
  );
}
