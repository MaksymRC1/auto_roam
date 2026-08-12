const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements, namespace) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let original = content;

  // Make sure we have the imports
  if (!content.includes("useTranslations")) {
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
    const hook = `const t = useTranslations('${namespace}');`;
    if (!content.includes(hook)) {
        // Find the component declaration to inject the hook
        const compRegex = /export (default )?function ([A-Za-z0-9_]+)\([^)]*\) \{/;
        const match = content.match(compRegex);
        if (match) {
            content = content.replace(match[0], `${match[0]}\n  ${hook}`);
        }
    }
  }

  fs.writeFileSync(fullPath, content, 'utf8');
}

// desktop-onboarding-tour.tsx
replaceInFile('src/components/desktop-onboarding-tour.tsx', [
  { search: /"Пропустити"/g, replace: "t('skip')" },
  { search: /"Далі"/g, replace: "t('next')" },
  { search: /"Готово"/g, replace: "t('done')" },
  { search: /"Точки маршруту"/g, replace: "t('desktopStep1Title')" },
  { search: /"Введіть точки маршруту\. Можна додати проміжні зупинки та змінити їх порядок\."/g, replace: "t('desktopStep1Desc')" },
  { search: /"Налаштування маршруту"/g, replace: "t('desktopStep2Title')" },
  { search: /"Виберіть валюту та тип палива, налаштуйте параметри ночівель\."/g, replace: "t('desktopStep2Desc')" },
  { search: /"Фінансовий звіт"/g, replace: "t('desktopStep3Title')" },
  { search: /"Тут відображатиметься повна вартість подорожі з урахуванням палива, віньєток та інших витрат\."/g, replace: "t('desktopStep3Desc')" }
], 'Onboarding');

// onboarding-tour.tsx
replaceInFile('src/components/onboarding-tour.tsx', [
  { search: /"Пропустити"/g, replace: "t('skip')" },
  { search: /"Далі"/g, replace: "t('next')" },
  { search: /"Готово"/g, replace: "t('done')" },
  { search: /"Пошук та налаштування"/g, replace: "t('mobileStep1Title')" },
  { search: /"Натисніть на цю панель, щоб налаштувати точки маршруту, параметри авто та переглянути бюджет\."/g, replace: "t('mobileStep1Desc')" }
], 'Onboarding');

// tablet-onboarding-tour.tsx
replaceInFile('src/components/tablet-onboarding-tour.tsx', [
  { search: /"Пропустити"/g, replace: "t('skip')" },
  { search: /"Далі"/g, replace: "t('next')" },
  { search: /"Готово"/g, replace: "t('done')" },
  { search: /"Меню навігації"/g, replace: "t('tabletStep1Title')" },
  { search: /"Всі налаштування маршруту, витрат та кордонів знаходяться в цьому меню\."/g, replace: "t('tabletStep1Desc')" },
  { search: /"Управління маршрутом"/g, replace: "t('tabletStep2Title')" },
  { search: /"Тут ви можете побудувати маршрут, побачити хронологію та зберегти його\."/g, replace: "t('tabletStep2Desc')" }
], 'Onboarding');

// journey-onboarding-tour.tsx
replaceInFile('src/components/journey-onboarding-tour.tsx', [
  { search: /"Пропустити"/g, replace: "t('skip')" },
  { search: /"Далі"/g, replace: "t('next')" },
  { search: /"Готово"/g, replace: "t('done')" },
  { search: /"Хронологія"/g, replace: "t('journeyStep1Title')" },
  { search: /"Тут відображається детальна хронологія вашої подорожі з усіма зупинками та розрахунками\."/g, replace: "t('journeyStep1Desc')" }
], 'Onboarding');

console.log("Done onboarding tours");
