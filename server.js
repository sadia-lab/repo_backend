const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');

const app = express();

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/poi-db')
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.log('Error connecting to MongoDB:', err));

const poiSchema = new mongoose.Schema({
    description: { type: String, required: true },
    highlightedData: [{
        entity: String,
        url: String
    }]
});

const POI = mongoose.model('POI', poiSchema);

const USER = { username: "admin", password: "1234" };

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === USER.username && password === USER.password) {
        res.json({ success: true });
    } else {
        res.json({ success: false, message: "Invalid credentials" });
    }
});

app.post('/save-poi', async (req, res) => {
    const { description, highlightedData } = req.body;

    try {
        const newPOI = new POI({ description, highlightedData });
        await newPOI.save();

        const filePath = './highlightedEntities.json';
        let existingData = [];

        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            existingData = JSON.parse(fileContent);
        }

        existingData.push({
            description: description,
            highlightedData: highlightedData
        });

        fs.writeFile(filePath, JSON.stringify(existingData, null, 4), (err) => {
            if (err) {
                console.error('Error writing to JSON file:', err);
                return res.status(500).send('Error writing to JSON file');
            }
            console.log('POI saved successfully to JSON');
            return res.status(200).json({ message: 'POI saved successfully!' });
        });

    } catch (error) {
        console.error('Error during saving to MongoDB:', error);
        res.status(500).send('Error saving POI');
    }
});

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


app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});