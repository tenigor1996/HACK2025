import "./App.css";
import { useEffect, useRef, useState } from "react";
import useIntersectionObserver from "./hooks/useIntersectionObserver";

function App() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const observer = useIntersectionObserver({ threshold: 0.1 });

  const animatedElements = useRef([]);

  useEffect(() => {
    animatedElements.current.forEach(el => {
      if (el && observer.current) {
        observer.current.observe(el);
      }
    });
  }, [observer]);

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

  function changeTheme(theme) {
    document.body.className = theme;
  }

  return (
    <div className="wrapper">
      <h1 ref={el => animatedElements.current[0] = el} className="scroll-animate fade-up">EasySearch</h1>
      <p ref={el => animatedElements.current[1] = el} className="tagline scroll-animate fade-up">Web simplified for older adults ❤️</p>

      <input
        ref={el => animatedElements.current[2] = el}
        className="scroll-animate fade-left"
        placeholder="Enter a question..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <button
        ref={el => animatedElements.current[3] = el}
        className="scroll-animate fade-right"
        onClick={handleSearch}
        disabled={loading}
      >
        {loading ? "Searching..." : "Search"}
      </button>

      {result && (
        <div ref={el => animatedElements.current[4] = el} className="card scroll-animate blur-in">
          <h2>{result.title}</h2>
          <p>{result.summary}</p>
          <a href={result.url} target="_blank" rel="noopener noreferrer">
            Read original source
          </a>
        </div>
      )}

      <div className="theme-switcher">
        <select onChange={(e) => changeTheme(e.target.value)}>
          <option value="">Default</option>
          <option value="theme-purple">Neon Tech Purple</option>
          <option value="theme-cyberblue">Cyber Blue</option>
          <option value="theme-lavared">Lava Red</option>
          <option value="theme-emeraldmatrix">Emerald Matrix Green</option>
          <option value="theme-stealthblack">Stealth Black</option>
        </select>
      </div>

    </div>
  );
}

export default App;
