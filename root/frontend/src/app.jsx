// import "./App.css";
// import { useEffect, useRef, useState } from "react";
// import useIntersectionObserver from "./hooks/useIntersectionObserver";

// function App() {
//   const [userType, setUserType] = useState(null); // null | "elder" | "teen"

//   // Elder view state (existing EasySearch flow)
//   const [query, setQuery] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState(null);

//   // Teen dashboard state
//   const [teenQuery, setTeenQuery] = useState("");
//   const [teenLoading, setTeenLoading] = useState(false);
//   const [teenResult, setTeenResult] = useState(null);
//   const [teenSearchCount, setTeenSearchCount] = useState(0);
//   const [lastTopic, setLastTopic] = useState("");
//   const [backendStatus, setBackendStatus] = useState("checking"); // checking | online | offline

//   const observer = useIntersectionObserver({ threshold: 0.1 });
//   const animatedElements = useRef([]);

//   useEffect(() => {
//     animatedElements.current.forEach((el) => {
//       if (el && observer.current) {
//         observer.current.observe(el);
//       }
//     });
//   }, [observer]);

//   // Check backend health once so the teen dashboard can show a status pill
//   useEffect(() => {
//     async function checkHealth() {
//       try {
//         const res = await fetch("http://localhost:5050/api/health");
//         if (!res.ok) throw new Error("Health check failed");
//         setBackendStatus("online");
//       } catch (err) {
//         console.error("Health check error:", err);
//         setBackendStatus("offline");
//       }
//     }

//     checkHealth();
//   }, []);

//   // Shared flow to call your backend: search → fetch-and-extract → summarize
//   async function runSearchFlow(question) {
//     const trimmed = question.trim();
//     if (!trimmed) {
//       throw new Error("Please enter a question.");
//     }

//     // STEP 1 — Search trusted sites (.gov, .org, .edu)
//     const searchRes = await fetch("http://localhost:5050/api/search", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ query: trimmed }),
//     });

//     const searchData = await searchRes.json();
//     if (!searchRes.ok || !searchData.url) {
//       throw new Error(searchData.error || "Search failed.");
//     }

//     // STEP 2 — Extract the main readable content from the page
//     const extractRes = await fetch(
//       "http://localhost:5050/api/fetch-and-extract",
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ url: searchData.url }),
//       }
//     );

//     const extractData = await extractRes.json();
//     if (!extractRes.ok || !extractData.contentText) {
//       throw new Error(extractData.error || "Failed to extract website content.");
//     }

//     // STEP 3 — Summarize with Gemini
//     const summaryRes = await fetch("http://localhost:5050/api/summarize", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ text: extractData.contentText }),
//     });

//     const summaryData = await summaryRes.json();
//     if (!summaryRes.ok || !summaryData.summary) {
//       throw new Error(summaryData.error || "Summarization failed.");
//     }

//     // Final combined result
//     return {
//       title: extractData.title,
//       summary: summaryData.summary,
//       url: searchData.url,
//     };
//   }

//   // Elder flow: same as your current handleSearch, but using runSearchFlow
//   async function handleElderSearch() {
//     try {
//       setLoading(true);
//       setResult(null);
//       const data = await runSearchFlow(query);
//       setResult(data);
//     } catch (err) {
//       console.error(err);
//       alert("Error: " + err.message);
//     } finally {
//       setLoading(false);
//     }
//   }

//   // Teen flow: dashboard search + metrics
//   async function handleTeenSearch(customQuery) {
//     const q = (customQuery ?? teenQuery).trim();
//     if (!q) {
//       alert("Type something to search.");
//       return;
//     }

//     try {
//       setTeenLoading(true);
//       setTeenResult(null);
//       const data = await runSearchFlow(q);
//       setTeenResult(data);
//       setTeenSearchCount((prev) => prev + 1);
//       setLastTopic(q);
//     } catch (err) {
//       console.error(err);
//       alert("Error: " + err.message);
//     } finally {
//       setTeenLoading(false);
//     }
//   }

//   function changeTheme(theme) {
//     document.body.className = theme;
//   }

//   // Simple “attention” score based on how many searches the teen has done
//   const focusScore = Math.min(teenSearchCount * 20, 100);

//   // Landing screen (first thing user sees)
//   if (!userType) {
//     return (
//       <div className="landing">
//         <div className="landing-inner">
//           <h1 className="landing-title">EasySearch</h1>
//           <p className="landing-tagline">
//             Choose your experience so we can tailor the web to you.
//           </p>

//           <div className="role-options">
//             <div className="role-card">
//               <h2>For Elders</h2>
//               <p>
//                 Large text, simple summaries, and trusted sources only. Perfect
//                 if you just want clear answers.
//               </p>
//               <button onClick={() => setUserType("elder")}>
//                 Continue as Elder
//               </button>
//             </div>

//             <div className="role-card role-card--accent">
//               <h2>For Teens</h2>
//               <p>
//                 A focused dashboard that tracks your study activity and helps
//                 you stay on task while exploring the web.
//               </p>
//               <button onClick={() => setUserType("teen")}>
//                 Continue as Teen
//               </button>
//             </div>
//           </div>

//           <div className="landing-footer">
//             <span className="landing-note">
//               You can always switch your profile later.
//             </span>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Elder UI (very close to your existing design)
//   if (userType === "elder") {
//     return (
//       <div className="wrapper">
//         <div className="top-bar">
//           <button
//             className="link-button"
//             onClick={() => {
//               setUserType(null);
//               animatedElements.current = [];
//             }}
//           >
//             ← Change profile
//           </button>
//         </div>

//         <h1
//           ref={(el) => (animatedElements.current[0] = el)}
//           className="scroll-animate fade-up"
//         >
//           EasySearch
//         </h1>
//         <p
//           ref={(el) => (animatedElements.current[1] = el)}
//           className="tagline scroll-animate fade-up"
//         >
//           Web simplified for older adults ❤️
//         </p>

//         <input
//           ref={(el) => (animatedElements.current[2] = el)}
//           className="scroll-animate fade-left"
//           placeholder="Enter a question..."
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//         />

//         <button
//           ref={(el) => (animatedElements.current[3] = el)}
//           className="scroll-animate fade-right"
//           onClick={handleElderSearch}
//           disabled={loading}
//         >
//           {loading ? "Searching..." : "Search"}
//         </button>

//         {result && (
//           <div
//             ref={(el) => (animatedElements.current[4] = el)}
//             className="card scroll-animate blur-in"
//           >
//             <h2>{result.title}</h2>
//             <p>{result.summary}</p>
//             <a href={result.url} target="_blank" rel="noopener noreferrer">
//               Read original source
//             </a>
//           </div>
//         )}

//         <div className="theme-switcher">
//           <label>
//             Theme:&nbsp;
//             <select onChange={(e) => changeTheme(e.target.value)}>
//               <option value="">Default</option>
//               <option value="theme-purple">Neon Tech Purple</option>
//               <option value="theme-cyberblue">Cyber Blue</option>
//               <option value="theme-lavared">Lava Red</option>
//               <option value="theme-emeraldmatrix">Emerald Matrix Green</option>
//               <option value="theme-stealthblack">Stealth Black</option>
//             </select>
//           </label>
//         </div>
//       </div>
//     );
//   }

//   // Teen dashboard UI
//   return (
//     <div className="teen-wrapper">
//       <div className="top-bar">
//         <button
//           className="link-button"
//           onClick={() => {
//             setUserType(null);
//             animatedElements.current = [];
//           }}
//         >
//           ← Change profile
//         </button>
//       </div>

//       <header className="dashboard-header">
//         <div>
//           <h1>FocusBoard</h1>
//           <p className="dashboard-tagline">
//             A smarter way to explore the web while keeping an eye on your
//             attention.
//           </p>
//         </div>
//         <div className="status-pill">
//           <span
//             className={
//               backendStatus === "online"
//                 ? "status-dot status-dot--online"
//                 : "status-dot status-dot--offline"
//             }
//           />
//           <span className="status-text">
//             Backend{" "}
//             {backendStatus === "checking"
//               ? "checking..."
//               : backendStatus === "online"
//               ? "online"
//               : "offline"}
//           </span>
//         </div>
//       </header>

//       <div className="dashboard-grid">
//         {/* Main search + quick topics */}
//         <section className="dashboard-card dashboard-card--wide">
//           <h2>Ask anything</h2>
//           <p className="section-subtitle">
//             We’ll search trusted sites, extract key info, and summarize it for
//             you.
//           </p>

//           <div className="search-row">
//             <input
//               placeholder="E.g. best ways to stay focused while studying physics"
//               value={teenQuery}
//               onChange={(e) => setTeenQuery(e.target.value)}
//             />
//             <button onClick={() => handleTeenSearch()} disabled={teenLoading}>
//               {teenLoading ? "Searching..." : "Search"}
//             </button>
//           </div>

//           <div className="quick-topics">
//             <span className="quick-label">Try a quick topic:</span>
//             <button
//               className="pill-button"
//               onClick={() =>
//                 handleTeenSearch("how to build a consistent study routine")
//               }
//             >
//               Study Routine
//             </button>
//             <button
//               className="pill-button"
//               onClick={() =>
//                 handleTeenSearch(
//                   "tips for managing stress and anxiety for college students"
//                 )
//               }
//             >
//               Mental Health
//             </button>
//             <button
//               className="pill-button"
//               onClick={() =>
//                 handleTeenSearch(
//                   "scholarships for computer science students in the US"
//                 )
//               }
//             >
//               Scholarships
//             </button>
//             <button
//               className="pill-button"
//               onClick={() =>
//                 handleTeenSearch(
//                   "how to manage time between school, work, and side projects"
//                 )
//               }
//             >
//               Time Management
//             </button>
//           </div>
//         </section>

//         {/* Focus / attention metrics */}
//         <section className="dashboard-card">
//           <h2>Focus tracker</h2>
//           <p className="section-subtitle">
//             These numbers update based on what you do in this session.
//           </p>

//           <div className="metrics-row">
//             <div className="metric">
//               <span className="metric-label">Focus score</span>
//               <span className="metric-value">{focusScore}%</span>
//               <div className="progress">
//                 <div
//                   className="progress-bar"
//                   style={{ width: `${focusScore}%` }}
//                 />
//               </div>
//             </div>

//             <div className="metric">
//               <span className="metric-label">Searches this session</span>
//               <span className="metric-value">{teenSearchCount}</span>
//             </div>

//             <div className="metric">
//               <span className="metric-label">Last topic</span>
//               <span className="metric-value metric-value--small">
//                 {lastTopic || "None yet"}
//               </span>
//             </div>
//           </div>
//         </section>

//         {/* Extra actions / “stuff that looks like it works” */}
//         <section className="dashboard-card">
//           <h2>Quick actions</h2>
//           <p className="section-subtitle">
//             Use these shortcuts when you don’t know what to ask.
//           </p>

//           <div className="quick-actions">
//             <button
//               className="quick-action-button"
//               onClick={() =>
//                 handleTeenSearch(
//                   "what are some simple project ideas to learn javascript"
//                 )
//               }
//             >
//               ⚡ Find CS side-project ideas
//             </button>
//             <button
//               className="quick-action-button"
//               onClick={() =>
//                 handleTeenSearch(
//                   "how much sleep does a 17 year old need for good health"
//                 )
//               }
//             >
//               😴 Check your sleep basics
//             </button>
//             <button
//               className="quick-action-button"
//               onClick={() =>
//                 handleTeenSearch(
//                   "tips for staying off social media during homework"
//                 )
//               }
//             >
//               📵 Reduce distractions plan
//             </button>
//           </div>

//           <div className="theme-switcher theme-switcher--right">
//             <label>
//               Theme:&nbsp;
//               <select onChange={(e) => changeTheme(e.target.value)}>
//                 <option value="">Default</option>
//                 <option value="theme-purple">Neon Tech Purple</option>
//                 <option value="theme-cyberblue">Cyber Blue</option>
//                 <option value="theme-lavared">Lava Red</option>
//                 <option value="theme-emeraldmatrix">Emerald Matrix Green</option>
//                 <option value="theme-stealthblack">Stealth Black</option>
//               </select>
//             </label>
//           </div>
//         </section>
//       </div>

//       {teenResult && (
//         <div className="card dashboard-result">
//           <h2>{teenResult.title}</h2>
//           <p>{teenResult.summary}</p>
//           <a href={teenResult.url} target="_blank" rel="noopener noreferrer">
//             Open full article
//           </a>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;

import "./App.css";
import { useEffect, useRef, useState } from "react";
import useIntersectionObserver from "./hooks/useIntersectionObserver";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const CATEGORY_COLORS = [
  "#6366f1",
  "#22c55e",
  "#eab308",
  "#ec4899",
  "#f97316",
  "#06b6d4",
];

function formatDuration(totalSeconds) {
  if (!totalSeconds || totalSeconds < 0) return "0 sec";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds} sec`;
  if (minutes < 60) {
    return `${minutes} min ${seconds.toString().padStart(2, "0")} sec`;
  }
  const hours = Math.floor(minutes / 60);
  const remMin = minutes % 60;
  return `${hours}h ${remMin}m`;
}

function App() {
  const [userType, setUserType] = useState(null); // null | "elder" | "teen"

  // Elder view state
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

  // Session analytics
  const [sessionStart, setSessionStart] = useState(null);
  const [lastInteractionTime, setLastInteractionTime] = useState(null);
  const [timeStats, setTimeStats] = useState({
    activeSeconds: 0,
    idleSeconds: 0,
  });

  const [readingSeconds, setReadingSeconds] = useState(0);
  const [currentResultStart, setCurrentResultStart] = useState(null);
  const [currentResultDeep, setCurrentResultDeep] = useState(false);
  const [deepReads, setDeepReads] = useState(0);

  const [searchTypeCounts, setSearchTypeCounts] = useState({
    manual: 0,
    quickTopic: 0,
    quickAction: 0,
  });
  const [categoryCounts, setCategoryCounts] = useState({});
  const [searchTimestamps, setSearchTimestamps] = useState([]);

  const [focusScore, setFocusScore] = useState(0);
  const [focusHistory, setFocusHistory] = useState([]);

  const observer = useIntersectionObserver({ threshold: 0.1 });
  const animatedElements = useRef([]);

  // Scroll animations for elder view
  useEffect(() => {
    animatedElements.current.forEach((el) => {
      if (el && observer.current) {
        observer.current.observe(el);
      }
    });
  }, [observer]);

  // Backend health check (used by teen dashboard)
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

  // Mark any interaction as activity (only in teen mode)
  useEffect(() => {
    if (userType !== "teen") return;

    const handleInteraction = () => {
      const now = Date.now();
      setLastInteractionTime(now);
      setSessionStart((prev) => prev ?? now);
    };

    window.addEventListener("scroll", handleInteraction);
    window.addEventListener("keydown", handleInteraction);
    window.addEventListener("mousemove", handleInteraction);
    window.addEventListener("click", handleInteraction);

    return () => {
      window.removeEventListener("scroll", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("mousemove", handleInteraction);
      window.removeEventListener("click", handleInteraction);
    };
  }, [userType]);

  // Active vs idle time + reading time
  useEffect(() => {
    if (userType !== "teen" || !sessionStart) return;

    const IDLE_THRESHOLD_MS = 60_000;

    const interval = setInterval(() => {
      const now = Date.now();
      const isIdle =
        !lastInteractionTime || now - lastInteractionTime > IDLE_THRESHOLD_MS;

      setTimeStats((prev) => ({
        activeSeconds: prev.activeSeconds + (isIdle ? 0 : 1),
        idleSeconds: prev.idleSeconds + (isIdle ? 1 : 0),
      }));

      // Reading time only counts when a result is visible and user is active
      if (!isIdle && teenResult) {
        setReadingSeconds((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [userType, sessionStart, lastInteractionTime, teenResult]);

  // Deep-read detection based on scroll + time on current result
  useEffect(() => {
    if (userType !== "teen") return;

    const checkDeepReadOnScroll = () => {
      const now = Date.now();
      const scrollDepth =
        (window.scrollY || window.pageYOffset) /
        (document.body.scrollHeight - window.innerHeight || 1);

      if (
        teenResult &&
        currentResultStart &&
        !currentResultDeep &&
        now - currentResultStart > 20_000 &&
        scrollDepth > 0.6
      ) {
        setDeepReads((prev) => prev + 1);
        setCurrentResultDeep(true);
      }
    };

    window.addEventListener("scroll", checkDeepReadOnScroll);
    return () => window.removeEventListener("scroll", checkDeepReadOnScroll);
  }, [userType, teenResult, currentResultStart, currentResultDeep]);

  // Compute focus score and history whenever stats change
  useEffect(() => {
    if (userType !== "teen" || !sessionStart) return;

    const { activeSeconds } = timeStats;
    const totalSearches =
      searchTypeCounts.manual +
      searchTypeCounts.quickTopic +
      searchTypeCounts.quickAction;
    const uniqueTopics = Object.keys(categoryCounts).length;

    // Active time: 25 minutes of active = 100
    const activeComponent = Math.min(
      (activeSeconds / (25 * 60)) * 100,
      100
    );

    // Deep reads: 5 good reads = 100
    const deepComponent = Math.min((deepReads / 5) * 100, 100);

    // Variety: more unique topics vs total searches
    const varietyComponent =
      totalSearches > 0
        ? Math.min((uniqueTopics / totalSearches) * 100, 100)
        : 0;

    // Pace: not too spammy, not too slow
    let paceComponent = 0;
    if (searchTimestamps.length >= 2) {
      const intervals = [];
      for (let i = 1; i < searchTimestamps.length; i++) {
        intervals.push(
          (searchTimestamps[i] - searchTimestamps[i - 1]) / 1000
        );
      }
      const avgInterval =
        intervals.reduce((a, b) => a + b, 0) / intervals.length;

      // Ideal roughly between 40–120 seconds
      const clamped = Math.min(Math.max(avgInterval, 10), 300);
      paceComponent =
        100 - (Math.abs(clamped - 80) / 80) * 60; // farther from 80s → lower score
      paceComponent = Math.max(0, Math.min(100, paceComponent));
    }

    const score =
      0.4 * activeComponent +
      0.3 * deepComponent +
      0.2 * varietyComponent +
      0.1 * paceComponent;

    const rounded = Math.round(score);
    setFocusScore(rounded);

    const minutesFromStart = (Date.now() - sessionStart) / 60000;
    setFocusHistory((prev) => {
      const newPoint = {
        t: minutesFromStart.toFixed(1),
        score: rounded,
      };
      const arr = [...prev, newPoint];
      if (arr.length > 40) arr.shift();
      return arr;
    });
  }, [
    userType,
    sessionStart,
    timeStats.activeSeconds,
    deepReads,
    searchTypeCounts.manual,
    searchTypeCounts.quickTopic,
    searchTypeCounts.quickAction,
    categoryCounts,
    searchTimestamps,
  ]);

  // Shared backend flow
  async function runSearchFlow(question) {
    const trimmed = question.trim();
    if (!trimmed) {
      throw new Error("Please enter a question.");
    }

    // STEP 1 — Search trusted sites
    const searchRes = await fetch("http://localhost:5050/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: trimmed }),
    });

    const searchData = await searchRes.json();
    if (!searchRes.ok || !searchData.url) {
      throw new Error(searchData.error || "Search failed.");
    }

    // STEP 2 — Extract main content
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
      throw new Error(
        extractData.error || "Failed to extract website content."
      );
    }

    // STEP 3 — Summarize
    const summaryRes = await fetch("http://localhost:5050/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: extractData.contentText }),
    });

    const summaryData = await summaryRes.json();
    if (!summaryRes.ok || !summaryData.summary) {
      throw new Error(summaryData.error || "Summarization failed.");
    }

    return {
      title: extractData.title,
      summary: summaryData.summary,
      url: searchData.url,
    };
  }

  // Elder flow
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

  // Teen flow
  async function handleTeenSearch(customQuery, opts = {}) {
    const { type = "manual", category = "Custom" } = opts;
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

      setSearchTypeCounts((prev) => ({
        ...prev,
        [type]: (prev[type] || 0) + 1,
      }));

      setCategoryCounts((prev) => ({
        ...prev,
        [category]: (prev[category] || 0) + 1,
      }));

      setSearchTimestamps((prev) => [...prev, Date.now()]);
      setCurrentResultStart(Date.now());
      setCurrentResultDeep(false);
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

  // Derived stats for teen view
  const sessionSeconds =
    timeStats.activeSeconds + timeStats.idleSeconds;
  const activePct =
    sessionSeconds > 0
      ? Math.round((timeStats.activeSeconds / sessionSeconds) * 100)
      : 0;

  const categoryData = Object.entries(categoryCounts).map(
    ([name, value]) => ({ name, value })
  );

  const totalSearches =
    searchTypeCounts.manual +
    searchTypeCounts.quickTopic +
    searchTypeCounts.quickAction;

  const bestPoint =
    focusHistory.length > 0
      ? focusHistory.reduce((best, p) =>
          p.score > best.score ? p : best
        )
      : null;

  const topCategory =
    categoryData.length > 0
      ? categoryData.reduce((best, c) =>
          c.value > best.value ? c : best
        ).name
      : null;

  const activeShare = activePct;

  // Landing screen
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
                Large text, simple summaries, and trusted sources only.
                Perfect if you just want clear answers.
              </p>
              <button onClick={() => setUserType("elder")}>
                Continue as Elder
              </button>
            </div>

            <div className="role-card role-card--accent">
              <h2>For Teens</h2>
              <p>
                A focused dashboard that tracks your study activity and
                helps you stay on task while exploring the web.
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

  // Elder UI
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
        {/* Ask anything */}
        <section className="dashboard-card dashboard-card--wide">
          <h2>Ask anything</h2>
          <p className="section-subtitle">
            We’ll search trusted sites, extract key info, and summarize it
            for you.
          </p>

          <div className="search-row">
            <input
              placeholder="E.g. best ways to stay focused while studying physics"
              value={teenQuery}
              onChange={(e) => setTeenQuery(e.target.value)}
            />
            <button
              onClick={() =>
                handleTeenSearch(undefined, {
                  type: "manual",
                  category: "Custom",
                })
              }
              disabled={teenLoading}
            >
              {teenLoading ? "Searching..." : "Search"}
            </button>
          </div>

          <div className="quick-topics">
            <span className="quick-label">Try a quick topic:</span>
            <button
              className="pill-button"
              onClick={() =>
                handleTeenSearch(
                  "how to build a consistent study routine",
                  { type: "quickTopic", category: "Study routine" }
                )
              }
            >
              Study Routine
            </button>
            <button
              className="pill-button"
              onClick={() =>
                handleTeenSearch(
                  "tips for managing stress and anxiety for college students",
                  { type: "quickTopic", category: "Mental health" }
                )
              }
            >
              Mental Health
            </button>
            <button
              className="pill-button"
              onClick={() =>
                handleTeenSearch(
                  "scholarships for computer science students in the US",
                  { type: "quickTopic", category: "Scholarships" }
                )
              }
            >
              Scholarships
            </button>
            <button
              className="pill-button"
              onClick={() =>
                handleTeenSearch(
                  "how to manage time between school, work, and side projects",
                  { type: "quickTopic", category: "Time management" }
                )
              }
            >
              Time Management
            </button>
          </div>
        </section>

        {/* Focus tracker + charts */}
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
              <span className="metric-label">Session time</span>
              <span className="metric-value">
                {formatDuration(sessionSeconds)}
              </span>
            </div>

            <div className="metric">
              <span className="metric-label">Active vs idle</span>
              <div className="stacked-bar">
                <div
                  className="stacked-bar-active"
                  style={{ width: `${activePct}%` }}
                />
                <div
                  className="stacked-bar-idle"
                  style={{ width: `${100 - activePct}%` }}
                />
              </div>
              <span className="metric-caption">
                Active {formatDuration(timeStats.activeSeconds)} · Idle{" "}
                {formatDuration(timeStats.idleSeconds)}
              </span>
            </div>

            <div className="metric-group">
              <div className="small-metric">
                <span className="metric-label">Searches (typed)</span>
                <span className="metric-value">
                  {searchTypeCounts.manual}
                </span>
              </div>
              <div className="small-metric">
                <span className="metric-label">Quick topics</span>
                <span className="metric-value">
                  {searchTypeCounts.quickTopic}
                </span>
              </div>
              <div className="small-metric">
                <span className="metric-label">Quick actions</span>
                <span className="metric-value">
                  {searchTypeCounts.quickAction}
                </span>
              </div>
            </div>

            <div className="metric">
              <span className="metric-label">
                Avg reading time per result
              </span>
              <span className="metric-value metric-value--small">
                {teenSearchCount > 0
                  ? `${Math.round(
                      readingSeconds / Math.max(teenSearchCount, 1)
                    )} sec`
                  : "—"}
              </span>
            </div>
          </div>

          <div className="chart-row">
            <div className="chart-container">
              <h3 className="chart-title">Focus over time</h3>
              {focusHistory.length === 0 ? (
                <p className="chart-placeholder">
                  Start searching to see your focus trend.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={focusHistory}>
                    <XAxis dataKey="t" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} hide />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#020617",
                        border: "1px solid #1f2937",
                        fontSize: "0.8rem",
                      }}
                      labelFormatter={(v) => `Minute ${v}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="chart-container">
              <h3 className="chart-title">Topics this session</h3>
              {categoryData.length === 0 ? (
                <p className="chart-placeholder">
                  Use quick topics or actions to see a breakdown.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={70}
                    >
                      {categoryData.map((entry, idx) => (
                        <Cell
                          key={entry.name}
                          fill={
                            CATEGORY_COLORS[
                              idx % CATEGORY_COLORS.length
                            ]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
        backgroundColor: "#020617",
        border: "1px solid #1f2937",
        fontSize: "0.8rem",
        color: "#e5e7eb",
      }}
      labelStyle={{ color: "#e5e7eb" }}
      itemStyle={{ color: "#e5e7eb" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <ul className="insights-list">
            <li>
              Your computed focus score this session is{" "}
              <strong>{focusScore}</strong> / 100.
            </li>
            {bestPoint && (
              <li>
                You were most focused around minute{" "}
                <strong>{bestPoint.t}</strong> of this session.
              </li>
            )}
            {topCategory && (
              <li>
                Most of your searches were about{" "}
                <strong>{topCategory}</strong>.
              </li>
            )}
            {sessionSeconds > 0 && (
              <li>
                You were actively interacting with the page for{" "}
                <strong>{activeShare}%</strong> of this session.
              </li>
            )}
          </ul>
        </section>

        {/* Quick actions */}
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
                  "what are some simple project ideas to learn javascript",
                  { type: "quickAction", category: "Side projects" }
                )
              }
            >
              ⚡ Find CS side-project ideas
            </button>
            <button
              className="quick-action-button"
              onClick={() =>
                handleTeenSearch(
                  "how much sleep does a 17 year old need for good health",
                  { type: "quickAction", category: "Sleep" }
                )
              }
            >
              😴 Check your sleep basics
            </button>
            <button
              className="quick-action-button"
              onClick={() =>
                handleTeenSearch(
                  "tips for staying off social media during homework",
                  { type: "quickAction", category: "Distractions" }
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
                <option value="theme-emeraldmatrix">
                  Emerald Matrix Green
                </option>
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
