# FocusBoard & EasySearch 🌌  
_A calmer, AI-powered way to explore the web for teens and older adults._

---

## Overview

Most of today’s web is optimized to keep people scrolling, not to help them think clearly.

- **Teens** are surrounded by feeds, notifications, and algorithmic rabbit holes that make it hard to stay focused on actual learning.
- **Older adults** face crowded layouts, tiny text, pop-ups, and dark patterns that make even a simple search feel stressful.

**FocusBoard & EasySearch** is a small answer to that problem:

- A **Teen Mode (“FocusBoard”)** that gives students a distraction-free research space with real-time focus stats and topic breakdowns — all calculated locally in the browser.
- An **Elder Mode (“EasySearch”)** that shows one clean, AI-generated answer at a time, based on trusted sources and plain-language summaries.

The core idea:

> Take a messy webpage → extract its main content → summarize it with Gemini →  
> show it in a calm interface that respects attention and privacy.

---

## Features

### 👵 Elder Mode – “EasySearch”

A gentle search experience for older adults:

- **Trusted search only**  
  Uses a backend endpoint that calls Google Custom Search and filters results to `.gov`, `.edu`, and `.org` domains.
- **Clutter-free reading**  
  The backend fetches HTML and uses `jsdom` to remove scripts, sidebars, nav bars, footers, and other non-content.
- **Gemini-powered summaries**  
  Cleaned text is summarized by Gemini with prompts tailored to older adults: short, clear, and jargon-free.
- **Accessible UI**  
  Larger text, high contrast themes, and a simple layout focused on one answer at a time.

---

### 🧑‍🎓 Teen Mode – “FocusBoard”

A focused research dashboard for teens:

- **Search → Extract → Summarize pipeline**  
  Same trusted-search pipeline, but with summaries tuned to be concise and more information-dense.
- **Focus tracking (local only)**  
  Uses scroll, mouse, and keyboard events to estimate:
  - active vs idle time,
  - reading duration after each result,
  - number and type of searches (manual, quick topics, quick actions).
- **Session analytics**  
  Computes a **session attention score** and aggregates:
  - total session duration,
  - active vs idle breakdown,
  - average reading time per result,
  - topic distribution for the session.
- **Visual feedback with charts**  
  - Line chart: focus score over time.  
  - Pie chart: search topics this session.
- **Quick actions**  
  Pre-built queries like:
  - “Find CS side-project ideas”
  - “Check your sleep basics”
  - “Reduce distractions plan”
- **Animated starfield background**  
  A subtle animated canvas with drifting and shooting stars behind the UI.

---

### 🛡️ Privacy & Ethics

- No accounts, no cookies, no persistent user tracking.
- Focus and engagement metrics are computed **entirely in the browser** and are not stored or sent to the server.
- Search results are restricted to more trustworthy domains (`.gov`, `.edu`, `.org`) to avoid clickbait and low-quality content.
- Gemini is used to **simplify** information, not to increase engagement time.

---

## Architecture

High-level structure:

```text
root/
├─ backend/
│  ├─ server.js            # Express server, API routes
│  └─ services/
│      ├─ search.js        # Google Custom Search wrapper
│      ├─ fetchPage.js     # HTML fetch + jsdom content extraction
│      └─ gemini.js        # Gemini summarization
│  └─ .env                 # Environment variables (not committed)
│
└─ frontend/
   ├─ src/
   │  ├─ App.jsx           # Main UI: landing, teen mode, elder mode
   │  ├─ Starfield.jsx     # Animated starfield background
   │  ├─ hooks/
   │  │   └─ useIntersectionObserver.js (for scroll animations, if used)
   │  ├─ main.jsx          # React entrypoint
   │  ├─ App.css           # Layout, themes, dashboard styling
   │  └─ index.css         # Global styles
   └─ index.html           # App container
