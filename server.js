const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Load .env variables

const app = express();

// ✅ CORS for frontend
app.use(cors({
  origin: 'https://repo-frontend-tau.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

app.use(bodyParser.json());

// ✅ Debug log the Mongo URI (hide password in logs for safety)
const mongoURI = process.env.MONGO_URI || "mongodb+srv://poiadmin:Poi%401234@cluster0.oyxl9.mongodb.net/poi-db?retryWrites=true&w=majority&appName=Cluster0";
console.log("📦 Attempting MongoDB connection:", mongoURI.startsWith("mongodb") ? "✅ Format looks good" : "❌ Format invalid");

// ✅ Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Define POI schema
const poiSchema = new mongoose.Schema({
  username: String,
  description: { type: String, required: true },
  highlightedData: [{
    entity: String,
    url: String
  }]
});

const POI = mongoose.model('POI', poiSchema);

// ✅ Dummy login setup
const USERS = {
  admin: "1234",
  user1: "1234",
  user2: "1234"
};

// === ROUTES ===

// ✅ Health Check
app.get('/', (req, res) => {
  res.send('🚀 Backend is live and running!');
});

// ✅ Login Route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const normalized = username?.trim().toLowerCase();
  if (USERS[normalized] && USERS[normalized] === password) {
    res.json({ success: true });
  } else {
    res.json({ success: false, message: "Invalid credentials" });
  }
});

// ✅ Save POI (with update if already exists)
app.post('/save-poi', async (req, res) => {
  let { username, description, highlightedData = [] } = req.body;
  if (!username || !description) {
    return res.status(400).json({ message: "Missing username or description" });
  }

  username = username.trim().toLowerCase();

  try {
    const existing = await POI.findOne({ username, description });

    if (existing) {
      existing.highlightedData = highlightedData;
      await existing.save();
      console.log("🔁 Updated existing POI for:", username);
    } else {
      const newPOI = new POI({ username, description, highlightedData });
      await newPOI.save();
      console.log("✅ Created new POI for:", username);
    }

    res.status(200).json({ message: "POI saved successfully!" });
  } catch (err) {
    console.error("❌ Error saving POI:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Get POIs for user
app.get('/get-pois', async (req, res) => {
  const username = req.query.username?.trim().toLowerCase();
  if (!username) return res.status(400).json({ message: "Username is required" });

  try {
    const pois = await POI.find({ username });
    res.status(200).json(pois);
  } catch (err) {
    console.error("❌ Error fetching POIs:", err);
    res.status(500).json({ message: "Error retrieving POIs" });
  }
});

// ✅ Clear all POIs
app.delete('/clear-pois', async (req, res) => {
  try {
    await POI.deleteMany();
    console.log("🗑️ All POIs deleted");
    res.status(200).json({ message: "All POIs cleared successfully!" });
  } catch (err) {
    console.error("❌ Error clearing POIs:", err);
    res.status(500).json({ message: "Error clearing POIs" });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});