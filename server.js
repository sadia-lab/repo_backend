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

// ✅ Hardcoded login
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

// ✅ Save POI (to MongoDB + JSON)
app.post('/save-poi', async (req, res) => {
  if (!req.body || !req.body.description) {
    return res.status(400).json({ message: 'Missing description in request body' });
  }

  const { description, highlightedData = [] } = req.body;

  try {
    // Save to MongoDB
    const newPOI = new POI({ description, highlightedData });
    await newPOI.save();
    console.log('✅ POI saved to MongoDB');

    // Backup to local JSON file
    const filePath = './highlightedEntities.json';
    let existingData = [];

    try {
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        existingData = fileContent.trim() ? JSON.parse(fileContent) : [];
      }
    } catch (err) {
      console.warn('⚠️ JSON file read error:', err.message);
      existingData = [];
    }

    existingData.push({ description, highlightedData });

    fs.writeFile(filePath, JSON.stringify(existingData, null, 4), (err) => {
      if (err) {
        console.error('❌ Error writing to JSON file:', err);
        return res.status(500).json({ message: 'Error writing to JSON file' });
      }
      console.log(`✅ JSON backup updated (${existingData.length} POIs)`);
      res.status(200).json({ message: 'POI saved successfully!' });
    });

  } catch (error) {
    console.error('❌ Error saving POI:', error);
    res.status(500).send('Error saving POI');
  }
});

// ✅ Get POIs from local JSON file
app.get('/get-pois', (req, res) => {
  const filePath = './highlightedEntities.json';

  try {
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const jsonData = fileContent.trim() ? JSON.parse(fileContent) : [];
      return res.status(200).json(jsonData);
    } else {
      return res.status(200).json([]); // return empty if file doesn't exist
    }
  } catch (err) {
    console.error('❌ JSON parse error:', err.message);
    return res.status(500).json({ message: 'Error reading JSON file' });
  }
});

// ✅ Clear all POIs
app.delete('/clear-pois', async (req, res) => {
  try {
    await POI.deleteMany(); // clear MongoDB

    const filePath = './highlightedEntities.json';
    fs.writeFileSync(filePath, JSON.stringify([], null, 4)); // clear JSON

    console.log('🗑️ All POIs cleared (MongoDB + JSON)');
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
