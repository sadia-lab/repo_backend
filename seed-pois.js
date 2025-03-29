require('dotenv').config();
const mongoose = require('mongoose');

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

// === 3. Sample POIs ===
const samplePOIs = [
  // POIs for user1
  { username: "user1", description: `Venice and its Lagoon - Founded in the 5th century AD, Venice is an extraordinary architectural masterpiece spread over 118 small islands.` },
  { username: "user1", description: `Historic Centre of Florence - Built on the site of an Etruscan settlement and later the Roman colony of Florentia.` },
  { username: "user1", description: `Rock Drawings in Valcamonica - Home to approximately 300,000 petroglyphs from the Epipaleolithic era to the Middle Ages.` },
  { username: "user1", description: `Vineyard Landscape of Piedmont - Langhe-Roero and Monferrato offer outstanding wine-growing landscapes shaped over centuries.` },
  { username: "user1", description: `Cittadella of Alessandria - A star fort and citadel built in the 18th century, notable for its preserved fortifications.` },
  { username: "user1", description: `City of Vicenza and the Palladian Villas - Protects buildings designed by architect Andrea Palladio.` },
  { username: "user1", description: `Historic Centre of Urbino - A major Renaissance cultural center with intact medieval walls and Ducal Palace.` },
  { username: "user1", description: `Historic Centre of Rome - Includes landmarks like the Colosseum, Roman Forum, and the Pantheon.` },
  { username: "user1", description: `Historic Centre of Naples - One of the oldest cities in Europe, with a rich mixture of Greek, Roman, and medieval heritage.` },
  { username: "user1", description: `Sassi and the Park of Rupestrian Churches of Matera - Known for ancient cave dwellings and rock-hewn churches.` },

  // POIs for user2
  { username: "user2", description: `City of Verona - Features a Roman amphitheater and is the setting for Shakespeare's 'Romeo and Juliet'.` },
  { username: "user2", description: `Late Baroque Towns of Val di Noto - Rebuilt after 1693 in distinct Baroque style.` },
  { username: "user2", description: `Medici Villas and Gardens in Tuscany - Reflect Renaissance and Baroque aesthetics integrated into landscapes.` },
  { username: "user2", description: `Mount Etna - Europe’s most active volcano, important for geology and biodiversity.` },
  { username: "user2", description: `The Dolomites - Alpine mountain range known for dramatic peaks and geological features.` },
  { username: "user2", description: `Porticoes of Bologna - 38 kilometers of medieval arcades that offer shelter and continuity.` },
  { username: "user2", description: `Piazza del Duomo, Pisa - Contains the Leaning Tower and other fine Romanesque buildings.` },
  { username: "user2", description: `Historic Centre of Siena - Preserves Gothic architecture and traditions like the Palio horse race.` },
  { username: "user2", description: `Historic Centre of San Gimignano - Noted for its medieval towers and hilltop views.` },
  { username: "user2", description: `Historic Centre of Pienza - An example of Renaissance humanist urban planning.` },

  // POIs for user3
  { username: "user3", description: `Villa Adriana (Tivoli) - A retreat of Emperor Hadrian that integrates classical and Hellenistic styles.` },
  { username: "user3", description: `Villa d’Este, Tivoli - Famed for its Renaissance gardens and elaborate fountains.` },
  { username: "user3", description: `Castel del Monte - Octagonal fortress blending classical, Islamic, and Gothic influences.` },
  { username: "user3", description: `The Trulli of Alberobello - Unique limestone houses with conical roofs.` },
  { username: "user3", description: `National Park of Abruzzo, Lazio and Molise - Rich in wildlife like Marsican brown bears and Apennine wolves.` },
  { username: "user3", description: `Rocca Calascio - One of Italy's highest fortresses with panoramic mountain views.` },
  { username: "user3", description: `Santo Stefano di Sessanio - A restored medieval village in Abruzzo.` },
  { username: "user3", description: `Sulmona - Birthplace of Ovid, known for sugared almonds and historic jousting festivals.` },
  { username: "user3", description: `Scanno - A photogenic mountain town with a heart-shaped lake nearby.` },
  { username: "user3", description: `Chieti - Home to ancient Roman remains and the Archaeological Museum of Abruzzo.` },

  // POIs for user4
  { username: "user4", description: `Atri - Known for its Romanesque cathedral and hilltop views.` },
  { username: "user4", description: `Lanciano - Site of the Eucharistic Miracle with a well-preserved medieval district.` },
  { username: "user4", description: `Ortona - A coastal town with historic churches and WWII significance.` },
  { username: "user4", description: `Pescocostanzo - Preserves Renaissance and Baroque architecture and crafts like lace-making.` },
  { username: "user4", description: `L’Aquila - Abruzzo's capital city with rich medieval heritage and ongoing restoration.` },
  { username: "user4", description: `Celano - Site of the imposing Piccolomini Castle and dramatic gorges.` },
  { username: "user4", description: `Civitella del Tronto - Features one of Europe’s largest fortresses.` },
  { username: "user4", description: `Guardiagrele - A “stone city” famous for its Gothic church and metalwork artisans.` },
  { username: "user4", description: `Bominaco - Hosts the fresco-rich Oratory of San Pellegrino.` },
  { username: "user4", description: `Castelli - Celebrated for traditional maiolica pottery.` },

  // POIs for user5
  { username: "user5", description: `Penne - Historic hill town that serves as a gateway to Gran Sasso park.` },
  { username: "user5", description: `Teramo - A mix of ancient ruins and Renaissance buildings.` },
  { username: "user5", description: `Giulianova - Combines beaches and historic sanctuaries.` },
  { username: "user5", description: `Vasto - Cliffside town overlooking the Adriatic, known for beaches and medieval architecture.` },
  { username: "user5", description: `Pietracamela - Traditional mountain village within the Gran Sasso National Park.` },
  { username: "user5", description: `Navelli - Famous for its high-quality saffron and rural charm.` },
  { username: "user5", description: `Camping Wolf – Civitella Alfedena, Abruzzo National Park - Camping Wolf is a mountain campsite located in the village of Civitella Alfedena, in the heart of the Abruzzo, Lazio and Molise National Park...` },
  { username: "user5", description: `Museo Storico del Parco Nazionale d'Abruzzo, Lazio e Molise – Pescasseroli - Located in the former stables of Palazzo Sipari in Pescasseroli, this museum celebrates the 100-year history of the Park...` },
  { username: "user5", description: `Associazione Pro Loco Pescasseroli – Promoting Sustainable Tourism - Since 2012, the Pro Loco Pescasseroli non-profit association has played a key role in shaping responsible and community-driven tourism...` },
  { username: "user5", description: `Pescasseroli – Heart of the Abruzzo National Park - Located at 1,167 meters above sea level, Pescasseroli lies in a basin at the entrance of the Upper Sangro Valley...` },

  // POIs for user6
  { username: "user6", description: `Opi – Medieval Village in the Abruzzo National Park - Nestled in a stunning natural amphitheater surrounded by forested mountains...` },
  { username: "user6", description: `Civitella Alfedena – Gateway to the Camosciara Reserve - First-time visitors to Civitella Alfedena are immediately captivated by the charm of its harmonious architecture...` },
  { username: "user6", description: `InfoPoint del Parco Nazionale d'Abruzzo, Lazio e Molise – Visitor Support Hubs - The InfoPoint facilities of the National Park...` },
  { username: "user6", description: `Pro Loco Opi – APS – Cultural and Tourism Promotion Association - Founded in the spring of 1976 and a member of the National Union of Pro Loco of Italy (UNPLI)...` },
  { username: "user6", description: `InfoPoint Territoriali – Local Visitor Information Services - In addition to institutional centers managed by the National Park Authority...` },
  { username: "user6", description: `Area Faunistica del Lupo Appenninico – Wildlife Observation Trail in Civitella Alfedena - This enclosed natural area, established by the Abruzzo, Lazio and Molise National Park...` },
  { username: "user6", description: `Area Faunistica del Cervo – Deer Observation Area in Laghetto S. Antonio - Located at 1,500 meters above sea level near the Gamberale Information Center...` },
  { username: "user6", description: `Area Faunistica dell’Orso – Campoli Appennino, City of Bears and Truffles - Inaugurated on September 18, 2010, the Bear Wildlife Area is located in Campoli Appennino (FR)...` },
  { username: "user6", description: `Centro Visita dell’Orso – Villavallelonga - Located at 1,005 meters above sea level in the picturesque village of Villavallelonga...` },
  { username: "user6", description: `Sala dei Pipistrelli – Bat Observation and Education Room - Dedicated to bats, this newly outfitted exhibit room offers educational materials including books, photographs...` },

  // POIs for user7
  { username: "user7", description: `Percorso Espositivo sull’Orso – Bear History and Human Interaction Exhibit - This educational exhibit is dedicated to the natural history of the bear and its relationship with humans...` },
  { username: "user7", description: `Museo della Transumanza – Education, Tasting, and Local Products Experience - The museum features dedicated spaces for education and social interaction...` },
  { username: "user7", description: `Museo Civico Archeologico A. De Nino – Alfedena’s Samnite Heritage - Located near the necropolis of Campo Consolino, this museum houses precious archaeological finds...` },
  { username: "user7", description: `InfoPoint del Parco – Local Access to Protected Area Insights - The InfoPoint structures throughout the Abruzzo, Lazio and Molise National Park...` },
  { username: "user7", description: `InfoPoint CETS – European Charter for Sustainable Tourism - These special InfoPoints are managed by facilities that have committed to the European Charter for Sustainable Tourism (CETS)...` },
  { username: "user7", description: `InfoPoint CETS – Certified Sustainable Tourism Centers - Within the Abruzzo, Lazio and Molise National Park, select InfoPoints are managed by organizations that have embraced the CETS...` },
  { username: "user7", description: `InfoPoint Territoriali – Local Tourism Support Centers - These InfoPoints, managed by local municipalities and Pro Loco associations...` },
  { username: "user7", description: `Museo Nazionale d'Abruzzo – L'Aquila - Housed in the 16th-century Spanish Fort of L'Aquila, this national museum contains remarkable archaeological finds...` },
  { username: "user7", description: `Eremo di San Bartolomeo in Legio – Roccamorice - This hermitage is carved into a cliff in the Majella mountains and dates back to the 11th century...` },
  { username: "user7", description: `Abbazia di San Giovanni in Venere – Fossacesia - Overlooking the Adriatic coast, this 12th-century Benedictine abbey blends Romanesque and Gothic architecture...` },

  // POIs for user8
  { username: "user8", description: `Castello Piccolomini – Celano - This impressive 15th-century castle is perched on a hill and houses the Museum of Sacred Art of the Marsica...` },
  { username: "user8", description: `Museo delle Genti d'Abruzzo – Pescara - This museum tells the story of Abruzzo's people through centuries of culture, traditions, and crafts...` },
  { username: "user8", description: `Abbazia di Santo Spirito al Morrone – Sulmona - Once the residence of Pope Celestine V, this large monastic complex showcases baroque elements...` },
  { username: "user8", description: `Chieti Historic Center – Chieti - Among the oldest cities in Italy, Chieti’s center features Roman ruins, medieval churches, and elegant palaces.` },
  { username: "user8", description: `Museo Archeologico Nazionale di Campli – Campli - Known for its medieval architecture and Holy Staircase, Campli also hosts this archaeological museum...` },
  { username: "user8", description: `Civitella del Tronto Fortress – Teramo - One of the largest fortresses in Europe, this military complex was the last Bourbon stronghold to fall...` },
  { username: "user8", description: `Atri Cathedral and Diocesan Museum – Atri - The 13th-century cathedral is famous for its frescoes by Andrea de Litio...` },
  { username: "user8", description: `Castello Aragonese – Ortona - Overlooking the Adriatic Sea, this 15th-century castle was originally built for military defense...` },
  { username: "user8", description: `Museo Capitolare – Atri - This small yet rich museum is located next to the cathedral and contains liturgical treasures...` },
  { username: "user8", description: `Complesso di San Clemente a Casauria – Castiglione a Casauria - Founded in the 9th century, this abbey is a masterpiece of Romanesque art...` },

  // POIs for user9
  { username: "user9", description: `Museo del Costume e della Tradizione della Nostra Gente – Pollutri - A cultural museum preserving traditional Abruzzese clothing, tools, and rural life scenes...` },
  { username: "user9", description: `Museo della Ceramica – Castelli - Located in the heart of Italy’s ceramic tradition, this museum houses a valuable collection of maiolica pottery...` },
  { username: "user9", description: `Teatro Marrucino – Chieti - Built in 1818, this historic theater is one of the oldest in Abruzzo and hosts classical concerts...` },
  { username: "user9", description: `Eremo di San Domenico – Villalago - A tranquil hermitage near Lake San Domenico, it features a stone sanctuary built into the rock...` },
  { username: "user9", description: `Museo Naturalistico e Archeologico “Villa Badessa” – Rosciano - This museum explores both the natural environment and archaeological past of the region...` },
  { username: "user9", description: `Fontevecchia – Spoltore - A reconstructed 19th-century rural village experience where visitors can engage in traditional crafts...` },
  { username: "user9", description: `Museo dell'Olio di Loreto Aprutino – Loreto Aprutino - Set in a historic olive oil mill, this museum celebrates the region's centuries-old olive oil production...` },
  { username: "user9", description: `Museo della Civiltà Contadina – Penne - This museum preserves agricultural tools, domestic objects, and reconstructions of rural life...` },
  { username: "user9", description: `Palazzo Ducale – Tagliacozzo - A splendid example of Renaissance architecture, this palace once hosted nobles...` },
  { username: "user9", description: `Eremo di San Venanzio – Raiano - Built on a cliff over a gorge, this hermitage is accessible via a narrow footbridge...` },

  // POIs for user10
  { username: "user10", description: `Museo delle Arti e Tradizioni Popolari – L’Aquila - Located in the historic quarter of San Pietro di Coppito, this museum displays costumes...` },
  { username: "user10", description: `Museo Archeologico – Guardiagrele - A small museum highlighting local archaeological finds, including Roman inscriptions...` },
  { username: "user10", description: `Castello Cantelmo – Pettorano sul Gizio - This medieval fortress offers panoramic views of the Gizio Valley...` },
  { username: "user10", description: `Chiesa di Santa Maria del Lago – Moscufo - A Romanesque church known for its beautifully preserved frescoes...` },
  { username: "user10", description: `Museo Civico – Sulmona - Located in the Palazzo dell’Annunziata, this museum houses art collections, archaeological relics...` },
  { username: "user10", description: `Chiesa di San Pietro ad Oratorium – Capestrano - An 8th-century church famed for its Lombard-Romanesque architecture...` },
  { username: "user10", description: `Museo della Lana – Scanno - Housed in an old wool workshop, this museum highlights the textile traditions of Scanno...` },
  { username: "user10", description: `Convento di San Francesco – Castelvecchio Subequo - This convent dates back to the 13th century and holds artworks...` },
  { username: "user10", description: `Torre di Cerrano – Pineto - One of the ancient coastal watchtowers, now used as a sea and marine biology museum...` },
  { username: "user10", description: `Museo Paleontologico – Lettomanoppello - Dedicated to fossils and prehistoric life, this museum houses collections...` }
];



// === 4. Clear + Insert ===
(async () => {
  try {
    await POI.deleteMany({});
    console.log('🧹 Existing POIs cleared.');

    await POI.insertMany(samplePOIs);
    console.log('✅ Sample POIs inserted successfully');

    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error:', err);
    mongoose.disconnect();
  }
})();
