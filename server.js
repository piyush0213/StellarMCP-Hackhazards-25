const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the public directory
app.use(express.static('public'));

// Routes for API endpoints
app.get('/api/prices', async (req, res) => {
  try {
    const { fetchStellarTokenPrices } = require('./lib/fetch-stellar-prices');
    const prices = await fetchStellarTokenPrices();
    res.json(prices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/volume', async (req, res) => {
  try {
    const { fetchStellarVolume } = require('./lib/fetch-stellar-volume');
    const volume = await fetchStellarVolume();
    res.json(volume);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tvl', async (req, res) => {
  try {
    const { fetchStellarTVL } = require('./lib/fetch-stellar-tvl');
    const tvl = await fetchStellarTVL();
    res.json(tvl);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Handle all other routes by serving index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 