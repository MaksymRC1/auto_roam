import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Завантажуємо змінні оточення (.env.local)
dotenv.config({ path: '.env.local' });

// Типи шаблонів
type TemplateType = 'tech' | 'business' | 'auto';

// Інтерфейс для контакту
interface PressContact {
  name: string;
  email: string;
  outlet: string;
  templateType?: TemplateType;
  note?: string;
  active: boolean;
}

// Конфігурація розсилки
const CONFIG = {
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.ukr.net',
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: process.env.SMTP_SECURE === 'true' || true,
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  },
  senderName: process.env.SMTP_SENDER_NAME || 'Максим Отрошко (AutoRoam)',
  senderEmail: process.env.SMTP_USER || 'maksymotroshko@ukr.net',
  contactsPath: path.join(process.cwd(), 'src/data/press-contacts.json'),
  attachmentPath: path.join(process.cwd(), 'public/press-release.pdf'),
  delayBetweenEmailsMs: 4000, // 4 секунди
};

// --- ШАБЛОНИ ЛИСТІВ ---

// 1. ШАБЛОН TECH / IT (Для AIN.UA, DOU, Speka, dev.ua)
const getTechTemplate = (contact: PressContact) => {
  const noteHtml = contact.note ? `<p style="font-style: italic; border-left: 3px solid #3b82f6; padding-left: 12px; color: #4a4a4a;">${contact.note}.</p>` : '';
  const noteText = contact.note ? `${contact.note}.\n\n` : '';

  const subject = `Прес-реліз: Як соло-розробник створив ШІ-асистента для автоподорожей AutoRoam на Next.js 16`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; color: #1a1a1a; line-height: 1.6;">
      <p>Вітаю, <strong>${contact.name}</strong>!</p>
      ${noteHtml}
      <p>Мене звати Максим, я український розробник, який у найкращих традиціях сучасного <strong>indie hacking</strong> самостійно спроєктував та запустив <strong>AutoRoam</strong> (autoroam.com.ua) — інтелектуального авто-асистента для планування дальніх поїздок Європою та Україною.</p>
      
      <p>Продукт вирішує біль водіїв, який ігнорують звичні навігатори: замість простого ведення по карті, застосунок збирає хаос із 10+ вкладок у єдиний інтерактивний таймлайн.</p>

      <p style="font-weight: bold; margin-top: 20px;">⚡ Чому це цікаво інженерній та стартап-спільноті:</p>
      <ul>
        <li><strong>Сучасний інді-стек:</strong> Проєкт побудовано на ультрасучасному стеку <strong>Next.js 16 (App Router), React 19, Tailwind CSS v4</strong> та <strong>Zustand</strong> з serverless-інфраструктурою (Vercel Postgres);</li>
        <li><strong>Розумна автоматизація:</strong> Власні API підтягують лайв-ціни на пальне, розраховують ночівлі кожні 8 годин за кермом та інтегрують віньєтки для перетину кордонів;</li>
        <li><strong>PWA замість сторів:</strong> Ми відмовилися від важкої нативної розробки — завдяки PWA та компресії стейту в URL (lz-string), додаток відкривається миттєво і відчувається як iOS/Android застосунок.</li>
      </ul>

      <p><strong>🔗 Матеріали для редакції:</strong></p>
      <ul>
        <li>Живий додаток: <a href="https://autoroam.com.ua">autoroam.com.ua</a></li>
        <li>Прес-кіт (скріншоти UI/UX): <a href="https://drive.google.com/drive/folders/1onuQQhDvfrJCHMBhIM3FJd2JKS70wLnI">Google Drive</a></li>
        <li>Повний текст прес-релізу: <a href="https://docs.google.com/document/d/1hDKIvcHn04wfz4OIyZzePCmX0w4dFzFDz5XKc69Kh_k/edit">Google Doc</a></li>
      </ul>

      <p>Буду щиро вдячний, якщо розповісте про наш безкоштовний продукт, протестуєте в реальних умовах або поділитеся будь-яким фідбеком!</p>
      
      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 24px 0;" />
      <p style="font-size: 14px; color: #666;">З повагою,<br/><strong>Максим Отрошко</strong><br/>Засновник та розробник AutoRoam | <a href="https://www.linkedin.com/in/maxotroshko">LinkedIn</a></p>
    </div>
  `;

  const text = `Вітаю, ${contact.name}!

${noteText}Мене звати Максим, я український розробник, який у найкращих традиціях сучасного indie hacking самостійно спроєктував та запустив AutoRoam (autoroam.com.ua) — інтелектуального авто-асистента для планування дальніх поїздок Європою та Україною.

Продукт вирішує біль водіїв, який ігнорують звичні навігатори: замість простого ведення по карті, застосунок збирає хаос із 10+ вкладок у єдиний інтерактивний таймлайн.

⚡ Чому це цікаво інженерній та стартап-спільноті:
- Сучасний інді-стек: Проєкт побудовано на ультрасучасному стеку Next.js 16 (App Router), React 19, Tailwind CSS v4 та Zustand з serverless-інфраструктурою;
- Розумна автоматизація: Власні API підтягують лайв-ціни на пальне, розраховують ночівлі кожні 8 годин за кермом та інтегрують віньєтки для перетину кордонів;
- PWA замість сторів: Ми відмовилися від важкої нативної розробки — завдяки PWA та компресії стейту в URL, додаток відкривається миттєво і відчувається як iOS/Android застосунок.

🔗 Матеріали для редакції:
- Живий додаток: https://autoroam.com.ua
- Прес-кіт (скріншоти UI/UX): https://drive.google.com/drive/folders/1onuQQhDvfrJCHMBhIM3FJd2JKS70wLnI
- Повний текст прес-релізу: https://docs.google.com/document/d/1hDKIvcHn04wfz4OIyZzePCmX0w4dFzFDz5XKc69Kh_k/edit

Буду щиро вдячний, якщо розповісте про наш безкоштовний продукт, протестуєте в реальних умовах або поділитеся будь-яким фідбеком!

---
З повагою, Максим Отрошко
Засновник та розробник AutoRoam | https://www.linkedin.com/in/maxotroshko`;

  return { subject, html, text };
};

// 2. ШАБЛОН BUSINESS (Для MC.today, Forbes Україна, Vector)
const getBusinessTemplate = (contact: PressContact) => {
  const noteHtml = contact.note ? `<p style="font-style: italic; border-left: 3px solid #10b981; padding-left: 12px; color: #4a4a4a;">${contact.note}.</p>` : '';
  const noteText = contact.note ? `${contact.note}.\n\n` : '';

  const subject = `Прес-реліз: Український стартап AutoRoam перетворює хаос планування автоподорожей на зручний таймлайн`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; color: #1a1a1a; line-height: 1.6;">
      <p>Вітаю, <strong>${contact.name}</strong>!</p>
      ${noteHtml}
      <p>Мене звати Максим, я український підприємець та розробник. Ми запустили <strong>AutoRoam</strong> (autoroam.com.ua) — розумний вебзастосунок для водіїв, який бере на себе всю рутину планування дальніх поїздок Європою та Україною.</p>
      
      <p>Зазвичай перед поїздкою (наприклад, Київ – Мюнхен) водій відкриває десяток вкладок: Google Maps для маршруту, Booking для ночівлі, калькулятори витрат пального та форуми про віньєтки. <strong>AutoRoam об'єднує це в один контекст.</strong></p>

      <p style="font-weight: bold; margin-top: 20px;">💼 Яку цінність ми даємо мандрівникам та ринку:</p>
      <ul>
        <li><strong>Точний бюджет до копійки:</strong> Розрахунок витрат на пальне під ваше авто з урахуванням запасу та мультивалютності (UAH, EUR, PLN, USD);</li>
        <li><strong>Ночівлі без втоми:</strong> Алгоритм сам пропонує міста для зупинки після 8 годин за кермом та підтягує актуальні готелі;</li>
        <li><strong>Кордони без штрафів:</strong> Автоматичне нагадування про віньєтки та платні дороги при перетині кордонів із прямими офіційними посиланнями;</li>
        <li><strong>Працює без App Store:</strong> Це сучасний PWA-застосунок, який відкривається в один клік на будь-якому пристрої.</li>
      </ul>

      <p><strong>🔗 Матеріали для матеріалу:</strong></p>
      <ul>
        <li>Продукт: <a href="https://autoroam.com.ua">autoroam.com.ua</a></li>
        <li>Прес-кіт (фото та логотипи): <a href="https://drive.google.com/drive/folders/1onuQQhDvfrJCHMBhIM3FJd2JKS70wLnI">Google Drive</a></li>
        <li>Детальний текст прес-релізу: <a href="https://docs.google.com/document/d/1hDKIvcHn04wfz4OIyZzePCmX0w4dFzFDz5XKc69Kh_k/edit">Google Doc</a></li>
      </ul>

      <p>Буду щиро вдячний, якщо розповісте про наш безкоштовний продукт, протестуєте в реальних умовах або поділитеся будь-яким фідбеком!</p>
      
      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 24px 0;" />
      <p style="font-size: 14px; color: #666;">З повагою,<br/><strong>Максим Отрошко</strong><br/>Засновник AutoRoam | <a href="https://www.linkedin.com/in/maxotroshko">LinkedIn</a></p>
    </div>
  `;

  const text = `Вітаю, ${contact.name}!

${noteText}Мене звати Максим, я український підприємець та розробник. Ми запустили AutoRoam (autoroam.com.ua) — розумний вебзастосунок для водіїв, який бере на себе всю рутину планування дальніх поїздок Європою та Україною.

Зазвичай перед поїздкою (наприклад, Київ – Мюнхен) водій відкриває десяток вкладок: Google Maps для маршруту, Booking для ночівлі, калькулятори витрат пального та форуми про віньєтки. AutoRoam об'єднує це в один контекст.

💼 Яку цінність ми даємо мандрівникам та ринку:
- Точний бюджет до копійки: Розрахунок витрат на пальне під ваше авто з урахуванням запасу та мультивалютності (UAH, EUR, PLN, USD);
- Ночівлі без втоми: Алгоритм сам пропонує міста для зупинки після 8 годин за кермом та підтягує актуальні готелі;
- Кордони без штрафів: Автоматичне нагадування про віньєтки та платні дороги при перетині кордонів із прямими офіційними посиланнями;
- Працює без App Store: Це сучасний PWA-застосунок, який відкривається в один клік на будь-якому пристрої.

🔗 Матеріали для матеріалу:
- Продукт: https://autoroam.com.ua
- Прес-кіт (фото та логотипи): https://drive.google.com/drive/folders/1onuQQhDvfrJCHMBhIM3FJd2JKS70wLnI
- Детальний текст прес-релізу: https://docs.google.com/document/d/1hDKIvcHn04wfz4OIyZzePCmX0w4dFzFDz5XKc69Kh_k/edit

Буду щиро вдячний, якщо розповісте про наш безкоштовний продукт, протестуєте в реальних умовах або поділитеся будь-яким фідбеком!

---
З повагою, Максим Отрошко
Засновник AutoRoam | https://www.linkedin.com/in/maxotroshko`;

  return { subject, html, text };
};

// 3. ШАБЛОН AUTO / TRAVEL (Для автожурналів, блогерів, туристичних видань)
const getAutoTemplate = (contact: PressContact) => {
  const noteHtml = contact.note ? `<p style="font-style: italic; border-left: 3px solid #f59e0b; padding-left: 12px; color: #4a4a4a;">${contact.note}.</p>` : '';
  const noteText = contact.note ? `${contact.note}.\n\n` : '';

  const subject = `Новий український додаток для водіїв: AutoRoam сам порахує пальне, ночівлі та віньєтки для далекої поїздки`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; color: #1a1a1a; line-height: 1.6;">
      <p>Вітаю, <strong>${contact.name}</strong>!</p>
      ${noteHtml}
      <p>Кожен, хто хоч раз планував далеку поїздку на авто (наприклад, у Карпати чи через пів Європи), знає цей біль: навігатора мало, треба вручну рахувати кілометри, ціну бензину в різних країнах, шукати де поспати і розбиратися з оплатою доріг.</p>
      
      <p>Ми створили <strong>AutoRoam</strong> (autoroam.com.ua) — безкоштовний український авто-асистент у телефоні, який робить це автоматично за кілька секунд.</p>

      <p style="font-weight: bold; margin-top: 20px;">🚗 Чим AutoRoam здивує водіїв та мандрівників:</p>
      <ul>
        <li><strong>Калькулятор пального:</strong> Вводите розхід своєї машини — отримуєте точну суму в гривнях, євро чи злотих з урахуванням реальних актуальних цін;</li>
        <li><strong>«Розумні» зупинки:</strong> Показує, де саме водієві варто зупинитися на ніч після довгої дороги, щоб не перевтомлюватися за кермом;</li>
        <li><strong>Віньєтки в 1 клік:</strong> Точно знає, де починаються платні дороги та дає офіційні посилання на оплату без посередників і штрафів;</li>
        <li><strong>Не забиває пам'ять телефону:</strong> Працює прямо в браузері як на смартфоні, так і на ноутбуці чи планшеті.</li>
      </ul>

      <p><strong>🔗 Матеріали для ознайомлення:</strong></p>
      <ul>
        <li>Спробувати сервіс: <a href="https://autoroam.com.ua">autoroam.com.ua</a></li>
        <li>Прес-кіт (ілюстрації та інтерфейс): <a href="https://drive.google.com/drive/folders/1onuQQhDvfrJCHMBhIM3FJd2JKS70wLnI">Google Drive</a></li>
        <li>Текст прес-релізу: <a href="https://docs.google.com/document/d/1hDKIvcHn04wfz4OIyZzePCmX0w4dFzFDz5XKc69Kh_k/edit">Google Doc</a></li>
      </ul>

      <p>Буду щиро вдячний, якщо розповісте про наш безкоштовний продукт, протестуєте в реальних умовах або поділитеся будь-яким фідбеком!</p>
      
      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 24px 0;" />
      <p style="font-size: 14px; color: #666;">З повагою,<br/><strong>Максим Отрошко</strong><br/>Засновник AutoRoam | <a href="https://www.linkedin.com/in/maxotroshko">LinkedIn</a></p>
    </div>
  `;

  const text = `Вітаю, ${contact.name}!

${noteText}Кожен, хто хоч раз планував далеку поїздку на авто (наприклад, у Карпати чи через пів Європи), знає цей біль: навігатора мало, треба вручну рахувати кілометри, ціну бензину в різних країнах, шукати де поспати і розбиратися з оплатою доріг.

Ми створили AutoRoam (autoroam.com.ua) — безкоштовний український авто-асистент у телефоні, який робить це автоматично за кілька секунд.

🚗 Чим AutoRoam здивує водіїв та мандрівників:
- Калькулятор пального: Вводите розхід своєї машини — отримуєте точну суму в гривнях, євро чи злотих з урахуванням реальних актуальних цін;
- «Розумні» зупинки: Показує, де саме водієві варто зупинитися на ніч після довгої дороги, щоб не перевтомлюватися за кермом;
- Віньєтки в 1 клік: Точно знає, де починаються платні дороги та дає офіційні посилання на оплату без посередників і штрафів;
- Не забиває пам'ять телефону: Працює прямо в браузері як на смартфоні, так і на ноутбуці чи планшеті.

🔗 Матеріали для ознайомлення:
- Спробувати сервіс: https://autoroam.com.ua
- Прес-кіт (ілюстрації та інтерфейс): https://drive.google.com/drive/folders/1onuQQhDvfrJCHMBhIM3FJd2JKS70wLnI
- Текст прес-релізу: https://docs.google.com/document/d/1hDKIvcHn04wfz4OIyZzePCmX0w4dFzFDz5XKc69Kh_k/edit

Буду щиро вдячний, якщо розповісте про наш безкоштовний продукт, протестуєте в реальних умовах або поділитеся будь-яким фідбеком!

---
З повагою, Максим Отрошко
Засновник AutoRoam | https://www.linkedin.com/in/maxotroshko`;

  return { subject, html, text };
};

// Головний маршрутизатор шаблонів
const getEmailContent = (contact: PressContact) => {
  const type = contact.templateType || 'tech'; // за замовчуванням tech
  switch (type) {
    case 'business':
      return getBusinessTemplate(contact);
    case 'auto':
      return getAutoTemplate(contact);
    case 'tech':
    default:
      return getTechTemplate(contact);
  }
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const isDryRun = process.argv.includes('--dry-run');

  console.log(`\n📢 --- Скрипт розсилки прес-релізу AutoRoam (Мульти-шаблони: Tech / Business / Auto) ---`);
  if (isDryRun) {
    console.log(`⚠️  РЕЖИМ ТЕСТУВАННЯ (--dry-run): Листи НЕ будуть відправлені фізично.\n`);
  }

  if (!fs.existsSync(CONFIG.contactsPath)) {
    console.error(`❌ Помилка: Файл контактів не знайдено за шляхом ${CONFIG.contactsPath}`);
    process.exit(1);
  }

  const rawContacts = fs.readFileSync(CONFIG.contactsPath, 'utf-8');
  const contacts: PressContact[] = JSON.parse(rawContacts);
  const activeContacts = contacts.filter((c) => c.active);

  console.log(`👥 Знайдено контактів: ${contacts.length} (Активних для розсилки: ${activeContacts.length})\n`);

  if (activeContacts.length === 0) {
    console.log('ℹ️ Немає активних контактів для відправки. Завершення роботи.');
    return;
  }

  let transporter: any = null;
  if (!isDryRun) {
    try {
      const nodemailer = await import('nodemailer');
      if (!CONFIG.smtp.auth.user || !CONFIG.smtp.auth.pass) {
        console.error(`❌ Помилка: Вкажіть SMTP_USER та SMTP_PASS у файлі .env.local для реальної відправки!`);
        process.exit(1);
      }
      transporter = nodemailer.createTransport(CONFIG.smtp);
      await transporter.verify();
      console.log('✅ SMTP з\'єднання успішно встановлено!\n');
    } catch (err: any) {
      console.error('❌ Помилка підключення до SMTP-сервера:', err.message || err);
      process.exit(1);
    }
  }

  let successCount = 0;
  let failCount = 0;
  const report: any[] = [];

  for (let i = 0; i < activeContacts.length; i++) {
    const contact = activeContacts[i];
    const templateType = contact.templateType || 'tech';
    const { subject, html, text } = getEmailContent(contact);

    console.log(`[${i + 1}/${activeContacts.length}] Підготовка листа для: ${contact.name} (${contact.outlet}) -> <${contact.email}>`);
    console.log(`   🎨 Шаблон: [${templateType.toUpperCase()}]`);

    if (isDryRun) {
      console.log(`   🔹 Тема: ${subject}`);
      console.log(`   🔹 Персональна замітка: ${contact.note || 'Не вказано'}`);
      console.log(`   🔸 Статус: [DRY-RUN] Успішно згенеровано\n`);
      successCount++;
      report.push({ email: contact.email, outlet: contact.outlet, template: templateType, status: 'DRY_RUN_SUCCESS' });
    } else {
      try {
        const mailOptions: any = {
          from: `"${CONFIG.senderName}" <${CONFIG.senderEmail}>`,
          to: contact.email,
          subject: subject,
          text: text,
          html: html,
        };

        if (fs.existsSync(CONFIG.attachmentPath)) {
          mailOptions.attachments = [
            {
              filename: 'AutoRoam_Press_Release.pdf',
              path: CONFIG.attachmentPath,
            },
          ];
        }

        await transporter.sendMail(mailOptions);
        console.log(`   ✅ Успішно відправлено на <${contact.email}>!\n`);
        successCount++;
        report.push({ email: contact.email, outlet: contact.outlet, template: templateType, status: 'SUCCESS', timestamp: new Date().toISOString() });
      } catch (err: any) {
        console.error(`   ❌ Помилка відправки на <${contact.email}>:`, err.message || err);
        failCount++;
        report.push({ email: contact.email, outlet: contact.outlet, template: templateType, status: 'FAILED', error: err.message || String(err), timestamp: new Date().toISOString() });
      }

      if (i < activeContacts.length - 1) {
        console.log(`⏳ Очікування ${CONFIG.delayBetweenEmailsMs / 1000} сек. перед наступним листом...`);
        await sleep(CONFIG.delayBetweenEmailsMs);
      }
    }
  }

  const reportPath = path.join(process.cwd(), 'press-release-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({ summary: { total: activeContacts.length, success: successCount, failed: failCount, isDryRun }, details: report }, null, 2));

  console.log(`\n🎉 --- Підсумки розсилки ---`);
  console.log(`✅ Успішно: ${successCount}`);
  console.log(`❌ Помилок: ${failCount}`);
  console.log(`📄 Детальний звіт збережено у: ${reportPath}\n`);
}

main().catch((err) => {
  console.error('❌ Неочікувана помилка у скрипті:', err);
  process.exit(1);
});
