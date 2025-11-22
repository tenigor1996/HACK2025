const express = require('express');
const cors = require('cors');
const { searchTrustedSites } = require('./services/search');

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

const port = 5050;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
