import { GoogleGenAI, Type, Schema } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Завантажуємо локальні змінні оточення (.env.local)
dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("❌ Помилка: GEMINI_API_KEY не знайдено у файлі .env.local");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

const topic = process.argv[2];
if (!topic) {
  console.error("❌ Будь ласка, вкажіть тему. Наприклад: npm run generate-article \"Подорож до Карпат\"");
  process.exit(1);
}

const articlesPath = path.join(process.cwd(), 'src/data/articles.json');

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING, description: "Унікальний ідентифікатор латиницею (наприклад: 'karpaty-trip')" },
    category: { type: Type.STRING, description: "Категорія: 'Маршрути', 'Підготовка' або 'Кордон'" },
    title: { type: Type.STRING, description: "Привабливий SEO заголовок українською мовою" },
    date: { type: Type.STRING, description: "Поточна дата, наприклад: '15 Липня, 2024'" },
    heroImage: { type: Type.STRING, description: "URL зображення з Unsplash, наприклад: https://images.unsplash.com/photo-1542314831-c6a4d14d8373?auto=format&fit=crop&q=80&w=1200" },
    intro: { type: Type.STRING, description: "Короткий вступ (2-3 речення) про подорож" },
    section1Title: { type: Type.STRING, description: "Заголовок першого розділу" },
    section1Text: { type: Type.STRING, description: "Текст першого розділу (3-4 речення)" },
    tip: { type: Type.STRING, description: "Корисна порада для мандрівників" },
    routes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Назва локації або маршруту" },
          desc: { type: Type.STRING, description: "Опис локації або маршруту" }
        },
        required: ["name", "desc"]
      }
    },
    contentImage: { type: Type.STRING, description: "Ще одне URL зображення з Unsplash" }
  },
  required: ["id", "category", "title", "date", "heroImage", "intro", "section1Title", "section1Text", "tip", "routes", "contentImage"]
};

async function generateArticle() {
  console.log(`🤖 SEO Агент генерує статтю на тему: "${topic}"...`);
  
  try {
    const prompt = `
      Ти — експерт-журналіст з автомобільних подорожей та SEO-спеціаліст.
      Твоє завдання — написати цікаву статтю українською мовою для блогу 'AutoRoam' на тему: "${topic}".
      Стиль: надихаючий, практичний, сучасний.
      
      Для зображень використовуй посилання з Unsplash (https://images.unsplash.com/photo-...) з параметрами ?auto=format&fit=crop&q=80&w=1200. Використовуй фото, які відповідають темі (гори, дороги, авто).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      }
    });

    if (!response.text) {
        throw new Error("Не отримано текст від моделі");
    }

    const newArticle = JSON.parse(response.text);

    // Зчитуємо існуючі статті
    const currentData = fs.readFileSync(articlesPath, 'utf-8');
    const articles = JSON.parse(currentData);

    // Додаємо нову статтю на початок масиву
    articles.unshift(newArticle);

    // Зберігаємо оновлений файл
    fs.writeFileSync(articlesPath, JSON.stringify(articles, null, 2), 'utf-8');

    console.log(`✅ Статтю успішно згенеровано та збережено в src/data/articles.json!`);
    console.log(`📌 Заголовок: ${newArticle.title}`);
    console.log(`🔗 ID (URL): /articles/${newArticle.id}`);

  } catch (error) {
    console.error("❌ Виникла помилка під час генерації:", error);
  }
}

generateArticle();
