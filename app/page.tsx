"use client";

import { useEffect, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Snippet {
  id: string;
  language: string;
  codeBlock: string;
  author: string;
  tags: string[];
  createdAt: string;
}

export default function Home() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetch("/api/snippets")
      .then((res) => res.json())
      .then((data) => setSnippets(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const filteredSnippets = snippets.filter((s) =>
    s.language.toLowerCase().includes(search.toLowerCase()) ||
    s.author.toLowerCase().includes(search.toLowerCase()) ||
    s.tags?.some((tag) =>
      tag.toLowerCase().includes(search.toLowerCase())
    )
  );

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setToast("Copied!");
    setTimeout(() => setToast(""), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 px-4 relative">
      <h1 className="text-3xl font-bold text-center mb-6">
        All Snippets
      </h1>

      <input
        type="text"
        placeholder="Search by language, author, or tags..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 p-2 rounded border focus:ring-2 focus:ring-indigo-500"
      />

      {loading && <p className="text-gray-500">Loading snippets...</p>}
      {!loading && filteredSnippets.length === 0 && (
        <p className="text-gray-500">No snippets found.</p>
      )}

      <div className="space-y-6">
        {filteredSnippets.map((snippet) => (
          <div
            key={snippet.id}
            className="bg-gray-900 rounded-lg p-4"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-white font-medium">
                {snippet.language} — {snippet.author}
                {snippet.tags?.length > 0 && (
                  <span className="text-gray-400 text-xs ml-2">
                    [{snippet.tags.join(", ")}]
                  </span>
                )}
              </div>

              <button
                onClick={() => copyToClipboard(snippet.codeBlock)}
                className="text-sm bg-white px-3 py-1 rounded"
              >
                Copy
              </button>
            </div>

            <SyntaxHighlighter
              language={snippet.language.toLowerCase()}
              style={tomorrow}
              customStyle={{
                borderRadius: "8px",
                padding: "16px",
              }}
              wrapLongLines
            >
              {snippet.codeBlock}
            </SyntaxHighlighter>
          </div>
        ))}
      </div>

      {toast && (
        <div className="fixed bottom-5 right-5 bg-green-500 text-white px-4 py-2 rounded shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}