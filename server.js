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

// ✅ MongoDB URI
const mongoURI = process.env.MONGO_URI || "mongodb+srv://poiadmin:Poi%401234@cluster0.oyxl9.mongodb.net/poi-db?retryWrites=true&w=majority&appName=Cluster0";
console.log("📦 Attempting MongoDB connection:", mongoURI.startsWith("mongodb") ? "✅ Format looks good" : "❌ Format invalid");

// ✅ Connect to MongoDB
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
  "maria": "1234",
  "roberto": "1234",
  "javed": "1234",
  "monica": "1234",
  "anna": "1234",
  "christina": "1234",
  "elizabeth": "1234",
  "maria123": "1234",
  "antonio": "1234",
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

// ✅ Save POI (fallback if needed)
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

// ✅ Get POIs for user (always return 10)
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

// ✅ Update an existing POI by index
app.post('/update-poi', async (req, res) => {
  let { username, poi_index, description, highlightedData } = req.body;

  if (!username || typeof poi_index !== "number" || poi_index < 0) {
    return res.status(400).json({ message: "Invalid data" });
  }

  username = username.trim().toLowerCase();

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

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
