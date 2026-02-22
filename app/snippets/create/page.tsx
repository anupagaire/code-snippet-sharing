"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";  
import "prismjs/components/prism-php";          
import "prismjs/components/prism-ruby";         
import "prismjs/components/prism-go";          
import "prismjs/components/prism-rust";     
import "prismjs/components/prism-swift";     
import "prismjs/components/prism-kotlin";     
import "prismjs/components/prism-css";          
import "prismjs/components/prism-json";     

export default function CreateSnippet() {
  const router = useRouter();
  const [language, setLanguage] = useState("");
  const [customLanguage, setCustomLanguage] = useState("");
  const [codeBlock, setCodeBlock] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If user types custom language, ignore dropdown
  const finalLanguage = customLanguage.trim() || language;

  // Re-highlight code whenever code or language changes
  useEffect(() => {
    Prism.highlightAll();
  }, [codeBlock, finalLanguage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!finalLanguage || !codeBlock) return setError("Language and code are required");

    const token = localStorage.getItem("user-token");
    if (!token) return setError("You must be logged in");

    setLoading(true);

    try {
      const res = await fetch("/api/snippets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ language: finalLanguage, codeBlock }),
      });

      if (!res.ok) {
        const data = await res.json();
        return setError(data.error || "Failed to create snippet");
      }

      router.push("/snippets");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-gray-100 rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Create Snippet</h1>
      {error && <p className="text-red-600 mb-3">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Select Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={customLanguage.trim() !== ""}
            className={`w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 ${
              customLanguage.trim() ? "bg-gray-200 cursor-not-allowed" : ""
            }`}
          >
            <option value="">-- Choose Language --</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="css">CSS</option>
            <option value="typescript">TypeScript</option>
            <option value="c++">C++</option>
            <option value="java">Java</option>
            <option value="php">PHP</option>
           
          </select>

          <label className="block text-sm font-medium mt-2">Or enter a custom language</label>
          <input
            type="text"
            placeholder="e.g., Go, Rust, Ruby..."
            value={customLanguage}
            onChange={(e) => setCustomLanguage(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Code Block */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Code Block</label>
          <textarea
            value={codeBlock}
            onChange={(e) => setCodeBlock(e.target.value)}
            rows={10}
            placeholder="Paste your code here..."
            className="w-full p-2 border rounded font-mono focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Live Preview */}
        {codeBlock && (
          <div className="mt-4">
            <h2 className="text-sm font-semibold mb-1">Live Preview:</h2>
            <pre className="p-4 bg-gray-900 text-white rounded overflow-x-auto">
              <code className={`language-${finalLanguage.toLowerCase()}`}>
                {codeBlock}
              </code>
            </pre>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Snippet"}
        </button>
      </form>
    </div>
  );
}