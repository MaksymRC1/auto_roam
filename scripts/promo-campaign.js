const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// ═══════════════════════════════════════════════════
// SMTP
// ═══════════════════════════════════════════════════
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ═══════════════════════════════════════════════════
// Завантажуємо всі вже використані email-адреси
// ═══════════════════════════════════════════════════
function loadUsedEmails() {
  const files = [
    'src/data/pr-contacts-database.json',
    'src/data/pr-contacted-history.json',
    'src/data/b2b-contacts-database.json',
    'src/data/b2b-contacted-history.json',
  ];
  const emails = new Set();
  for (const f of files) {
    const fp = path.join(process.cwd(), f);
    if (fs.existsSync(fp)) {
      JSON.parse(fs.readFileSync(fp, 'utf8')).forEach((c) =>
        emails.add((c.email || '').toLowerCase())
      );
    }
  }
  return emails;
}

// ═══════════════════════════════════════════════════
// НОВІ КОНТАКТИ — 5 напрямків просування
// ═══════════════════════════════════════════════════

const campaigns = [
  // ─────────────────────────────────────────────────
  // 1. Українські авто-клуби та спільноти
  // ─────────────────────────────────────────────────
  {
    category: 'Авто-клуби та спільноти',
    from: `"Максим Отрошко (AutoRoam)" <${process.env.SMTP_USER}>`,
    contacts: [
      { email: 'info@autoclub.com.ua', name: 'AutoClub Ukraine' },
      { email: 'info@uaa.org.ua', name: 'Українська автомобільна асоціація' },
      { email: 'press@autopravda.com', name: 'АвтоПравда' },
    ],
    subject: 'Безкоштовний інструмент для ваших учасників — розрахунок поїздки Європою',
    html: `
<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#333;line-height:1.6;max-width:600px;">
<p>Вітаю!</p>
<p>Мене звати Максим, я засновник <a href="https://autoroam.com.ua" style="color:#2563eb;">AutoRoam</a> — безкоштовного онлайн-калькулятора вартості автоподорожей по Європі.</p>
<p>Наш сервіс миттєво розраховує:</p>
<ul>
  <li>Загальну вартість пального на маршруті</li>
  <li>Усі необхідні віньєтки та платні дороги</li>
  <li>Оптимальний маршрут з урахуванням транзитних країн</li>
</ul>
<p>Я впевнений, що AutoRoam стане корисним інструментом для членів вашого клубу/спільноти, які подорожують на авто до Європи. Ми можемо запропонувати:</p>
<ul>
  <li>Безкоштовний embed-віджет для вашого сайту</li>
  <li>Спільний контент (статті, гайди з розрахунками)</li>
  <li>Згадку вашої організації на нашій платформі</li>
</ul>
<p>Чи було б вам цікаво обговорити можливу співпрацю?</p>
<p>З повагою,<br/>Максим Отрошко<br/>Засновник AutoRoam<br/><a href="https://autoroam.com.ua" style="color:#2563eb;">autoroam.com.ua</a></p>
</body></html>`,
  },
  // ─────────────────────────────────────────────────
  // 2. Блогери та інфлюенсери (подорожі, авто)
  // ─────────────────────────────────────────────────
  {
    category: 'Тревел-блогери та інфлюенсери',
    from: `"Максим з AutoRoam" <${process.env.SMTP_USER}>`,
    contacts: [
      { email: 'hello@mandry.ua', name: 'Мандри.UA' },
      { email: 'info@doroga.ua', name: 'Дорога.UA' },
      { email: 'contact@eurotrip.com.ua', name: 'EuroTrip UA' },
      { email: 'hello@autoblog.com.ua', name: 'Autoblog UA' },
    ],
    subject: 'Колаборація: безкоштовний калькулятор маршрутів для ваших підписників',
    html: `
<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#333;line-height:1.6;max-width:600px;">
<p>Привіт!</p>
<p>Я Максим, творець <a href="https://autoroam.com.ua" style="color:#2563eb;">AutoRoam</a> — сервісу, який допомагає українцям планувати автоподорожі до Європи.</p>
<p>Бачу, що ваша аудиторія цікавиться подорожами. Пропоную вигідну колаборацію:</p>
<ul>
  <li>Ви робите огляд/згадку AutoRoam (калькулятор поїздки, маршрути, лайфхаки)</li>
  <li>Ми надаємо ексклюзивний контент: готові розрахунки найцікавіших маршрутів</li>
  <li>Вашим підписникам — безкоштовний корисний інструмент</li>
</ul>
<p>AutoRoam абсолютно безкоштовний і не потребує реєстрації. Перевірте самі: <a href="https://autoroam.com.ua" style="color:#2563eb;">autoroam.com.ua</a></p>
<p>Зацікавлені? Готовий обговорити деталі!</p>
<p>— Максим Отрошко, AutoRoam</p>
</body></html>`,
  },
  // ─────────────────────────────────────────────────
  // 3. Держструктури та громадські організації
  // ─────────────────────────────────────────────────
  {
    category: 'Держструктури та громадські організації',
    from: `"Максим Отрошко (AutoRoam)" <${process.env.SMTP_USER}>`,
    contacts: [
      { email: 'zvernennya@tourism.gov.ua', name: 'Державне агентство розвитку туризму' },
      { email: 'info@ukrainepromo.org', name: 'UkrainePromo' },
      { email: 'info@uspp.ua', name: 'Український союз промисловців і підприємців' },
    ],
    subject: 'Український стартап AutoRoam — безкоштовний сервіс планування автоподорожей',
    html: `
<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#333;line-height:1.6;max-width:600px;">
<p>Шановні колеги!</p>
<p>Мене звати Максим Отрошко. Я — український розробник і засновник сервісу <a href="https://autoroam.com.ua" style="color:#2563eb;">AutoRoam</a>.</p>
<p>AutoRoam — це безкоштовний онлайн-калькулятор для планування автоподорожей по Європі. Сервіс розраховує вартість пального, платних доріг та віньєток для будь-якого маршруту.</p>
<p><strong>Чому це важливо:</strong></p>
<ul>
  <li>Мільйони українців щорічно подорожують до Європи на авто</li>
  <li>Відсутність зрозумілої інформації про платні дороги створює зайвий бар'єр</li>
  <li>AutoRoam зменшує цей бар'єр і робить автоподорожі доступнішими</li>
</ul>
<p>Буду вдячний за можливість розповісти більше про проєкт та обговорити потенційну підтримку чи згадку на ваших інформаційних ресурсах.</p>
<p>З повагою,<br/>Максим Отрошко<br/>Засновник AutoRoam<br/><a href="https://autoroam.com.ua" style="color:#2563eb;">autoroam.com.ua</a></p>
</body></html>`,
  },
  // ─────────────────────────────────────────────────
  // 4. Стартап-акселератори та ком'юніті
  // ─────────────────────────────────────────────────
  {
    category: 'Стартап-акселератори та спільноти',
    from: `"Maksym Otroshko (AutoRoam)" <${process.env.SMTP_USER}>`,
    contacts: [
      { email: 'hello@startupukraine.com', name: 'Startup Ukraine' },
      { email: 'info@diia.city', name: 'Дія.City' },
      { email: 'info@1991.vc', name: '1991 Open Data Incubator' },
      { email: 'apply@seedstarsworld.com', name: 'Seedstars' },
      { email: 'hello@hackerspace.kiev.ua', name: 'Hackerspace Kyiv' },
    ],
    subject: 'AutoRoam — Ukrainian solo-dev travel-tech startup, free tool for European road trips',
    html: `
<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#333;line-height:1.6;max-width:600px;">
<p>Hi there!</p>
<p>I'm Maksym, a solo developer from Ukraine. I've built <a href="https://autoroam.com.ua" style="color:#2563eb;">AutoRoam</a> — a free trip calculator that estimates total driving costs across Europe (fuel, tolls, vignettes).</p>
<p><strong>Key highlights:</strong></p>
<ul>
  <li>150+ pre-calculated routes from Ukrainian cities to European destinations</li>
  <li>Real-time toll road & vignette cost data for 30+ countries</li>
  <li>100% free, no registration, mobile-friendly</li>
  <li>Built with Next.js, deployed on Vercel</li>
</ul>
<p>I'm looking for community support, mentorship, or accelerator programs that could help AutoRoam scale across Europe. Would you be open to a quick chat?</p>
<p>Best,<br/>Maksym Otroshko<br/>Founder, <a href="https://autoroam.com.ua" style="color:#2563eb;">AutoRoam</a></p>
</body></html>`,
  },
  // ─────────────────────────────────────────────────
  // 5. Сервіси навігації та карт (партнерство)
  // ─────────────────────────────────────────────────
  {
    category: 'Навігаційні сервіси та карти',
    from: `"Maksym Otroshko (AutoRoam)" <${process.env.SMTP_USER}>`,
    contacts: [
      { email: 'partnerships@tollguru.com', name: 'TollGuru' },
      { email: 'info@viamichelin.com', name: 'ViaMichelin' },
      { email: 'partners@fuelo.net', name: 'Fuelo' },
    ],
    subject: 'Partnership proposal: AutoRoam — European toll & vignette calculator for Ukrainian drivers',
    html: `
<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#333;line-height:1.6;max-width:600px;">
<p>Hello!</p>
<p>I'm Maksym, founder of <a href="https://autoroam.com.ua" style="color:#2563eb;">AutoRoam</a> — a free European road trip cost calculator built for Ukrainian drivers crossing into EU countries.</p>
<p>We cover fuel costs, toll roads, and vignette requirements for 30+ European countries. Our audience consists of Ukrainian travelers who drive to Europe — a growing and underserved market.</p>
<p><strong>Partnership ideas:</strong></p>
<ul>
  <li>Data exchange: toll/fuel price APIs</li>
  <li>Cross-promotion to reach each other's user base</li>
  <li>Widget or affiliate integration</li>
</ul>
<p>We have 150+ indexed route pages and growing organic traffic. Would love to explore how we can collaborate.</p>
<p>Best regards,<br/>Maksym Otroshko<br/>Founder, <a href="https://autoroam.com.ua" style="color:#2563eb;">AutoRoam</a></p>
</body></html>`,
  },
  // ─────────────────────────────────────────────────
  // 6. Регіональні українські ЗМІ (нові)
  // ─────────────────────────────────────────────────
  {
    category: 'Регіональні українські ЗМІ',
    from: `"Максим Отрошко (AutoRoam)" <${process.env.SMTP_USER}>`,
    contacts: [
      { email: 'news@zaxid.net', name: 'Zaxid.net' },
      { email: 'news@0542.ua', name: '0542.ua (Суми)' },
      { email: 'info@ye.ua', name: 'Є — Новини Івано-Франківська' },
      { email: 'news@suspilne.media', name: 'Суспільне Новини (регіони)' },
      { email: 'info@galinfo.com.ua', name: 'ГалІнфо' },
    ],
    subject: 'Український стартап AutoRoam: як спланувати подорож Європою на авто — безкоштовно',
    html: `
<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#333;line-height:1.6;max-width:600px;">
<p>Вітаю, шановна редакціє!</p>
<p>Мене звати Максим Отрошко, я — соло-розробник з України і засновник безкоштовного сервісу <a href="https://autoroam.com.ua" style="color:#2563eb;">AutoRoam</a>.</p>
<p><strong>Що це:</strong> Онлайн-калькулятор вартості автоподорожей по Європі. Він рахує пальне, платні дороги та віньєтки для будь-якого маршруту з будь-якого українського міста.</p>
<p><strong>Чому це цікаво вашим читачам:</strong></p>
<ul>
  <li>Тисячі мешканців вашого регіону щорічно їздять до Європи на авто (робота, відпочинок, медицина)</li>
  <li>Перед поїздкою потрібно знати, скільки коштуватимуть платні дороги в Угорщині, Словаччині, Польщі тощо</li>
  <li>AutoRoam вирішує цю проблему за 10 секунд — абсолютно безкоштовно</li>
</ul>
<p>Чи могли б ви розглянути матеріал про AutoRoam для ваших читачів? Готовий надати будь-яку додаткову інформацію, скріншоти, коментарі.</p>
<p>Дякую за увагу!</p>
<p>З повагою,<br/>Максим Отрошко<br/>Засновник AutoRoam<br/><a href="https://autoroam.com.ua" style="color:#2563eb;">autoroam.com.ua</a></p>
</body></html>`,
  },
  // ─────────────────────────────────────────────────
  // 7. Українські діаспорні ЗМІ в Європі
  // ─────────────────────────────────────────────────
  {
    category: 'Діаспорні медіа',
    from: `"Максим Отрошко (AutoRoam)" <${process.env.SMTP_USER}>`,
    contacts: [
      { email: 'info@ukrinform.de', name: 'Ukrinform (Німеччина)' },
      { email: 'redakcja@ukraincy.info', name: 'Ukraincy.info (Польща)' },
      { email: 'info@vitanews.de', name: 'Vita News (Німеччина)' },
      { email: 'info@ukrainians.ch', name: 'Ukrainians.ch (Швейцарія)' },
    ],
    subject: 'AutoRoam — безкоштовний калькулятор вартості подорожей авто з/до України',
    html: `
<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#333;line-height:1.6;max-width:600px;">
<p>Вітаю!</p>
<p>Мене звати Максим, я засновник <a href="https://autoroam.com.ua" style="color:#2563eb;">AutoRoam</a> — безкоштовного онлайн-калькулятора вартості автоподорожей по Європі.</p>
<p>AutoRoam особливо корисний для українців, які живуть у Європі та регулярно їздять на авто додому і назад. Наш сервіс рахує пальне, платні дороги та віньєтки для будь-якого маршруту.</p>
<p><strong>Чому це актуально для вашої аудиторії:</strong></p>
<ul>
  <li>Тисячі українців щомісяця їздять маршрутами типу Варшава-Київ, Берлін-Львів, Прага-Ужгород</li>
  <li>Не всі знають про обов'язкові віньєтки в транзитних країнах (штрафи до €500!)</li>
  <li>AutoRoam розрахує точну вартість за 10 секунд — безкоштовно та без реєстрації</li>
</ul>
<p>Чи було б вам цікаво розповісти про цей сервіс вашій аудиторії? Готовий надати будь-яку додаткову інформацію.</p>
<p>З повагою,<br/>Максим Отрошко<br/>Засновник AutoRoam<br/><a href="https://autoroam.com.ua" style="color:#2563eb;">autoroam.com.ua</a></p>
</body></html>`,
  },
];

// ═══════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════
async function main() {
  console.log('🚀 Запуск комплексної кампанії просування AutoRoam...\n');

  const usedEmails = loadUsedEmails();
  console.log(`📊 Знайдено ${usedEmails.size} вже використаних email-адрес.\n`);

  const allSent = [];

  for (const campaign of campaigns) {
    console.log(`\n═══ ${campaign.category} ═══`);

    const fresh = campaign.contacts.filter(
      (c) => !usedEmails.has(c.email.toLowerCase())
    );

    if (fresh.length === 0) {
      console.log('  ⏭ Всі адреси вже оброблені, пропускаємо.');
      continue;
    }

    for (const contact of fresh) {
      console.log(`  📤 ${contact.name} (${contact.email})`);
      try {
        await transporter.sendMail({
          from: campaign.from,
          to: contact.email,
          subject: campaign.subject,
          html: campaign.html,
        });
        console.log(`  ✅ Надіслано!`);
        allSent.push({
          email: contact.email,
          name: contact.name,
          category: campaign.category,
          sentAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error(`  ❌ Помилка: ${err.message}`);
      }
      await sleep(10000);
    }
  }

  // ═══════════════════════════════════════════════════
  // Зберігаємо результати
  // ═══════════════════════════════════════════════════
  const logPath = path.join(process.cwd(), 'src/data/promo-campaign-log.json');
  let existing = [];
  if (fs.existsSync(logPath)) {
    existing = JSON.parse(fs.readFileSync(logPath, 'utf8'));
  }
  fs.writeFileSync(logPath, JSON.stringify([...existing, ...allSent], null, 2), 'utf8');

  console.log(`\n═══════════════════════════════════════`);
  console.log(`📊 ПІДСУМОК: Надіслано ${allSent.length} листів по ${campaigns.length} напрямках.`);
  console.log(`═══════════════════════════════════════`);

  // Звіт власнику
  if (allSent.length > 0) {
    const reportLines = allSent.map(
      (s) => `• ${s.category}: ${s.name} (${s.email})`
    );
    await transporter.sendMail({
      from: `"AutoRoam Promo Agent" <${process.env.SMTP_USER}>`,
      to: 'myr.maksym@gmail.com',
      subject: `📣 Звіт кампанії просування: ${allSent.length} листів надіслано`,
      text: `Привіт!\n\nКампанія безкоштовного просування AutoRoam завершена.\n\nНадіслано: ${allSent.length} листів\n\nДеталі:\n${reportLines.join('\n')}\n\nРезультати збережено в src/data/promo-campaign-log.json`,
    });
    console.log('\n📊 Звіт надіслано на пошту!');
  }
}

main().catch(console.error);
