const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const port = 5050;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
