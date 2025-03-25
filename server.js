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
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Define schema
const poiSchema = new mongoose.Schema({
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
  const { description, highlightedData = [] } = req.body;

  if (!description) {
    return res.status(400).json({ message: 'Missing description in request body' });
  }

  try {
    const newPOI = new POI({ description, highlightedData });
    await newPOI.save();
    console.log('✅ Saved to MongoDB');

    // Save to local JSON
    const filePath = './highlightedEntities.json';
    let existingData = [];

    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      existingData = content.trim() ? JSON.parse(content) : [];
    }

    existingData.push({ description, highlightedData });

    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 4));
    console.log('✅ Saved to JSON file');

    res.status(200).json({ message: 'POI saved successfully!' });
  } catch (err) {
    console.error('❌ Save Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ✅ Get POIs
app.get('/get-pois', (req, res) => {
  const filePath = './highlightedEntities.json';

  try {
    if (!fs.existsSync(filePath)) {
      return res.status(200).json([]);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const pois = content.trim() ? JSON.parse(content) : [];

    res.status(200).json(pois);
  } catch (err) {
    console.error('❌ Error reading POIs:', err);
    res.status(500).json({ message: 'Error reading JSON file' });
  }
});

// ✅ Clear POIs
app.delete('/clear-pois', async (req, res) => {
  try {
    await POI.deleteMany(); // MongoDB

    fs.writeFileSync('./highlightedEntities.json', JSON.stringify([], null, 4)); // JSON file

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
