
"use client";

import { useEffect, useState } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css"; 

interface Snippet {
  id: string;
  language: string;
  codeBlock: string;
  author: string;
  createdAt: string;
}

export default function Home() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);

  useEffect(() => {
    fetch("/api/snippets")
      .then(res => res.json())
      .then(data => setSnippets(data));
  }, []);

  // Highlight code whenever snippets change
  useEffect(() => {
    Prism.highlightAll();
  }, [snippets]);

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold mb-6">All Snippets</h1>
      {snippets.map((snippet) => (
        <div key={snippet.id} className="mb-6 bg-gray-900 p-4 rounded-lg">
          <div className="text-sm text-gray-400 mb-2">
            {snippet.language} — by {snippet.author}
          </div>
          <pre>
            <code className={`language-${snippet.language.toLowerCase()}`}>
              {snippet.codeBlock}
            </code>
          </pre>
        </div>
      ))}
    </div>
  );
}