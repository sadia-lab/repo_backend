require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch((err) => console.error('❌ Connection error:', err));

// Define schema
const poiSchema = new mongoose.Schema({
  username: String,
  description: String,
  highlightedData: [{
    entity: String,
    url: String
  }]
});
const POI = mongoose.model('POI', poiSchema);

// Clear POIs
(async () => {
  try {
    await POI.deleteMany({});
    console.log('🗑️ All POIs deleted successfully!');
    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error deleting POIs:', err);
    mongoose.disconnect();
  }
})();
