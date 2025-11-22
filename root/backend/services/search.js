require('dotenv').config();
const axios = require('axios');

async function searchTrustedSites(query) {
  if (!query) {
    throw new Error('Query cannot be empty.');
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  const cseId = process.env.GOOGLE_CSE_ID;
  const searchQuery = `${query} site:.gov OR site:.org OR site:.edu`;

  if (!apiKey || !cseId) {
    throw new Error('Google API key or CSE ID is not configured.');
  }

  const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
    searchQuery
  )}&key=${apiKey}&cx=${cseId}`;

  try {
    const response = await axios.get(url);
    const items = response.data.items;

    if (!items || items.length === 0) {
      throw new Error('No results found.');
    }

    const firstResult = items[0];
    return {
      url: firstResult.link,
      title: firstResult.title,
    };
  } catch (error) {
    console.error('Error searching:', error);
    throw new Error('Failed to fetch search results.');
  }
}

module.exports = { searchTrustedSites };
