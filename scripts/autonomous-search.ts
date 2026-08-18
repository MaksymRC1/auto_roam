import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import fs from 'fs';
import path from 'path';

// Завантаження секретів
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("❌ Не знайдено GEMINI_API_KEY у .env");
  process.exit(1);
}

const DB_PATH = path.join(process.cwd(), 'src/data/pr-contacts-database.json');

interface Contact {
  name: string;
  email: string;
  outlet: string;
  templateType: string;
}

// 1. Пошук через DuckDuckGo (Без API ключів)
async function searchWeb(query: string) {
  try {
    console.log(`🔍 Шукаю в інтернеті: "${query}"`);
    const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const html = await res.text();
    
    // Дуже простий парсинг результатів (витягуємо текст сніпетів та лінки)
    const snippets = [...html.matchAll(/<a class="result__snippet[^>]*>(.*?)<\/a>/gi)].map(m => m[1].replace(/<\/?[^>]+(>|$)/g, ""));
    return snippets.join('\n');
  } catch (err: any) {
    console.error('Помилка пошуку:', err.message);
    return '';
  }
}

// 2. Аналіз через Gemini (ШІ сам витягує пошти з тексту)
async function extractContactsWithGemini(searchData: string): Promise<Contact[]> {
  console.log('🤖 ШІ (Gemini) аналізує результати пошуку...');
  const prompt = `
You are a PR assistant. I am giving you text snippets from a web search about media outlets (tech, travel, auto).
Extract real media outlet names and guess or extract their contact emails (e.g. news@domain, tips@domain, editorial@domain).
Return ONLY a valid JSON array of objects. No markdown formatting.
Format: [{"name": "Outlet Name", "email": "news@outlet.com", "outlet": "Outlet Name", "templateType": "english"}]
If the outlet looks Ukrainian, set templateType to "ukrainian", otherwise "english".
Make sure emails look valid. Do not return fake domains like example.com.
Snippets:
${searchData}
  `;

  let retries = 3;
  let delayMs = 5000;

  while (retries > 0) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      const data = await res.json();
      
      if (data.error) {
        console.error('Gemini API Error:', data.error.message);
        if (data.error.message.includes('high demand') || data.error.code === 503 || data.error.code === 429) {
          console.log(`⏳ Перевантаження API. Чекаємо ${delayMs / 1000}с... (Спроб: ${retries - 1})`);
          await new Promise(r => setTimeout(r, delayMs));
          delayMs *= 2;
          retries--;
          continue;
        }
        return [];
      }
      const text = data.candidates[0].content.parts[0].text;
      return JSON.parse(text);
    } catch (err: any) {
      console.error('Gemini Fetch Error:', err.message);
      return [];
    }
  }
  
  console.log("🛑 Не вдалося отримати відповідь від Gemini після кількох спроб.");
  return [];
}

async function main() {
  console.log('🚀 Запуск Autonomous AI PR Search Agent...');

  // Крок 1: Генеруємо запит для пошуку
  const queries = [
    "top european tech blogs submit news email",
    "українські автомобільні новини контакти редакція email",
    "travel tech startups news sites contact us email",
    "tech startup media outlets contact email",
    "українські стартапи новини медіа контакти"
  ];
  const randomQuery = queries[Math.floor(Math.random() * queries.length)];
  
  const searchResults = await searchWeb(randomQuery);
  const foundContacts = await extractContactsWithGemini(searchResults);
  
  console.log(`🤖 ШІ знайшов ${foundContacts.length} потенційних контактів.`);

  // Крок 2: Відсіюємо невалідні
  const validContacts = foundContacts.filter((c: Contact) => {
    return c.email && c.email.includes('@') && !c.email.includes('example.com');
  });

  if (validContacts.length === 0) {
    console.log('🛑 Нових валідних контактів не знайдено. Завершую роботу.');
    return;
  }

  // Крок 3: Читаємо поточну базу та додаємо нові контакти
  let database: Contact[] = [];
  if (fs.existsSync(DB_PATH)) {
    database = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  }
  
  const existingEmails = new Set(database.map(c => c.email.toLowerCase()));
  
  const reallyNewContacts = validContacts.filter(c => !existingEmails.has(c.email.toLowerCase()));
  
  if (reallyNewContacts.length === 0) {
    console.log('🛑 Всі знайдені контакти вже існують у базі. Завершую роботу.');
    return;
  }

  console.log(`💾 Додаю ${reallyNewContacts.length} нових унікальних контактів до бази...`);
  
  const updatedDatabase = [...database, ...reallyNewContacts];
  fs.writeFileSync(DB_PATH, JSON.stringify(updatedDatabase, null, 2));
  
  console.log(`🎉 База успішно оновлена. Тепер вона налічує ${updatedDatabase.length} контактів!`);
}

main().catch(console.error);
