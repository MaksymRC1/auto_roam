const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let original = content;

  // Make sure we have the imports
  if (!content.includes("useTranslations")) {
    // try to add after other imports
    const lines = content.split('\n');
    let lastImportIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ')) {
        lastImportIndex = i;
      }
    }
    lines.splice(lastImportIndex + 1, 0, "import { useTranslations } from 'next-intl';");
    content = lines.join('\n');
  }

  for (const { search, replace } of replacements) {
    content = content.replace(search, replace);
  }

  // Inject the hook if it's not there and we replaced something
  if (content !== original) {
    if (!content.includes("const t = useTranslations('Modals');") && content.includes("export function ContactModal")) {
       content = content.replace("export function ContactModal({ isOpen, onClose }: ContactModalProps) {", "export function ContactModal({ isOpen, onClose }: ContactModalProps) {\n  const t = useTranslations('Modals');");
    }
    if (!content.includes("const t = useTranslations('Modals');") && content.includes("export function SupportModal")) {
       content = content.replace("export function SupportModal({ isOpen, onClose }: SupportModalProps) {", "export function SupportModal({ isOpen, onClose }: SupportModalProps) {\n  const t = useTranslations('Modals');");
    }
    if (!content.includes("const t = useTranslations('Modals');") && content.includes("export function RatingModal")) {
       content = content.replace("export function RatingModal({ isOpen, onClose }: RatingModalProps) {", "export function RatingModal({ isOpen, onClose }: RatingModalProps) {\n  const t = useTranslations('Modals');");
    }
  }

  fs.writeFileSync(fullPath, content, 'utf8');
}

// Modals
replaceInFile('src/components/contact-modal.tsx', [
  { search: /"Звʼязатися з нами"/g, replace: "{t('contactUsTitle')}" },
  { search: /"Оберіть зручний для вас спосіб звʼязку"/g, replace: "{t('chooseMethod')}" },
  { search: /"Задати питання"/g, replace: "{t('askQuestion')}" }
]);

replaceInFile('src/components/support-modal.tsx', [
  { search: /"Напишіть нам, і ми відповімо якнайшвидше"/g, replace: "{t('supportSubtitle')}" },
  { search: /placeholder="Ваше ім'я"/g, replace: "placeholder={t('yourName')}" },
  { search: /placeholder="Електронна пошта"/g, replace: "placeholder={t('email')}" },
  { search: /placeholder="Повідомлення"/g, replace: "placeholder={t('message')}" },
  { search: />Надіслати</g, replace: ">{t('send')}<" },
  { search: />Надсилання\.\.\.</g, replace: ">{t('sending')}<" },
  { search: />Дякуємо!</g, replace: ">{t('thankYou')}<" },
  { search: />Ваше повідомлення надіслано\. Ми відповімо на вашу пошту якнайшвидше\.</g, replace: ">{t('messageSent')}<" },
  { search: /"або напишіть в"/g, replace: "{t('orWriteIn')}" },
  { search: />Задати питання</g, replace: ">{t('askQuestion')}<" },
  { search: />Ваше ім'я</g, replace: ">{t('yourName')}<" },
  { search: />Електронна пошта</g, replace: ">{t('email')}<" },
  { search: />Повідомлення</g, replace: ">{t('message')}<" },
]);

replaceInFile('src/components/rating-modal.tsx', [
  { search: /"Оцініть AutoRoam"/g, replace: "{t('rateAutoRoam')}" },
  { search: /"Ваша підтримка допомагає нам ставати кращими"/g, replace: "{t('ratingSubtitle')}" },
  { search: /"Дякуємо за вашу оцінку!"/g, replace: "{t('thanksForRating')}" },
  { search: /"Підтримати проект"/g, replace: "{t('supportProject')}" },
  { search: /"Допоможіть нам розвивати AutoRoam далі"/g, replace: "{t('supportProjectSubtitle')}" },
  { search: /"Завантаження\.\.\."/g, replace: "{t('loading')}" }
]);

console.log("Done");
