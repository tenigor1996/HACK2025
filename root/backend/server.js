const express = require('express');
const cors = require('cors');
const { searchTrustedSites } = require('./services/search');
const { fetchMainContent } = require('./services/fetchPage');

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
    // Log the full underlying error to the console for debugging.
    console.error('fetch-and-extract error:', err);

    // Return HTTP 500 with a helpful error message.
    res.status(500).json({ error: `Fetch and extract failed: ${err.message}` });
  }
});

const port = 5050;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;