import { createTransport } from 'nodemailer';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// 1. Завантаження конфігурації
dotenv.config({ path: '.env.local' });

const HISTORY_PATH = path.join(process.cwd(), 'src/data/pr-contacted-history.json');
const UKR_REPORT_EMAIL = 'maksymotroshko@ukr.net';
const TARGET_EMAILS_PER_RUN = 10; // Поставимо 10 для безпеки/тесту

// 2. Ініціалізація пошти (Nodemailer)
const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Допоміжні функції для шаблонів
const getSubject = (templateType: string) => {
  return templateType === 'ukrainian' 
    ? 'Новий інструмент: AutoRoam – вирішення головного болю з європейськими платними дорогами'
    : 'New Tool: AutoRoam – Eliminating the headache of European toll roads & vignettes';
};

const getHtmlTemplate = (templateType: string) => {
  return templateType === 'ukrainian' 
    ? fs.readFileSync(path.join(process.cwd(), 'scripts', 'template.html'), 'utf-8')
    : fs.readFileSync(path.join(process.cwd(), 'scripts', 'template-en.html'), 'utf-8');
};

const getTextTemplate = (templateType: string, outletName: string) => {
  if (templateType === 'ukrainian') {
    return `Вітаю, редакція ${outletName}!
Я — Максим, соло-розробник з України. Нещодавно я запустив AutoRoam (https://autoroam.com.ua)... (повний текст у HTML)`;
  } else {
    return `Hi ${outletName} Editorial,
I’m Maksym, a solo developer from Ukraine. I recently launched AutoRoam (https://autoroam.com.ua)... (full text in HTML)`;
  }
};

// 3. Пошук через DuckDuckGo (Без API ключів)
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

interface Contact {
  name: string;
  email: string;
  outlet: string;
  templateType: string;
}

// 4. Аналіз через Gemini (ШІ сам витягує пошти з тексту)
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
      return [];
    }
    const text = data.candidates[0].content.parts[0].text;
    return JSON.parse(text);
  } catch (err: any) {
    console.error('Gemini Fetch Error:', err.message);
    return [];
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log('🚀 Запуск Autonomous AI PR Agent...');

  // Крок 1: Завантажуємо історію
  let history: Contact[] = [];
  if (fs.existsSync(HISTORY_PATH)) {
    history = JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf-8'));
  }
  const contactedEmails = new Set(history.map(c => c.email.toLowerCase()));
  console.log(`📚 В історії знайдено ${contactedEmails.size} контактів.`);

  // Крок 2: Генеруємо запит для пошуку
  const queries = [
    "top european tech blogs submit news email",
    "українські автомобільні новини контакти редакція email",
    "travel tech startups news sites contact us email"
  ];
  const randomQuery = queries[Math.floor(Math.random() * queries.length)];
  
  const searchResults = await searchWeb(randomQuery);
  const foundContacts = await extractContactsWithGemini(searchResults);
  
  console.log(`🤖 ШІ знайшов ${foundContacts.length} потенційних контактів.`);

  // Крок 3: Фільтрація (видаляємо тих, кому вже писали, або якщо email не валідний)
  const newContacts = foundContacts.filter((c: Contact) => {
    if (!c.email || !c.email.includes('@')) return false;
    return !contactedEmails.has(c.email.toLowerCase());
  }).slice(0, TARGET_EMAILS_PER_RUN); // Беремо тільки ліміт на день

  if (newContacts.length === 0) {
    console.log('🛑 Нових контактів не знайдено. Завершую роботу.');
    return;
  }

  console.log(`📧 Готую відправку для ${newContacts.length} НОВИХ медіа...`);

  const successfullySent: Contact[] = [];

  // Крок 4: Розсилка
  for (const contact of newContacts) {
    console.log(`Відправляю ${contact.outlet} (${contact.email}) - мова: ${contact.templateType}`);
    
    const htmlContent = getHtmlTemplate(contact.templateType);
    const textContent = getTextTemplate(contact.templateType, contact.outlet);

    try {
      await transporter.sendMail({
        from: `"${process.env.SMTP_SENDER_NAME}" <${process.env.SMTP_USER}>`,
        to: contact.email,
        subject: getSubject(contact.templateType),
        text: textContent,
        html: htmlContent,
      });
      successfullySent.push(contact);
      console.log(`✅ Успіх!`);
    } catch (error: any) {
      console.error(`❌ Помилка відправки ${contact.email}:`, error.message);
    }

    // Пауза 4 секунди щоб не потрапити в спам
    await sleep(4000);
  }

  // Крок 5: Збереження історії
  if (successfullySent.length > 0) {
    const updatedHistory = [...history, ...successfullySent];
    fs.writeFileSync(HISTORY_PATH, JSON.stringify(updatedHistory, null, 2));
    console.log(`💾 Історія оновлена. Додано ${successfullySent.length} записів.`);

    // Крок 6: Відправка звіту власнику
    const reportText = `Привіт!\nВаш ШІ-Агент успішно пропрацював нічну зміну.\n\nЗнайдено та надіслано листів: ${successfullySent.length}\n\nКому відправили:\n` 
      + successfullySent.map(c => `- ${c.outlet} (${c.email}) [${c.templateType}]`).join('\n')
      + `\n\nБаза історії збільшилась до ${updatedHistory.length} контактів.`;

    await transporter.sendMail({
      from: `"AutoRoam AI Agent" <${process.env.SMTP_USER}>`,
      to: UKR_REPORT_EMAIL,
      subject: `🤖 Звіт про розсилку прес-релізу: Відправлено ${successfullySent.length} листів`,
      text: reportText,
    });
    console.log('📊 Звіт відправлено власнику!');
  }
}

main().catch(console.error);
