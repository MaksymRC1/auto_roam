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

// ArticleRating
replaceInFile('src/components/article-rating.tsx', [
  { search: /"Скучно"/g, replace: "{t('boring')}" },
  { search: /"Нормально"/g, replace: "{t('normal')}" },
  { search: /"Вогонь!"/g, replace: "{t('fire')}" },
  { search: /"В саме серце"/g, replace: "{t('heart')}" },
  { search: /"Вже пакую валізи!"/g, replace: "{t('packing')}" }
], 'ArticleRating');

// LeftPlaceholder
replaceInFile('src/components/left-placeholder.tsx', [
  { search: /"Розумне планування"/g, replace: "t('smartPlanning')" },
  { search: /"Враховує зупинки, кордони, ночівлі та час у дорозі\."/g, replace: "t('smartPlanningDesc')" },
  { search: /"Кордони"/g, replace: "t('borders')" },
  { search: /"Вказує які документи необхідні та чи потрібна Зелена картка\."/g, replace: "t('bordersDesc')" },
  { search: /"Віньєтки"/g, replace: "t('vignettes')" },
  { search: /"Надає посилання на офіційні сайти для купівлі дорожніх зборів\."/g, replace: "t('vignettesDesc')" },
  { search: /"Паливо"/g, replace: "t('fuel')" },
  { search: /"Точно рахує витрати з урахуванням вартості пального в кожній країні\."/g, replace: "t('fuelDesc')" },
  { search: /"Готелі"/g, replace: "t('hotels')" },
  { search: /"Допомагає розрахувати бюджет на ночівлі під час подорожі\."/g, replace: "t('hotelsDesc')" },
  { search: /"Офлайн \(PWA\)"/g, replace: "t('offline')" },
  { search: /"Доступ до збережених маршрутів навіть без інтернету\."/g, replace: "t('offlineDesc')" }
], 'LeftPlaceholder');

// MapPickerContent
replaceInFile('src/components/MapPickerContent.tsx', [
  { search: /"Оберіть точку на карті"/g, replace: "{t('choosePoint')}" },
  { search: /"Клікніть на мапі, щоб додати проміжну зупинку"/g, replace: "{t('clickOnMap')}" },
  { search: /"Завантаження карти\.\.\."/g, replace: "t('loadingMap')" },
  { search: /"Скасувати"/g, replace: "{t('cancel')}" },
  { search: /"Підтвердити"/g, replace: "{t('confirm')}" },
  { search: /"Точка на карті"/g, replace: "t('mapPoint')" },
  { search: /"Обрано:"/g, replace: "{t('selected')}" }
], 'MapPicker');

console.log("Done remaining components");
