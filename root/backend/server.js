
// require('dotenv').config({ path: __dirname + '/.env' });
// console.log("Loaded KEY?", process.env.API_KEY);

// const express = require('express');
// const cors = require('cors');
// const { searchTrustedSites } = require('./services/search');
// const { fetchMainContent } = require('./services/fetchPage');
// const { summarizeText } = require('./services/gemini');

// const app = express();

// app.use(cors());
// app.use(express.json());

// app.get('/api/health', (req, res) => {
//   res.json({ status: 'ok' });
// });

// app.post('/api/search', async (req, res) => {
//   const { query } = req.body;

//   if (!query) {
//     return res.status(400).json({ error: 'Missing query' });
//   }

//   try {
//     const result = await searchTrustedSites(query);
//     res.json(result);
//   } catch (error) {
//     console.error('Search error:', error);
//     res.status(500).json({ error: 'Search failed' });
//   }
// });

// app.post('/api/fetch-and-extract', async (req, res) => {
//   try {
//     const { url } = req.body;

//     if (!url) {
//       return res.status(400).json({ error: 'Missing url' });
//     }

//     const result = await fetchMainContent(url);
//     res.json(result);
//   } catch (err) {
//     console.error('fetch-and-extract error:', err);
//     res
//       .status(500)
//       .json({ error: `Fetch and extract failed: ${err.message}` });
//   }
// });

// app.post('/api/summarize', async (req, res) => {
//   try {
//     const { text } = req.body;

//     if (!text) {
//       return res.status(400).json({ error: 'Missing text' });
//     }

//     const summary = await summarizeText(text);
//     res.json({ summary });
//   } catch (err) {
//     console.error('Summarization error:', err.message);
//     res.status(500).json({ error: 'Summarization failed' });
//   }
// });

// /**
//  * Daily history / gentle story for elders.
//  * Uses a public "This Day in History" page and summarizes it with Gemini.
//  */
// app.get('/api/daily-history', async (req, res) => {
//   try {
//     const url = 'https://www.history.com/this-day-in-history';

//     const main = await fetchMainContent(url);
//     const summary = await summarizeText(main.contentText);

//     res.json({
//       title: main.title,
//       summary,
//       url,
//     });
//   } catch (err) {
//     console.error('daily-history error:', err);
//     res.status(500).json({ error: 'Failed to load daily history.' });
//   }
// });

// const port = 5050;
// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

// module.exports = app;


require('dotenv').config({ path: __dirname + '/.env' });
console.log("Loaded KEY?", process.env.API_KEY);

const express = require('express');
const cors = require('cors');
const { searchTrustedSites } = require('./services/search');
const { fetchMainContent } = require('./services/fetchPage');
const { summarizeText } = require('./services/gemini');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/search', async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Missing query' });
  }

  try {
    const result = await searchTrustedSites(query);
    res.json(result);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

app.post('/api/fetch-and-extract', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'Missing url' });
    }

    const result = await fetchMainContent(url);
    res.json(result);
  } catch (err) {
    console.error('fetch-and-extract error:', err);
    res
      .status(500)
      .json({ error: `Fetch and extract failed: ${err.message}` });
  }
});

app.post('/api/summarize', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Missing text' });
    }

    const summary = await summarizeText(text);
    res.json({ summary });
  } catch (err) {
    console.error('Summarization error:', err.message);
    res.status(500).json({ error: 'Summarization failed' });
  }
});

/**
 * Daily history / gentle story for elders.
 * Uses OnThisDay and summarizes it with Gemini to keep it short and friendly.
 */
app.get('/api/daily-history', async (req, res) => {
  try {
    // Simple "today in history" page
    const url = 'https://www.onthisday.com/today/events.php';

    const main = await fetchMainContent(url);
    const summary = await summarizeText(main.contentText);

    res.json({
      title: main.title || 'Today in history',
      summary,
      url,
    });
  } catch (err) {
    console.error('daily-history error:', err);
    res.status(500).json({ error: 'Failed to load daily history.' });
  }
});

const port = 5050;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
