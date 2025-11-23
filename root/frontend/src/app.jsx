import "./App.css";
import { useState } from "react";

function App() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function handleSearch() {
    setLoading(true);
    setResult(null);

    try {
      // STEP 1 — Search trusted sites (.gov, .org, .edu)
      const searchRes = await fetch("http://localhost:5050/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const searchData = await searchRes.json();
      if (!searchData.url) throw new Error("Search failed!");

      // STEP 2 — Extract the main readable content from the page
      const extractRes = await fetch("http://localhost:5050/api/fetch-and-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: searchData.url }),
      });

      const extractData = await extractRes.json();
      if (!extractData.contentText)
        throw new Error("Failed to extract website content");

      // STEP 3 — Summarize with Gemini
      const summaryRes = await fetch("http://localhost:5050/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: extractData.contentText }),
      });

      const summaryData = await summaryRes.json();
      if (!summaryData.summary)
        throw new Error("Summarization failed!");

      // STEP 4 — Save everything to display
      setResult({
        title: extractData.title,
        summary: summaryData.summary,
        url: searchData.url,
      });

    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    }

    setLoading(false);
  }

  return (
    <div className="wrapper">
      <h1>EasySearch</h1>
      <p className="tagline">Web simplified for older adults ❤️</p>

      <input
        placeholder="Enter a question..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <button onClick={handleSearch} disabled={loading}>
        {loading ? "Searching..." : "Search"}
      </button>

      {result && (
        <div className="card">
          <h2>{result.title}</h2>
          <p>{result.summary}</p>
          <a href={result.url} target="_blank" rel="noopener noreferrer">
            Read original source
          </a>
        </div>
      )}
    </div>
  );
}

export default App;
