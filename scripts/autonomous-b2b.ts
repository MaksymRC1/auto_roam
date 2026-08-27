import { createTransport } from 'nodemailer';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const HISTORY_PATH = path.join(process.cwd(), 'src/data/b2b-contacted-history.json');
const DB_PATH = path.join(process.cwd(), 'src/data/b2b-contacts-database.json');
const UKR_REPORT_EMAIL = 'myr.maksym@gmail.com'; 

// 1. Налаштування SMTP (Ukr.net)
const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// 2. Шаблони
const getSubject = () => {
  return 'Безкоштовний віджет-калькулятор поїздок Європою для вашого сервісу від AutoRoam';
};

const getHtmlTemplate = (companyName: string) => {
  let template = fs.readFileSync(path.join(process.cwd(), 'src/templates/template-b2b-ukrainian.html'), 'utf-8');
  // Замінюємо {{company}} на назву компанії
  template = template.replace('{{company}}', companyName);
  return template;
};

const getTextTemplate = (companyName: string) => {
  return `Вітаємо, командо ${companyName}!
Мене звати Максим, я засновник сервісу AutoRoam.
Ми звернули увагу на ваш сервіс і вважаємо, що наша технологія може стати чудовим доповненням для ваших користувачів.
Що ми пропонуємо: Безкоштовний віджет-калькулятор вартості поїздки Європою, який ви можете легко вбудувати на ваш сайт.
Якщо вам цікава інтеграція такого віджета, я можу надіслати вам демо-версію віджета для тестування.
Більше про нас: autoroam.com
З повагою, Максим`;
};

interface Contact {
  name: string;
  email: string;
  company: string;
  templateType: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log('🚀 Запуск Autonomous AI B2B Agent (Розсилка B2B пітчів)...');

  // Крок 1: Завантажуємо історію
  let history: Contact[] = [];
  if (fs.existsSync(HISTORY_PATH)) {
    history = JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf-8'));
  }
  const contactedEmails = new Set(history.map(c => c.email.toLowerCase()));
  console.log(`📚 В історії знайдено ${contactedEmails.size} контактів.`);

  // Крок 2: Завантажуємо загальну базу контактів
  if (!fs.existsSync(DB_PATH)) {
    console.error(`❌ Базу контактів не знайдено за шляхом: ${DB_PATH}`);
    return;
  }
  
  const allContacts: Contact[] = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  console.log(`🗃 Загальна база налічує ${allContacts.length} контактів.`);

  // Крок 3: Вибираємо 50 нових контактів
  const TARGET_EMAILS_PER_RUN = 50;
  const newContacts = allContacts.filter(c => !contactedEmails.has(c.email.toLowerCase()))
                                 .slice(0, TARGET_EMAILS_PER_RUN);

  if (newContacts.length === 0) {
    console.log('🛑 Всі контакти з бази вже оброблені. Завершую роботу.');
    return;
  }

  console.log(`📧 Готую відправку для ${newContacts.length} НОВИХ компаній...`);

  const successfullySent: Contact[] = [];

  // Крок 4: Розсилка
  for (const contact of newContacts) {
    console.log(`Відправляю ${contact.company} (${contact.email})`);
    
    const htmlContent = getHtmlTemplate(contact.company);
    const textContent = getTextTemplate(contact.company);

    try {
      await transporter.sendMail({
        from: `"${process.env.SMTP_SENDER_NAME}" <${process.env.SMTP_USER}>`,
        to: contact.email,
        subject: getSubject(),
        text: textContent,
        html: htmlContent,
      });
      successfullySent.push(contact);
      console.log(`✅ Успіх!`);
    } catch (error: any) {
      console.error(`❌ Помилка відправки ${contact.email}:`, error.message);
    }

    // Пауза 10 секунд щоб не потрапити в спам Ukr.net
    await sleep(10000);
  }

  // Крок 5: Збереження історії
  const updatedHistory = [...history, ...successfullySent];
  try {
    fs.writeFileSync(HISTORY_PATH, JSON.stringify(updatedHistory, null, 2));
    console.log(`💾 Історія оновлена. Додано ${successfullySent.length} записів.`);

    // Крок 6: Відправка звіту власнику
    const reportText = `Привіт!\nВаш B2B-Агент успішно відправив чергову порцію розсилки (пропозиція віджета).\n\nЗнайдено та надіслано листів: ${successfullySent.length}\n\nКому відправили:\n` 
      + successfullySent.map(c => `- ${c.company} (${c.email})`).join('\n')
      + `\n\nБаза історії B2B збільшилась до ${updatedHistory.length} контактів.`;

    await transporter.sendMail({
      from: `"AutoRoam B2B Agent" <${process.env.SMTP_USER}>`,
      to: UKR_REPORT_EMAIL,
      subject: `🤝 Звіт про B2B розсилку: Відправлено ${successfullySent.length} листів`,
      text: reportText,
    });
    console.log('📊 Звіт відправлено власнику!');
  } catch (err) {
    console.error('❌ Помилка при збереженнии історії або звіту:', err);
  }
}

main().catch(console.error);
