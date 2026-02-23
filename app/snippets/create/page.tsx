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

    if (!finalLanguage || !codeBlock) {
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
        body: JSON.stringify({
          language: finalLanguage,
          codeBlock,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        return setError(data.error || "Failed to create snippet");
      }

      router.push("/");
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

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={customLanguage.trim() !== ""}
          className="w-full p-2 border rounded"
        >
          <option value="">-- Choose Language --</option>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="typescript">TypeScript</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="php">PHP</option>
          <option value="ruby">Ruby</option>
          <option value="css">CSS</option>
        </select>

        <input
          type="text"
          placeholder="Or custom language (Go, Rust...)"
          value={customLanguage}
          onChange={(e) => setCustomLanguage(e.target.value)}
          className="w-full p-2 border rounded"
        />

        <textarea
          value={codeBlock}
          onChange={(e) => setCodeBlock(e.target.value)}
          rows={10}
          placeholder="Paste your code here..."
          className="w-full p-2 border rounded font-mono"
        />

        {codeBlock && finalLanguage && (
          <div>
            <h2 className="text-sm font-semibold mb-1">
              Live Preview
            </h2>

            <SyntaxHighlighter
              language={finalLanguage.toLowerCase()}
              style={tomorrow}
              wrapLongLines
              customStyle={{
                borderRadius: "8px",
                padding: "16px",
              }}
            >
              {codeBlock}
            </SyntaxHighlighter>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Snippet"}
        </button>
      </form>
    </div>
  );
}