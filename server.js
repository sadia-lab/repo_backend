const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer'); // ✅ Added for handling FormData (sendBeacon)
require('dotenv').config();

const app = express();
const upload = multer();

// ✅ CORS for frontend
app.use(cors({
  origin: 'https://repo-frontend-tau.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

app.use(bodyParser.json());

// ✅ MongoDB URI
const mongoURI = process.env.MONGO_URI || "mongodb+srv://poiadmin:Poi%401234@cluster0.oyxl9.mongodb.net/poi-db?retryWrites=true&w=majority&appName=Cluster0";
console.log("📦 Attempting MongoDB connection:", mongoURI.startsWith("mongodb") ? "✅ Format looks good" : "❌ Format invalid");

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Define POI schema
const poiSchema = new mongoose.Schema({
  username: String,
  title: String,
  poiIndex: Number,
  description: { type: String, required: true },
  highlightedData: [{
    entity: String,
    url: String
  }]
});

const POI = mongoose.model('POI', poiSchema);

// ✅ Dummy login setup
const USERS = {
  "elena": "1234",
  "sadia": "1234",
  "roberto": "1234",
  "javed1": "1234",
  "monica1": "1234",
  "maria": "1234",
  "javed": "1234",
  "elizabeth": "1234",
  "hina": "1234",
  "usama": "1234",
  "admin": "1234"
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

// ✅ Save POI (Fallback Route)
app.post('/save-poi', async (req, res) => {
  let { username, description, highlightedData = [], poiIndex } = req.body;
  if (!username || !description || typeof poiIndex !== 'number') {
    return res.status(400).json({ message: "Missing data" });
  }

  username = username.trim().toLowerCase();

  try {
    const existing = await POI.findOne({ username, poiIndex });

    if (existing) {
      existing.highlightedData = highlightedData;
      existing.description = description;
      await existing.save();
      console.log("🔁 Updated existing POI for:", username);
    } else {
      const newPOI = new POI({ username, poiIndex, description, highlightedData });
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
    const pois = await POI.find({ username }).sort({ poiIndex: 1 });
    const filledPOIs = [];

    for (let i = 0; i < 10; i++) {
      const match = pois.find(p => p.poiIndex === i);
      if (match) {
        filledPOIs.push(match);
      } else {
        filledPOIs.push({
          _id: `placeholder-${i}`,
          username,
          poiIndex: i,
          description: "",
          highlightedData: []
        });
      }
    }

    res.status(200).json(filledPOIs);
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

// ✅ Updated /update-poi Route (Supports JSON & FormData)
app.post('/update-poi', upload.none(), async (req, res) => {
  let { username, poi_index, description, highlightedData } = req.body;

  if (!username || !poi_index) {
    return res.status(400).json({ message: "Invalid data" });
  }

  username = username.trim().toLowerCase();
  poi_index = parseInt(poi_index, 10);

  if (isNaN(poi_index) || poi_index < 0) {
    return res.status(400).json({ message: "Invalid poi_index" });
  }

  // Parse highlightedData if it’s a JSON string
  try {
    if (typeof highlightedData === 'string') {
      highlightedData = JSON.parse(highlightedData);
    }
  } catch (err) {
    console.error("❌ Failed to parse highlightedData JSON:", err);
    return res.status(400).json({ message: "Invalid highlightedData format" });
  }

  try {
    let poi = await POI.findOne({ username, poiIndex: poi_index });

    if (!poi) {
      poi = new POI({ username, poiIndex: poi_index });
    }

    poi.description = description;
    poi.highlightedData = highlightedData;
    await poi.save();

    console.log(`✏️ Updated POI ${poi_index + 1} for user ${username}`);
    res.status(200).json({ message: "POI updated successfully!" });
  } catch (err) {
    console.error("❌ Error updating POI:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
