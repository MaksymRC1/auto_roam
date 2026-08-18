import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// 1. Контакти (100 штук)
const allContacts = [
  // 🇺🇦 50 Українських Медіа (Tech, Auto, Travel, Business)
  { "name": "AIN.UA", "email": "info@ain.ua", "outlet": "AIN.UA", "templateType": "ukrainian" },
  { "name": "AIN.UA News", "email": "news@ain.ua", "outlet": "AIN.UA", "templateType": "ukrainian" },
  { "name": "ITC.ua", "email": "info@itc.ua", "outlet": "ITC.ua", "templateType": "ukrainian" },
  { "name": "ITC.ua News", "email": "news@itc.ua", "outlet": "ITC.ua", "templateType": "ukrainian" },
  { "name": "SPEKA", "email": "editor@speka.media", "outlet": "SPEKA", "templateType": "ukrainian" },
  { "name": "Mezha.Media", "email": "news@mezha.media", "outlet": "Mezha.Media", "templateType": "ukrainian" },
  { "name": "DOU.ua", "email": "redaktsiya@dou.ua", "outlet": "DOU.ua", "templateType": "ukrainian" },
  { "name": "Vector", "email": "hello@vctr.media", "outlet": "Vector", "templateType": "ukrainian" },
  { "name": "dev.ua", "email": "news@dev.ua", "outlet": "dev.ua", "templateType": "ukrainian" },
  { "name": "Liga.Tech", "email": "tech@liga.net", "outlet": "Liga.Tech", "templateType": "ukrainian" },
  { "name": "MC.today", "email": "news@mc.today", "outlet": "MC.today", "templateType": "ukrainian" },
  { "name": "Root Nation", "email": "info@root-nation.com", "outlet": "Root Nation", "templateType": "ukrainian" },
  { "name": "Gagadget", "email": "news@gagadget.com", "outlet": "Gagadget", "templateType": "ukrainian" },
  { "name": "Pingvin Pro", "email": "info@pingvin.pro", "outlet": "Pingvin Pro", "templateType": "ukrainian" },
  { "name": "Tokar.ua", "email": "hello@tokar.ua", "outlet": "Tokar.ua", "templateType": "ukrainian" },
  { "name": "Na chasi", "email": "editor@nachasi.com", "outlet": "Na chasi", "templateType": "ukrainian" },
  { "name": "TechUkraine", "email": "info@techukraine.org", "outlet": "TechUkraine", "templateType": "ukrainian" },
  { "name": "PlayUA", "email": "info@playua.net", "outlet": "PlayUA", "templateType": "ukrainian" },
  { "name": "HiTech.Expert", "email": "info@expert.com.ua", "outlet": "HiTech.Expert", "templateType": "ukrainian" },
  { "name": "Auto.Ria (Editorial)", "email": "news@auto.ria.com", "outlet": "Auto.Ria", "templateType": "ukrainian" },
  { "name": "Autocentre.ua", "email": "red@autocentre.ua", "outlet": "Autocentre.ua", "templateType": "ukrainian" },
  { "name": "Auto24", "email": "auto@24tv.ua", "outlet": "Auto24", "templateType": "ukrainian" },
  { "name": "Motor Media Review (MMR)", "email": "info@mmr.net.ua", "outlet": "MMR", "templateType": "ukrainian" },
  { "name": "InfoCar.ua", "email": "news@infocar.ua", "outlet": "InfoCar.ua", "templateType": "ukrainian" },
  { "name": "Твоя Машина", "email": "news@mashyna.com.ua", "outlet": "Твоя Машина", "templateType": "ukrainian" },
  { "name": "УкрАвтоПром", "email": "office@ukrautoprom.com.ua", "outlet": "УкрАвтоПром", "templateType": "ukrainian" },
  { "name": "AutoMoto.ua", "email": "info@automoto.ua", "outlet": "AutoMoto.ua", "templateType": "ukrainian" },
  { "name": "RST.ua", "email": "news@rst.ua", "outlet": "RST.ua", "templateType": "ukrainian" },
  { "name": "NextCar", "email": "info@nextcar.ua", "outlet": "NextCar", "templateType": "ukrainian" },
  { "name": "AutoConsulting", "email": "info@autoconsulting.ua", "outlet": "AutoConsulting", "templateType": "ukrainian" },
  { "name": "Lowcost UA", "email": "info@lowcost.ua", "outlet": "Lowcost UA", "templateType": "ukrainian" },
  { "name": "Veter do it", "email": "hello@veterdoit.com", "outlet": "Veter do it", "templateType": "ukrainian" },
  { "name": "Tripmydream", "email": "media@tripmydream.com", "outlet": "Tripmydream", "templateType": "ukrainian" },
  { "name": "The Village Україна", "email": "editor@the-village.com.ua", "outlet": "The Village Україна", "templateType": "ukrainian" },
  { "name": "Хмарочос", "email": "info@hmarochos.kiev.ua", "outlet": "Хмарочос", "templateType": "ukrainian" },
  { "name": "Рубрика", "email": "info@rubryka.com", "outlet": "Рубрика", "templateType": "ukrainian" },
  { "name": "ШоТам", "email": "info@shotam.info", "outlet": "ШоТам", "templateType": "ukrainian" },
  { "name": "Заборона", "email": "info@zaborona.com", "outlet": "Заборона", "templateType": "ukrainian" },
  { "name": "О, Море", "email": "hello@omore.city", "outlet": "О, Море", "templateType": "ukrainian" },
  { "name": "УкрЗалізниця (Блог)", "email": "press@uz.gov.ua", "outlet": "УкрЗалізниця", "templateType": "ukrainian" },
  { "name": "Forbes Ukraine", "email": "editor@forbes.ua", "outlet": "Forbes Ukraine", "templateType": "ukrainian" },
  { "name": "NV", "email": "news@nv.ua", "outlet": "NV", "templateType": "ukrainian" },
  { "name": "Економічна Правда (EP)", "email": "ep@pravda.ua", "outlet": "EP", "templateType": "ukrainian" },
  { "name": "Mind.ua", "email": "info@mind.ua", "outlet": "Mind.ua", "templateType": "ukrainian" },
  { "name": "Minfin", "email": "editor@minfin.com.ua", "outlet": "Minfin", "templateType": "ukrainian" },
  { "name": "Finance.ua", "email": "news@finance.ua", "outlet": "Finance.ua", "templateType": "ukrainian" },
  { "name": "Obozrevatel", "email": "info@obozrevatel.com", "outlet": "Obozrevatel", "templateType": "ukrainian" },
  { "name": "ТСН", "email": "news@tsn.ua", "outlet": "ТСН", "templateType": "ukrainian" },
  { "name": "Бабель", "email": "info@babel.ua", "outlet": "Бабель", "templateType": "ukrainian" },
  { "name": "Фокус", "email": "news@focus.ua", "outlet": "Фокус", "templateType": "ukrainian" },
  { "name": "РБК-Україна", "email": "styler@rbc.ua", "outlet": "РБК-Україна", "templateType": "ukrainian" },
  { "name": "УНІАН", "email": "news@unian.net", "outlet": "УНІАН", "templateType": "ukrainian" },

  // 🌍 50 Іноземних Медіа (Tech, Startup, Travel, Auto)
  { "name": "Sifted", "email": "hello@sifted.eu", "outlet": "Sifted", "templateType": "english" },
  { "name": "Sifted Travel Tech", "email": "miriam@sifted.eu", "outlet": "Sifted", "templateType": "english" },
  { "name": "EU-Startups", "email": "thomas@eu-startups.com", "outlet": "EU-Startups", "templateType": "english" },
  { "name": "EU-Startups Info", "email": "info@eu-startups.com", "outlet": "EU-Startups", "templateType": "english" },
  { "name": "Tech.eu", "email": "editorial@tech.eu", "outlet": "Tech.eu", "templateType": "english" },
  { "name": "Silicon Republic", "email": "editor@siliconrepublic.com", "outlet": "Silicon Republic", "templateType": "english" },
  { "name": "The Next Web (TNW)", "email": "tips@thenextweb.com", "outlet": "TNW", "templateType": "english" },
  { "name": "Wired UK", "email": "news@wired.co.uk", "outlet": "Wired UK", "templateType": "english" },
  { "name": "TechCrunch Europe", "email": "tips@techcrunch.com", "outlet": "TechCrunch Europe", "templateType": "english" },
  { "name": "Maddyness", "email": "contact@maddyness.com", "outlet": "Maddyness", "templateType": "english" },
  { "name": "Startups Magazine", "email": "anna.wood@startupsmagazine.co.uk", "outlet": "Startups Magazine", "templateType": "english" },
  { "name": "Business Insider (Europe)", "email": "uktips@businessinsider.com", "outlet": "Business Insider Europe", "templateType": "english" },
  { "name": "AIN.Capital", "email": "editor@ain.capital", "outlet": "AIN.Capital", "templateType": "english" },
  { "name": "The Recursive", "email": "newsroom@therecursive.com", "outlet": "The Recursive", "templateType": "english" },
  { "name": "Trending Topics", "email": "news@trendingtopics.eu", "outlet": "Trending Topics", "templateType": "english" },
  { "name": "Netokracija", "email": "info@netokracija.com", "outlet": "Netokracija", "templateType": "english" },
  { "name": "MamStartup", "email": "redakcja@mamstartup.pl", "outlet": "MamStartup", "templateType": "english" },
  { "name": "Spider's Web", "email": "redakcja@spidersweb.pl", "outlet": "Spider's Web", "templateType": "english" },
  { "name": "Antyweb", "email": "redakcja@antyweb.pl", "outlet": "Antyweb", "templateType": "english" },
  { "name": "Startit.rs", "email": "kontakt@startit.rs", "outlet": "Startit.rs", "templateType": "english" },
  { "name": "Inventures.eu", "email": "contact@inventures.eu", "outlet": "Inventures.eu", "templateType": "english" },
  { "name": "Prague Morning", "email": "info@praguemorning.cz", "outlet": "Prague Morning", "templateType": "english" },
  { "name": "PhocusWire", "email": "news@phocuswire.com", "outlet": "PhocusWire", "templateType": "english" },
  { "name": "Skift", "email": "tips@skift.com", "outlet": "Skift", "templateType": "english" },
  { "name": "Travel Daily Media", "email": "editorial@traveldailymedia.com", "outlet": "Travel Daily Media", "templateType": "english" },
  { "name": "Tnooz", "email": "editor@tnooz.com", "outlet": "Tnooz", "templateType": "english" },
  { "name": "Auto Express", "email": "news@autoexpress.co.uk", "outlet": "Auto Express", "templateType": "english" },
  { "name": "Car Magazine", "email": "carmagazine@bauermedia.co.uk", "outlet": "Car Magazine", "templateType": "english" },
  { "name": "Travel Weekly", "email": "news@travelweekly.co.uk", "outlet": "Travel Weekly", "templateType": "english" },
  { "name": "Travolution", "email": "news@travolution.com", "outlet": "Travolution", "templateType": "english" },
  { "name": "Breaking Travel News", "email": "editor@breakingtravelnews.com", "outlet": "Breaking Travel News", "templateType": "english" },
  { "name": "Mobilityways", "email": "info@mobilityways.com", "outlet": "Mobilityways", "templateType": "english" },
  { "name": "Gründerszene", "email": "redaktion@gruenderszene.de", "outlet": "Gründerszene", "templateType": "english" },
  { "name": "Deutsche Startups", "email": "tipps@deutsche-startups.de", "outlet": "Deutsche Startups", "templateType": "english" },
  { "name": "T3n", "email": "redaktion@t3n.de", "outlet": "T3n", "templateType": "english" },
  { "name": "Der Brutkasten", "email": "redaktion@derbrutkasten.com", "outlet": "Der Brutkasten", "templateType": "english" },
  { "name": "Startupticker.ch", "email": "news@startupticker.ch", "outlet": "Startupticker", "templateType": "english" },
  { "name": "Horizont", "email": "redaktion@horizont.net", "outlet": "Horizont", "templateType": "english" },
  { "name": "IT-Business", "email": "redaktion@it-business.de", "outlet": "IT-Business", "templateType": "english" },
  { "name": "Heise Online", "email": "redaktion@heise.de", "outlet": "Heise Online", "templateType": "english" },
  { "name": "Golem.de", "email": "info@golem.de", "outlet": "Golem.de", "templateType": "english" },
  { "name": "TrendingTopics.at", "email": "feedback@trendingtopics.at", "outlet": "TrendingTopics.at", "templateType": "english" },
  { "name": "UKTN (UK Tech News)", "email": "editorial@uktech.news", "outlet": "UKTN", "templateType": "english" },
  { "name": "TechSpark", "email": "editor@techspark.co", "outlet": "TechSpark", "templateType": "english" },
  { "name": "Sifted (Nordics)", "email": "maija@sifted.eu", "outlet": "Sifted Nordics", "templateType": "english" },
  { "name": "TechBBQ", "email": "info@techbbq.org", "outlet": "TechBBQ", "templateType": "english" },
  { "name": "ArcticStartup", "email": "editor@arcticstartup.com", "outlet": "ArcticStartup", "templateType": "english" },
  { "name": "Shifter", "email": "redaksjonen@shifter.no", "outlet": "Shifter", "templateType": "english" },
  { "name": "Breakit", "email": "tips@breakit.se", "outlet": "Breakit", "templateType": "english" },
  { "name": "Silicon Canals", "email": "editors@siliconcanals.com", "outlet": "Silicon Canals", "templateType": "english" },
  { "name": "Tech.eu (UK desk)", "email": "dan@tech.eu", "outlet": "Tech.eu UK", "templateType": "english" },
  { "name": "CityAM", "email": "news@cityam.com", "outlet": "CityAM", "templateType": "english" }
];

const HISTORY_PATH = path.join(process.cwd(), 'src', 'data', 'pr-contacted-history.json');

// SMTP Config
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const getSubject = (templateType: string) => {
  return templateType === 'ukrainian' 
    ? 'Новий інструмент AutoRoam: Українці створили сервіс для планування поїздок платними дорогами Європи'
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

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log('🚀 Запуск масової розсилки...');

  let history: any[] = [];
  if (fs.existsSync(HISTORY_PATH)) {
    history = JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf-8'));
  }
  const contactedEmails = new Set(history.map(c => c.email.toLowerCase()));

  // Відсіюємо ті, що вже були
  const newContacts = allContacts.filter(c => !contactedEmails.has(c.email.toLowerCase()));

  console.log(`Знайдено ${allContacts.length} контактів.`);
  console.log(`Після фільтрації залишилося: ${newContacts.length}`);

  if (newContacts.length === 0) {
    console.log('🛑 Всі контакти вже є в базі. Завершую.');
    return;
  }

  let successfullySent = 0;

  for (const contact of newContacts) {
    console.log(`Відправляю: ${contact.outlet} (${contact.email}) - ${contact.templateType}`);
    
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
      console.log('✅ Успіх!');
      successfullySent++;
      
      // Відразу зберігаємо в історію, щоб уникнути повторів при збоях
      history.push({ ...contact, active: true });
      fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2));

    } catch (error: any) {
      console.error(`❌ Помилка відправки ${contact.email}:`, error.message);
    }

    // Пауза 5 секунд між листами
    await sleep(5000);
  }

  console.log(`🎉 Розсилка завершена. Успішно відправлено ${successfullySent} листів.`);
}

main().catch(console.error);
