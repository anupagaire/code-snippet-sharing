"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function CreateSnippet() {
  const router = useRouter();
  const [language, setLanguage] = useState("");
  const [customLanguage, setCustomLanguage] = useState("");
  const [codeBlock, setCodeBlock] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const finalLanguage = customLanguage.trim() || language;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!finalLanguage || !codeBlock.trim()) {
      return setError("Language and code are required");
    }

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
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed (${res.status})`);
      }

      router.push("/");
      router.refresh(); // optional: force refresh list
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-gray-100 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Create Snippet</h1>

      {error && <p className="text-red-600 mb-4 bg-red-50 p-3 rounded">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={customLanguage.trim() !== ""}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">-- Choose Language --</option>
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="php">PHP</option>
          <option value="ruby">Ruby</option>
          <option value="css">CSS</option>
        </select>

        <input
          type="text"
          placeholder="Or custom language (Go, Rust, etc.)"
          value={customLanguage}
          onChange={(e) => setCustomLanguage(e.target.value)}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500"
        />

        <textarea
          value={codeBlock}
          onChange={(e) => setCodeBlock(e.target.value)}
          rows={12}
          placeholder="Paste your code here..."
          className="w-full p-3 border rounded font-mono text-sm focus:ring-2 focus:ring-indigo-500"
        />

        {codeBlock && finalLanguage && (
          <div className="mt-4">
            <h2 className="text-sm font-semibold mb-2">Preview</h2>
            <SyntaxHighlighter
              language={finalLanguage.toLowerCase()}
              style={tomorrow}
              wrapLongLines
              customStyle={{ borderRadius: "8px", padding: "16px" }}
            >
              {codeBlock}
            </SyntaxHighlighter>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-black text-white rounded disabled:opacity-50 hover:bg-gray-800"
        >
          {loading ? "Creating..." : "Create Snippet"}
        </button>
      </form>
    </div>
  );
}