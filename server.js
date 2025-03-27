const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config(); // Loads variables from .env in dev mode

const app = express();

// ✅ Allow only frontend origin
app.use(cors({
  origin: 'https://repo-frontend-tau.vercel.app',
  credentials: true
}));

app.use(bodyParser.json());

// ✅ Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Define schema
const poiSchema = new mongoose.Schema({
  username: String,  // <-- Added to track which user this POI belongs to
  description: { type: String, required: true },
  highlightedData: [{
    entity: String,
    url: String
  }]
});

const POI = mongoose.model('POI', poiSchema);

// ✅ Simple login
const USER = { username: "admin", password: "1234" };

// === ROUTES ===

// ✅ Health check
app.get('/', (req, res) => {
  res.send('🚀 Backend is live and running!');
});

// ✅ Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === USER.username && password === USER.password) {
    res.json({ success: true });
  } else {
    res.json({ success: false, message: "Invalid credentials" });
  }
});

// ✅ Save POI
app.post('/save-poi', async (req, res) => {
  const { username, description, highlightedData = [] } = req.body;

  if (!description || !username) {
    return res.status(400).json({ message: 'Missing description or username in request body' });
  }

  try {
    const newPOI = new POI({ username, description, highlightedData });
    await newPOI.save();
    console.log('✅ Saved to MongoDB');

    res.status(200).json({ message: 'POI saved successfully!' });
  } catch (err) {
    console.error('❌ Save Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ Get POIs for a specific user
app.get('/get-pois', async (req, res) => {
  const username = req.query.username;
  if (!username) return res.status(400).json({ message: 'Username is required' });

  try {
    const pois = await POI.find({ username });
    res.status(200).json(pois);
  } catch (err) {
    console.error('❌ Error fetching POIs:', err);
    res.status(500).json({ message: 'Error retrieving POIs' });
  }
});

// ✅ Clear POIs
app.delete('/clear-pois', async (req, res) => {
  try {
    await POI.deleteMany();
    console.log('🗑️ Cleared all POIs');
    res.status(200).json({ message: 'All POIs cleared successfully!' });
  } catch (err) {
    console.error('❌ Error clearing POIs:', err);
    res.status(500).json({ message: 'Error clearing POIs' });
  }
});

// ✅ Dynamic port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});