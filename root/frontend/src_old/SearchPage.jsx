import React, { useState } from "react";
import "./SearchPage.css";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [rawText, setRawText] = useState("");

  async function handleSearch() {
    setLoading(true);
    setError("");
    setSummary("");

    try {
      // Step 1 — search
      const searchRes = await fetch("http://localhost:5050/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const searchData = await searchRes.json();

      // Step 2 — fetch and extract
      const extractRes = await fetch("http://localhost:5050/api/fetch-and-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: searchData.url }),
      });
      const extractData = await extractRes.json();

      setTitle(extractData.title);
      setRawText(extractData.contentText);

      // Step 3 — summarize
      const sumRes = await fetch("http://localhost:5050/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: extractData.contentText }),
      });
      const sumData = await sumRes.json();

      setSummary(sumData.summary);
    } catch (e) {
      setError("Something went wrong. Try again.");
      console.error(e);
    }

    setLoading(false);
  }

  return (
    <div className="wrapper">
      <div className="glass-card">
        <h1 className="title">PresenceCircle</h1>
        <p className="subtitle">Simplifying the web for everyone.</p>

        <div className="search-box">
          <input
            type="text"
            placeholder="Ask something…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
        </div>

        {loading && <div className="loader"></div>}

        {error && <p className="error">{error}</p>}

        {summary && (
          <div className="result">
            <h2>{title}</h2>
            <h3>🟦 Simplified Summary</h3>
            <p className="summary-text">{summary}</p>

            <details>
              <summary>View full extracted text</summary>
              <pre className="raw-text">{rawText}</pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
