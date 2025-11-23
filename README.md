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

Backend flow


Search
POST /api/search → uses Google Custom Search API → returns { url, title } from .gov/.edu/.org.


Fetch & extract
POST /api/fetch-and-extract → fetches the HTML with axios, parses with jsdom, strips clutter, returns clean text.


Summarize
POST /api/summarize → sends extracted text to Gemini via @google/generative-ai, returns a short summary.


Frontend flow


User picks Teen or Elder on the landing page.


User types a question or clicks a quick action.


Frontend calls:


/api/search → /api/fetch-and-extract → /api/summarize.




The UI displays the summary and trusted source link.


Teen mode additionally:


updates focus metrics and charts based on user activity,


keeps all analytics in memory for the current session.





Tech Stack
Backend


Node.js


Express


Axios


jsdom


Google Custom Search API


Gemini (Generative AI) API via @google/generative-ai


dotenv


Frontend


React


Vite


Recharts


Vanilla CSS + CSS variables for theming


Custom canvas starfield animation


Client-side focus tracking using browser events



Setup & Installation

⚠️ Important:
Do not hard-code API keys in your code or commit them to Git.
Use a .env file (which should be in .gitignore) for secrets.

Prerequisites


Node.js (LTS recommended)


npm or yarn


API access:


A Google API key and Custom Search Engine ID (CSE ID).


A Gemini (Generative AI) API key.




1. Clone the repository
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>

2. Backend setup
cd backend
npm install

Create a .env file inside the backend/ directory:
# Gemini API key
API_KEY=<your-gemini-api-key>

# Google Custom Search API credentials
GOOGLE_API_KEY=<your-google-api-key>
GOOGLE_CSE_ID=<your-custom-search-engine-id>

Make sure .env is listed in backend/.gitignore so it never gets committed.
Run the backend:
node server.js
# or, if you have a dev script: npm run dev
# Default: http://localhost:5050

3. Frontend setup
In a new terminal:
cd frontend
npm install
npm run dev

By default, Vite will start the frontend on something like:
http://localhost:5173

The frontend is configured to call the backend at http://localhost:5050.
If your backend runs on a different port or host, update the URLs used in App.jsx.

Usage


Open the frontend URL (e.g., http://localhost:5173).


On the landing page, choose:


Teen / Student → FocusBoard dashboard.


Older adult → EasySearch simplified view.




Type a question or use quick actions:


The system will:


Search trusted domains via the backend.


Fetch and clean the top result.


Summarize it with Gemini.


Display a simple explanation and link to the original page.






In Teen Mode, watch focus stats and charts update as you interact.



Environment & Security Notes


Never commit .env or any file containing API keys.


For deployment:


Configure environment variables using your hosting platform’s secrets system.


Keep backend and frontend environment concerns separate (backend keys should not be exposed to the client).




All sensitive operations (Google CSE, Gemini calls) are handled on the backend.



Roadmap / Possible Improvements


Adaptive attention scoring that adjusts based on per-session behavior.


More robust multi-pass content extraction for complex websites.


Local caching of summaries to reduce repeated API calls.


Goal-based focus sessions (e.g., 25-minute deep work blocks).


Optional local session history stored in IndexedDB.


Better mobile layout + touch-based focus tracking.


Optional voice input and text-to-speech for accessibility.



License
Add a license of your choice, for example:
MIT License


Acknowledgements


Google Custom Search API for filtered search.


Gemini (Generative AI) API for summarization.


Recharts for data visualization.


Everyone thinking about humane, privacy-respecting alternatives to engagement-maximizing design.


::contentReference[oaicite:0]{index=0}
