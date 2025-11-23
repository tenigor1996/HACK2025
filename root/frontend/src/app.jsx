// import "./App.css";
// import { useEffect, useRef, useState } from "react";
// import useIntersectionObserver from "./hooks/useIntersectionObserver";

// function App() {
//   const [query, setQuery] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState(null);

//   const observer = useIntersectionObserver({ threshold: 0.1 });

//   const animatedElements = useRef([]);

//   useEffect(() => {
//     animatedElements.current.forEach(el => {
//       if (el && observer.current) {
//         observer.current.observe(el);
//       }
//     });
//   }, [observer]);

//   async function handleSearch() {
//     setLoading(true);
//     setResult(null);

//     try {
//       // STEP 1 — Search trusted sites (.gov, .org, .edu)
//       const searchRes = await fetch("http://localhost:5050/api/search", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ query }),
//       });

//       const searchData = await searchRes.json();
//       if (!searchData.url) throw new Error("Search failed!");

//       // STEP 2 — Extract the main readable content from the page
//       const extractRes = await fetch("http://localhost:5050/api/fetch-and-extract", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ url: searchData.url }),
//       });

//       const extractData = await extractRes.json();
//       if (!extractData.contentText)
//         throw new Error("Failed to extract website content");

//       // STEP 3 — Summarize with Gemini
//       const summaryRes = await fetch("http://localhost:5050/api/summarize", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ text: extractData.contentText }),
//       });

//       const summaryData = await summaryRes.json();
//       if (!summaryData.summary)
//         throw new Error("Summarization failed!");

//       // STEP 4 — Save everything to display
//       setResult({
//         title: extractData.title,
//         summary: summaryData.summary,
//         url: searchData.url,
//       });

//     } catch (err) {
//       console.error(err);
//       alert("Error: " + err.message);
//     }

//     setLoading(false);
//   }

//   function changeTheme(theme) {
//     document.body.className = theme;
//   }

//   return (
//     <div className="wrapper">
//       <h1 ref={el => animatedElements.current[0] = el} className="scroll-animate fade-up">EasySearch</h1>
//       <p ref={el => animatedElements.current[1] = el} className="tagline scroll-animate fade-up">Web simplified for older adults ❤️</p>

//       <input
//         ref={el => animatedElements.current[2] = el}
//         className="scroll-animate fade-left"
//         placeholder="Enter a question..."
//         value={query}
//         onChange={(e) => setQuery(e.target.value)}
//       />

//       <button
//         ref={el => animatedElements.current[3] = el}
//         className="scroll-animate fade-right"
//         onClick={handleSearch}
//         disabled={loading}
//       >
//         {loading ? "Searching..." : "Search"}
//       </button>

//       {result && (
//         <div ref={el => animatedElements.current[4] = el} className="card scroll-animate blur-in">
//           <h2>{result.title}</h2>
//           <p>{result.summary}</p>
//           <a href={result.url} target="_blank" rel="noopener noreferrer">
//             Read original source
//           </a>
//         </div>
//       )}

//       <div className="theme-switcher">
//         <select onChange={(e) => changeTheme(e.target.value)}>
//           <option value="">Default</option>
//           <option value="theme-purple">Neon Tech Purple</option>
//           <option value="theme-cyberblue">Cyber Blue</option>
//           <option value="theme-lavared">Lava Red</option>
//           <option value="theme-emeraldmatrix">Emerald Matrix Green</option>
//           <option value="theme-stealthblack">Stealth Black</option>
//         </select>
//       </div>

//     </div>
//   );
// }

// export default App;


import "./App.css";
import { useEffect, useRef, useState } from "react";
import useIntersectionObserver from "./hooks/useIntersectionObserver";

function App() {
  const [userType, setUserType] = useState(null); // null | "elder" | "teen"

  // Elder view state (existing EasySearch flow)
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Teen dashboard state
  const [teenQuery, setTeenQuery] = useState("");
  const [teenLoading, setTeenLoading] = useState(false);
  const [teenResult, setTeenResult] = useState(null);
  const [teenSearchCount, setTeenSearchCount] = useState(0);
  const [lastTopic, setLastTopic] = useState("");
  const [backendStatus, setBackendStatus] = useState("checking"); // checking | online | offline

  const observer = useIntersectionObserver({ threshold: 0.1 });
  const animatedElements = useRef([]);

  useEffect(() => {
    animatedElements.current.forEach((el) => {
      if (el && observer.current) {
        observer.current.observe(el);
      }
    });
  }, [observer]);

  // Check backend health once so the teen dashboard can show a status pill
  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch("http://localhost:5050/api/health");
        if (!res.ok) throw new Error("Health check failed");
        setBackendStatus("online");
      } catch (err) {
        console.error("Health check error:", err);
        setBackendStatus("offline");
      }
    }

    checkHealth();
  }, []);

  // Shared flow to call your backend: search → fetch-and-extract → summarize
  async function runSearchFlow(question) {
    const trimmed = question.trim();
    if (!trimmed) {
      throw new Error("Please enter a question.");
    }

    // STEP 1 — Search trusted sites (.gov, .org, .edu)
    const searchRes = await fetch("http://localhost:5050/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: trimmed }),
    });

    const searchData = await searchRes.json();
    if (!searchRes.ok || !searchData.url) {
      throw new Error(searchData.error || "Search failed.");
    }

    // STEP 2 — Extract the main readable content from the page
    const extractRes = await fetch(
      "http://localhost:5050/api/fetch-and-extract",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: searchData.url }),
      }
    );

    const extractData = await extractRes.json();
    if (!extractRes.ok || !extractData.contentText) {
      throw new Error(extractData.error || "Failed to extract website content.");
    }

    // STEP 3 — Summarize with Gemini
    const summaryRes = await fetch("http://localhost:5050/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: extractData.contentText }),
    });

    const summaryData = await summaryRes.json();
    if (!summaryRes.ok || !summaryData.summary) {
      throw new Error(summaryData.error || "Summarization failed.");
    }

    // Final combined result
    return {
      title: extractData.title,
      summary: summaryData.summary,
      url: searchData.url,
    };
  }

  // Elder flow: same as your current handleSearch, but using runSearchFlow
  async function handleElderSearch() {
    try {
      setLoading(true);
      setResult(null);
      const data = await runSearchFlow(query);
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  // Teen flow: dashboard search + metrics
  async function handleTeenSearch(customQuery) {
    const q = (customQuery ?? teenQuery).trim();
    if (!q) {
      alert("Type something to search.");
      return;
    }

    try {
      setTeenLoading(true);
      setTeenResult(null);
      const data = await runSearchFlow(q);
      setTeenResult(data);
      setTeenSearchCount((prev) => prev + 1);
      setLastTopic(q);
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setTeenLoading(false);
    }
  }

  function changeTheme(theme) {
    document.body.className = theme;
  }

  // Simple “attention” score based on how many searches the teen has done
  const focusScore = Math.min(teenSearchCount * 20, 100);

  // Landing screen (first thing user sees)
  if (!userType) {
    return (
      <div className="landing">
        <div className="landing-inner">
          <h1 className="landing-title">EasySearch</h1>
          <p className="landing-tagline">
            Choose your experience so we can tailor the web to you.
          </p>

          <div className="role-options">
            <div className="role-card">
              <h2>For Elders</h2>
              <p>
                Large text, simple summaries, and trusted sources only. Perfect
                if you just want clear answers.
              </p>
              <button onClick={() => setUserType("elder")}>
                Continue as Elder
              </button>
            </div>

            <div className="role-card role-card--accent">
              <h2>For Teens</h2>
              <p>
                A focused dashboard that tracks your study activity and helps
                you stay on task while exploring the web.
              </p>
              <button onClick={() => setUserType("teen")}>
                Continue as Teen
              </button>
            </div>
          </div>

          <div className="landing-footer">
            <span className="landing-note">
              You can always switch your profile later.
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Elder UI (very close to your existing design)
  if (userType === "elder") {
    return (
      <div className="wrapper">
        <div className="top-bar">
          <button
            className="link-button"
            onClick={() => {
              setUserType(null);
              animatedElements.current = [];
            }}
          >
            ← Change profile
          </button>
        </div>

        <h1
          ref={(el) => (animatedElements.current[0] = el)}
          className="scroll-animate fade-up"
        >
          EasySearch
        </h1>
        <p
          ref={(el) => (animatedElements.current[1] = el)}
          className="tagline scroll-animate fade-up"
        >
          Web simplified for older adults ❤️
        </p>

        <input
          ref={(el) => (animatedElements.current[2] = el)}
          className="scroll-animate fade-left"
          placeholder="Enter a question..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button
          ref={(el) => (animatedElements.current[3] = el)}
          className="scroll-animate fade-right"
          onClick={handleElderSearch}
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>

        {result && (
          <div
            ref={(el) => (animatedElements.current[4] = el)}
            className="card scroll-animate blur-in"
          >
            <h2>{result.title}</h2>
            <p>{result.summary}</p>
            <a href={result.url} target="_blank" rel="noopener noreferrer">
              Read original source
            </a>
          </div>
        )}

        <div className="theme-switcher">
          <label>
            Theme:&nbsp;
            <select onChange={(e) => changeTheme(e.target.value)}>
              <option value="">Default</option>
              <option value="theme-purple">Neon Tech Purple</option>
              <option value="theme-cyberblue">Cyber Blue</option>
              <option value="theme-lavared">Lava Red</option>
              <option value="theme-emeraldmatrix">Emerald Matrix Green</option>
              <option value="theme-stealthblack">Stealth Black</option>
            </select>
          </label>
        </div>
      </div>
    );
  }

  // Teen dashboard UI
  return (
    <div className="teen-wrapper">
      <div className="top-bar">
        <button
          className="link-button"
          onClick={() => {
            setUserType(null);
            animatedElements.current = [];
          }}
        >
          ← Change profile
        </button>
      </div>

      <header className="dashboard-header">
        <div>
          <h1>FocusBoard</h1>
          <p className="dashboard-tagline">
            A smarter way to explore the web while keeping an eye on your
            attention.
          </p>
        </div>
        <div className="status-pill">
          <span
            className={
              backendStatus === "online"
                ? "status-dot status-dot--online"
                : "status-dot status-dot--offline"
            }
          />
          <span className="status-text">
            Backend{" "}
            {backendStatus === "checking"
              ? "checking..."
              : backendStatus === "online"
              ? "online"
              : "offline"}
          </span>
        </div>
      </header>

      <div className="dashboard-grid">
        {/* Main search + quick topics */}
        <section className="dashboard-card dashboard-card--wide">
          <h2>Ask anything</h2>
          <p className="section-subtitle">
            We’ll search trusted sites, extract key info, and summarize it for
            you.
          </p>

          <div className="search-row">
            <input
              placeholder="E.g. best ways to stay focused while studying physics"
              value={teenQuery}
              onChange={(e) => setTeenQuery(e.target.value)}
            />
            <button onClick={() => handleTeenSearch()} disabled={teenLoading}>
              {teenLoading ? "Searching..." : "Search"}
            </button>
          </div>

          <div className="quick-topics">
            <span className="quick-label">Try a quick topic:</span>
            <button
              className="pill-button"
              onClick={() =>
                handleTeenSearch("how to build a consistent study routine")
              }
            >
              Study Routine
            </button>
            <button
              className="pill-button"
              onClick={() =>
                handleTeenSearch(
                  "tips for managing stress and anxiety for college students"
                )
              }
            >
              Mental Health
            </button>
            <button
              className="pill-button"
              onClick={() =>
                handleTeenSearch(
                  "scholarships for computer science students in the US"
                )
              }
            >
              Scholarships
            </button>
            <button
              className="pill-button"
              onClick={() =>
                handleTeenSearch(
                  "how to manage time between school, work, and side projects"
                )
              }
            >
              Time Management
            </button>
          </div>
        </section>

        {/* Focus / attention metrics */}
        <section className="dashboard-card">
          <h2>Focus tracker</h2>
          <p className="section-subtitle">
            These numbers update based on what you do in this session.
          </p>

          <div className="metrics-row">
            <div className="metric">
              <span className="metric-label">Focus score</span>
              <span className="metric-value">{focusScore}%</span>
              <div className="progress">
                <div
                  className="progress-bar"
                  style={{ width: `${focusScore}%` }}
                />
              </div>
            </div>

            <div className="metric">
              <span className="metric-label">Searches this session</span>
              <span className="metric-value">{teenSearchCount}</span>
            </div>

            <div className="metric">
              <span className="metric-label">Last topic</span>
              <span className="metric-value metric-value--small">
                {lastTopic || "None yet"}
              </span>
            </div>
          </div>
        </section>

        {/* Extra actions / “stuff that looks like it works” */}
        <section className="dashboard-card">
          <h2>Quick actions</h2>
          <p className="section-subtitle">
            Use these shortcuts when you don’t know what to ask.
          </p>

          <div className="quick-actions">
            <button
              className="quick-action-button"
              onClick={() =>
                handleTeenSearch(
                  "what are some simple project ideas to learn javascript"
                )
              }
            >
              ⚡ Find CS side-project ideas
            </button>
            <button
              className="quick-action-button"
              onClick={() =>
                handleTeenSearch(
                  "how much sleep does a 17 year old need for good health"
                )
              }
            >
              😴 Check your sleep basics
            </button>
            <button
              className="quick-action-button"
              onClick={() =>
                handleTeenSearch(
                  "tips for staying off social media during homework"
                )
              }
            >
              📵 Reduce distractions plan
            </button>
          </div>

          <div className="theme-switcher theme-switcher--right">
            <label>
              Theme:&nbsp;
              <select onChange={(e) => changeTheme(e.target.value)}>
                <option value="">Default</option>
                <option value="theme-purple">Neon Tech Purple</option>
                <option value="theme-cyberblue">Cyber Blue</option>
                <option value="theme-lavared">Lava Red</option>
                <option value="theme-emeraldmatrix">Emerald Matrix Green</option>
                <option value="theme-stealthblack">Stealth Black</option>
              </select>
            </label>
          </div>
        </section>
      </div>

      {teenResult && (
        <div className="card dashboard-result">
          <h2>{teenResult.title}</h2>
          <p>{teenResult.summary}</p>
          <a href={teenResult.url} target="_blank" rel="noopener noreferrer">
            Open full article
          </a>
        </div>
      )}
    </div>
  );
}

export default App;
