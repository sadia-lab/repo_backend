const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config(); // optional, for local dev

const app = express();

// ✅ Allow requests only from your Vercel frontend
app.use(cors({
    origin: 'https://repo-frontend-tau.vercel.app',
    credentials: true
}));

app.use(bodyParser.json());

// ✅ MongoDB Atlas connection using Render environment variable
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Mongoose Schema
const poiSchema = new mongoose.Schema({
    description: { type: String, required: true },
    highlightedData: [{
        entity: String,
        url: String
    }]
});

const POI = mongoose.model('POI', poiSchema);

// ✅ Hardcoded login (can upgrade to DB later)
const USER = { username: "admin", password: "1234" };

// --- ROUTES ---

// ✅ Root route (optional but helpful)
app.get('/', (req, res) => {
    res.send('🚀 Backend is live and running!');
});

// ✅ Login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === USER.username && password === USER.password) {
        res.json({ success: true });
    } else {
        res.json({ success: false, message: "Invalid credentials" });
    }
});

// ✅ Save POI to MongoDB and local JSON file
app.post('/save-poi', async (req, res) => {
    const { description, highlightedData } = req.body;

    try {
        const newPOI = new POI({ description, highlightedData });
        await newPOI.save();

        // Backup to local JSON
        const filePath = './highlightedEntities.json';
        let existingData = [];

        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            existingData = JSON.parse(fileContent);
        }

        existingData.push({ description, highlightedData });

        fs.writeFile(filePath, JSON.stringify(existingData, null, 4), (err) => {
            if (err) {
                console.error('Error writing to JSON file:', err);
                return res.status(500).send('Error writing to JSON file');
            }
            console.log('POI saved to JSON');
            return res.status(200).json({ message: 'POI saved successfully!' });
        });

    } catch (error) {
        console.error('Error saving POI:', error);
        res.status(500).send('Error saving POI');
    }
});


// ✅ Get POIs from local JSON file
app.get('/get-pois', (req, res) => {
    const filePath = './highlightedEntities.json';

    if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        try {
            const jsonData = JSON.parse(fileContent);
            return res.status(200).json(jsonData);
        } catch (err) {
            console.error('JSON parse error', err);
            return res.status(500).send('Error reading JSON');
        }
    } else {
        return res.status(404).send('JSON file not found');
    }
});
app.delete('/clear-pois', async (req, res) => {
    try {
      await POI.deleteMany({}); // clear MongoDB collection
  
      const filePath = './highlightedEntities.json';
      if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([], null, 4)); // clear JSON file
      }
  
      res.status(200).json({ message: 'All POIs cleared successfully!' });
    } catch (error) {
      console.error('Error clearing POIs:', error);
      res.status(500).json({ message: 'Error clearing POIs' });
    }
  });
  

// ✅ Use dynamic port for Render (important!)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
