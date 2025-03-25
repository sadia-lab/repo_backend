const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config(); // for local dev

const app = express();

// ✅ Allow requests from your deployed frontend
app.use(cors({
  origin: 'https://repo-frontend-tau.vercel.app',
  credentials: true
}));

app.use(bodyParser.json());

// ✅ Connect to MongoDB Atlas using .env or Render env variable
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Define Mongoose schema
const poiSchema = new mongoose.Schema({
  description: { type: String, required: true },
  highlightedData: [{
    entity: String,
    url: String
  }]
});

const POI = mongoose.model('POI', poiSchema);

// ✅ Hardcoded login (can switch to DB later)
const USER = { username: "admin", password: "1234" };

// --- ROUTES ---

// Root route
app.get('/', (req, res) => {
  res.send('🚀 Backend is live and running!');
});

// Login route
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
  if (!req.body || !req.body.description) {
    return res.status(400).json({ message: 'Missing description in request body' });
  }

  const { description, highlightedData = [] } = req.body;

  try {
    const newPOI = new POI({ description, highlightedData });
    await newPOI.save();

    // Backup to local JSON file
    const filePath = './highlightedEntities.json';
    let existingData = [];

    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      if (fileContent.trim()) {
        existingData = JSON.parse(fileContent);
      }
    }

    existingData.push({ description, highlightedData });

    fs.writeFile(filePath, JSON.stringify(existingData, null, 4), (err) => {
      if (err) {
        console.error('❌ Error writing to JSON file:', err);
        return res.status(500).send('Error writing to JSON file');
      }
      console.log('✅ POI saved to JSON');
      return res.status(200).json({ message: 'POI saved successfully!' });
    });

  } catch (error) {
    console.error('❌ Error saving POI:', error);
    res.status(500).send('Error saving POI');
  }
});

// ✅ Get saved POIs from local JSON
app.get('/get-pois', (req, res) => {
  const filePath = './highlightedEntities.json';

  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    try {
      const jsonData = JSON.parse(fileContent || '[]');
      return res.status(200).json(jsonData);
    } catch (err) {
      console.error('❌ JSON parse error', err);
      return res.status(500).send('Error reading JSON');
    }
  } else {
    return res.status(404).send('JSON file not found');
  }
});

// ✅ Delete all saved POIs
app.delete('/clear-pois', async (req, res) => {
  try {
    await POI.deleteMany({}); // Clear MongoDB

    const filePath = './highlightedEntities.json';
    if (fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 4)); // Clear JSON file
    }

    res.status(200).json({ message: 'All POIs cleared successfully!' });
  } catch (error) {
    console.error('❌ Error clearing POIs:', error);
    res.status(500).json({ message: 'Error clearing POIs' });
  }
});

// ✅ Dynamic port for Render or local
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
