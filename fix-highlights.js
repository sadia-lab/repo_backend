const { JSDOM } = require('jsdom');
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const POI = require('./models/poi'); // Adjust if your model is named differently

function fixHTML(html) {
  const dom = new JSDOM(`<body>${html}</body>`);
  const document = dom.window.document;

  const spans = document.querySelectorAll('span.highlighted');

  spans.forEach(span => {
    const aTags = span.querySelectorAll('a');
    if (aTags.length > 5) {
      const href = aTags[0]?.href;
      const allSame = [...aTags].every(a => a.href === href && a.textContent.length === 1);
      if (allSame) {
        const fullText = [...aTags].map(a => a.textContent).join('');
        span.innerHTML = `<a href="${href}" target="_blank">${fullText}</a>`;
      }
    }
  });

  return document.body.innerHTML;
}

async function runFix() {
  const pois = await POI.find({});
  for (const poi of pois) {
    if (poi.description_html) {
      const fixedHTML = fixHTML(poi.description_html);
      if (fixedHTML !== poi.description_html) {
        poi.description_html = fixedHTML;
        await poi.save();
        console.log(`✅ Fixed: ${poi.title}`);
      }
    }
  }
  mongoose.disconnect();
}

runFix();
