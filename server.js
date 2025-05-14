const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ CORS for frontend
app.use(cors({
  origin: 'https://repo-frontend-tau.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

app.use(bodyParser.json());

// ✅ MongoDB Connection
const mongoURI = process.env.MONGO_URI || "mongodb+srv://poiadmin:Poi%401234@cluster0.oyxl9.mongodb.net/poi-db?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    // Create unique index to avoid duplicates
    POI.collection.createIndex({ username: 1, poiIndex: 1 }, { unique: true });
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Define POI Schema
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

// ✅ Dummy Users
const USERS = {
  "elena": "1234", "sadia": "1234", "roberto": "1234", "javed1": "1234",
  "monica1": "1234", "maria": "1234", "javed": "1234", "elizabeth": "1234",
  "hina": "1234", "usama": "1234", "admin": "1234"
};

// ===== ROUTES =====

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

// ✅ Get POIs for User (Always Return 10)
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

// ✅ Update POI — Final Corrected Version
app.post('/update-poi', async (req, res) => {
  let { username, poi_index, description, highlightedData } = req.body;

  if (!username || typeof poi_index !== "number") {
    return res.status(400).json({ message: "Invalid data" });
  }

  username = username.trim().toLowerCase();

  try {
    const updatedPOI = await POI.findOneAndUpdate(
      { username, poiIndex: poi_index },
      { 
        $set: { 
          description, 
          highlightedData 
        } 
      },
      { upsert: true, new: true }
    );

    console.log("📥 Update Received:");
    console.log("Username:", username);
    console.log("POI Index:", poi_index);
    console.log("Description:", description);
    console.log("Highlighted Data:", highlightedData);

    res.status(200).json({ message: "POI updated successfully!" });

  } catch (err) {
    console.error("❌ Error updating POI:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Clear All POIs (For Cleanup)
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

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
