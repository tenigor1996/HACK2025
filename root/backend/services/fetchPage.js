const axios = require('axios');
const { JSDOM } = require('jsdom');

/**
 * Download a page and extract the main readable content in a robust, simple way.
 * No Readability – just DOM cleaning and paragraph / bullet extraction.
 * @param {string} url
 * @returns {Promise<{ title: string, contentText: string, contentHtml: string }>}
 */
async function fetchMainContent(url) {
  if (!url || !url.trim()) {
    throw new Error('Missing URL');
  }

  // Fetch HTML
  const response = await axios.get(url, {
    headers: {
      // Helps avoid some basic bot blocking
      'User-Agent': 'PresenceCircleBot/1.0 (+https://example.com)',
      'Accept': 'text/html,application/xhtml+xml',
    },
    maxRedirects: 5,
  });

  const html = response.data;

  // Build DOM
  const dom = new JSDOM(html, { url });
  const doc = dom.window.document;

  // Strip obvious noise
  ['script', 'style', 'noscript'].forEach(sel => {
    doc.querySelectorAll(sel).forEach(el => el.remove());
  });
  ['nav', 'footer', 'header', 'aside'].forEach(sel => {
    doc.querySelectorAll(sel).forEach(el => el.remove());
  });

  // Try to pick the main container
  const main =
    doc.querySelector('article') ||
    doc.querySelector('main') ||
    doc.querySelector('#content') ||
    doc.body;

  // Collect paragraphs first
  let blocks = Array.from(main.querySelectorAll('p'))
    .map(p => p.textContent.trim())
    .filter(Boolean);

  // Fallback: some pages (like "on this day" lists) mainly use <li>
  if (blocks.length === 0) {
    blocks = Array.from(main.querySelectorAll('li'))
      .map(li => li.textContent.trim())
      .filter(Boolean);

    // Don’t spam with 100 bullets – keep it sane
    if (blocks.length > 40) {
      blocks = blocks.slice(0, 40);
    }
  }

  if (blocks.length === 0) {
    throw new Error('No readable content found');
  }

  const titleEl = doc.querySelector('h1');
  const title =
    (titleEl && titleEl.textContent.trim()) ||
    doc.title ||
    url;

  const contentText = blocks.join('\n\n');
  const contentHtml = blocks
    .map(p => `<p>${p}</p>`)
    .join('\n');

  return { title, contentText, contentHtml };
}

module.exports = { fetchMainContent };
