import fs from 'fs';
import path from 'path';

interface Contact {
  name: string;
  email: string;
  outlet: string;
  templateType: "ukrainian" | "english";
}

const contacts: Contact[] = [
  // Українські
  { name: "Auto.Ria", email: "support@auto.ria.com", outlet: "Auto.Ria", templateType: "ukrainian" },
  { name: "Autocentre", email: "news@autocentre.ua", outlet: "Autocentre.ua", templateType: "ukrainian" },
  { name: "Motorcar", email: "info@motorcar.com.ua", outlet: "Motorcar", templateType: "ukrainian" },
  { name: "24tv Auto", email: "auto@24tv.ua", outlet: "24tv", templateType: "ukrainian" },
  { name: "TSN Auto", email: "feedback@tsn.ua", outlet: "TSN.ua", templateType: "ukrainian" },
  { name: "Ukrautoprom", email: "ukrautoprom@gmail.com", outlet: "Ukrautoprom", templateType: "ukrainian" },
  { name: "Avtoblog", email: "info@avtoblog.ua", outlet: "Avtoblog", templateType: "ukrainian" },
  { name: "Gogetnews", email: "news@gogetnews.info", outlet: "Gogetnews", templateType: "ukrainian" },
  { name: "Auto Moto", email: "support@automoto.ua", outlet: "Automoto.ua", templateType: "ukrainian" },
  { name: "Auto.24tv", email: "news@24tv.ua", outlet: "Auto.24tv", templateType: "ukrainian" },
  
  // Європейські / Міжнародні Tech
  { name: "TechCrunch", email: "tips@techcrunch.com", outlet: "TechCrunch", templateType: "english" },
  { name: "The Verge", email: "tips@theverge.com", outlet: "The Verge", templateType: "english" },
  { name: "Engadget", email: "tips@engadget.com", outlet: "Engadget", templateType: "english" },
  { name: "Wired UK", email: "news@wired.co.uk", outlet: "Wired", templateType: "english" },
  { name: "TNW", email: "tips@thenextweb.com", outlet: "The Next Web", templateType: "english" },
  { name: "VentureBeat", email: "tips@venturebeat.com", outlet: "VentureBeat", templateType: "english" },
  { name: "Sifted", email: "news@sifted.eu", outlet: "Sifted.eu", templateType: "english" },
  { name: "Tech.eu", email: "tips@tech.eu", outlet: "Tech.eu", templateType: "english" },
  { name: "Gizmodo", email: "tips@gizmodo.com", outlet: "Gizmodo", templateType: "english" },
  { name: "TechRadar", email: "news@techradar.com", outlet: "TechRadar", templateType: "english" },
  
  // Європейські Auto / Travel
  { name: "Top Gear", email: "editor@topgear.com", outlet: "Top Gear", templateType: "english" },
  { name: "Auto Express", email: "news@autoexpress.co.uk", outlet: "Auto Express", templateType: "english" },
  { name: "Car Magazine", email: "carmagazine@bauermedia.co.uk", outlet: "Car Magazine", templateType: "english" },
  { name: "Autocar", email: "autocar@haymarket.com", outlet: "Autocar", templateType: "english" },
  { name: "Motor1 UK", email: "uk.editorial@motor1.com", outlet: "Motor1", templateType: "english" },
  { name: "Lonely Planet", email: "press@lonelyplanet.com", outlet: "Lonely Planet", templateType: "english" },
  { name: "CN Traveler", email: "cnt_letters@condenast.com", outlet: "Conde Nast Traveler", templateType: "english" },
  { name: "Travel + Leisure", email: "editor@travelandleisure.com", outlet: "Travel + Leisure", templateType: "english" },
  { name: "Auto Bild", email: "redaktion@autobild.de", outlet: "Auto Bild", templateType: "english" },
  { name: "Auto Motor und Sport", email: "redaktion@auto-motor-und-sport.de", outlet: "Auto Motor und Sport", templateType: "english" },
  
  // Додаткові
  { name: "Mashable", email: "tips@mashable.com", outlet: "Mashable", templateType: "english" },
  { name: "CNET", email: "cnettips@cnet.com", outlet: "CNET", templateType: "english" },
  { name: "Digital Trends", email: "news@digitaltrends.com", outlet: "Digital Trends", templateType: "english" },
  { name: "SlashGear", email: "tips@slashgear.com", outlet: "SlashGear", templateType: "english" },
  { name: "Pocket-lint", email: "news@pocket-lint.com", outlet: "Pocket-lint", templateType: "english" },
  { name: "Evo", email: "eds@evo.co.uk", outlet: "Evo", templateType: "english" },
  { name: "What Car", email: "whatcar@haymarket.com", outlet: "What Car", templateType: "english" },
  { name: "Auto Trader", email: "press@autotrader.co.uk", outlet: "Auto Trader", templateType: "english" },
  { name: "Skift", email: "tips@skift.com", outlet: "Skift", templateType: "english" },
  { name: "Phocuswire", email: "news@phocuswire.com", outlet: "Phocuswire", templateType: "english" }
];

async function generateRealContacts() {
  const DB_PATH = path.join(process.cwd(), 'src/data/pr-contacts-database.json');
  fs.writeFileSync(DB_PATH, JSON.stringify(contacts, null, 2));
  console.log(`✅ Успішно збережено ${contacts.length} РЕАЛЬНИХ контактів до ${DB_PATH}`);
}

generateRealContacts();
