const mongoose = require('mongoose');
require('dotenv').config();

// === 1. Connect to MongoDB ===
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ Connection error:', err));

// === 2. Define Schema ===
const poiSchema = new mongoose.Schema({
  username: String,
  description: String,
  highlightedData: [{
    entity: String,
    url: String
  }]
});

const POI = mongoose.model('POI', poiSchema);

// === 3. Create Sample Data ===
const samplePOIs = [
  { username: "user1", description: "The Colosseum is an ancient Roman amphitheatre located in Rome, Italy." },
  { username: "user1", description: "Florence Cathedral is a masterpiece of Renaissance architecture." },
  { username: "user1", description: "Pompeii is an archaeological site that was buried by a volcanic eruption." },
  { username: "user1", description: "The Uffizi Gallery holds a vast collection of Renaissance artworks." },
  { username: "user1", description: "Venice is renowned for its canals and historic architecture." },
  { username: "user2", description: "The Leaning Tower of Pisa is a famous freestanding bell tower." },
  { username: "user2", description: "The Vatican Museums are home to the Sistine Chapel and Raphael Rooms." },
  { username: "user2", description: "The archaeological site of Herculaneum lies near Mount Vesuvius." },
  { username: "user2", description: "The Castel del Monte is a unique medieval castle in Apulia." },
  { username: "user2", description: "Milan Cathedral is one of the largest churches in the world." }
];

// === 4. Insert into Database ===
POI.insertMany(samplePOIs)
  .then(() => {
    console.log('✅ Sample POIs inserted successfully');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ Error inserting POIs:', err);
    mongoose.disconnect();
  });
