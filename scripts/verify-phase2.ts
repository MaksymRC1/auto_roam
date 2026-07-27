/**
 * Автоматизований скрипт верифікації для Фази 2 (AutoRoam)
 * Перевіряє:
 * 1. Розрахунок ефективної ціни палива (стандарт, преміум +15%/+12%, ручне коригування).
 * 2. Оновлення стану в сторі при зміні типу палива та встановленні кастомної ціни.
 * 3. Наявність та коректність тарифів толів (DISTANCE_TOLL_RATES) та посилань на калькулятори.
 * 4. Роботу інтерактивного додавання зупинок (Map Tap-to-Add).
 */

// Mock localStorage and window for Node environment
if (typeof globalThis.window === 'undefined') {
  const storage = new Map();
  const mockStorage = {
    getItem: (key: string) => storage.get(key) || null,
    setItem: (key: string, val: string) => { storage.set(key, val); },
    removeItem: (key: string) => { storage.delete(key); },
    clear: () => { storage.clear(); },
    length: 0,
    key: () => null,
  };
  Object.defineProperty(globalThis, 'localStorage', { value: mockStorage, writable: true });
  Object.defineProperty(globalThis, 'window', { value: globalThis, writable: true });
}

import { useTripStore, getEffectiveFuelPrice } from '../src/store/useTripStore';
import { DISTANCE_TOLL_RATES, VIGNETTE_DB } from '../src/lib/borders';

async function runVerification() {
  console.log("=========================================================");
  console.log("🛠️  ЗАПУСК АВТОМАТИЗОВАНОГО ТЕСТУВАННЯ ФАЗИ 2 (AutoRoam)");
  console.log("=========================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`✅ [ПРОЙДЕНО] ${testName}`);
    } else {
      console.error(`❌ [ПОМИЛКА]  ${testName}`);
      if (details) console.error(`   Деталі: ${details}`);
    }
  }

  // ---------------------------------------------------------------------------
  // ТЕСТ 1: Розрахунок ефективної ціни пального (getEffectiveFuelPrice)
  // ---------------------------------------------------------------------------
  console.log("--- Тест 1: Розрахунок ефективної ціни пального ---");
  const samplePrices = {
    'UA': { gasoline: 1.40, diesel: 1.35, lpg: 0.70 },
    'PL': { gasoline: 1.60, diesel: 1.55, lpg: 0.80 }
  };
  const emptyCustomPrices = {};

  // Стандартний бензин UA
  const priceStd = getEffectiveFuelPrice('UA', samplePrices as any, 'gasoline', emptyCustomPrices);
  assert(priceStd === 1.40, "Стандартна ціна на бензин (UA)", `Очікувалось 1.40, отримано ${priceStd}`);

  // Преміум бензин UA (+15% від базової ціни)
  const pricePrem = getEffectiveFuelPrice('UA', samplePrices as any, 'gasoline_premium', emptyCustomPrices);
  const expectedPrem = Number((1.40 * 1.15).toFixed(2));
  assert(pricePrem === expectedPrem, "Преміум бензин (UA, +15%)", `Очікувалось ${expectedPrem}, отримано ${pricePrem}`);

  // Преміум дизель UA (+12% від базової ціни)
  const pricePremDiesel = getEffectiveFuelPrice('UA', samplePrices as any, 'diesel_premium', emptyCustomPrices);
  const expectedPremDiesel = Number((1.35 * 1.12).toFixed(2));
  assert(pricePremDiesel === expectedPremDiesel, "Преміум дизель (UA, +12%)", `Очікувалось ${expectedPremDiesel}, отримано ${pricePremDiesel}`);

  // Ручне коригування (Override)
  const customPrices = { 'UA': { 'gasoline': 1.85, 'gasoline_premium': 1.85 } };
  const priceCustom = getEffectiveFuelPrice('UA', samplePrices as any, 'gasoline', customPrices);
  assert(priceCustom === 1.85, "Ручне коригування ціни пального має найвищий пріоритет", `Очікувалось 1.85, отримано ${priceCustom}`);
  
  const priceCustomPrem = getEffectiveFuelPrice('UA', samplePrices as any, 'gasoline_premium', customPrices);
  assert(priceCustomPrem === 1.85, "Ручне коригування перевизначає навіть преміум-ціну", `Очікувалось 1.85, отримано ${priceCustomPrem}`);
  console.log("");

  // ---------------------------------------------------------------------------
  // ТЕСТ 2: Взаємодія зі стором (useTripStore - Пальне та Кастомні ціни)
  // ---------------------------------------------------------------------------
  console.log("--- Тест 2: Взаємодія зі стором ---");
  const store = useTripStore.getState();

  // Зміна типу палива
  store.setFuelType('gasoline_premium');
  assert(useTripStore.getState().selectedFuelType === 'gasoline_premium', "Зміна типу палива в сторі на 'gasoline_premium'");

  // Встановлення ручної ціни
  store.setCustomFuelPrice('PL', 'gasoline_premium', 1.99);
  assert(useTripStore.getState().customFuelPrices['PL']?.['gasoline_premium'] === 1.99, "Збереження кастомної ціни для Польщі (1.99 €) в сторі");

  // Скидання ручної ціни (передача 0 або NaN видаляє значення)
  store.setCustomFuelPrice('PL', 'gasoline_premium', 0);
  assert(useTripStore.getState().customFuelPrices['PL']?.['gasoline_premium'] === undefined, "Очищення кастомної ціни в сторі при передачі 0");
  console.log("");

  // ---------------------------------------------------------------------------
  // ТЕСТ 3: Тарифи толів (DISTANCE_TOLL_RATES) та офіційні калькулятори
  // ---------------------------------------------------------------------------
  console.log("--- Тест 3: Тарифи толів та офіційні калькулятори ---");
  assert(!!DISTANCE_TOLL_RATES['PL'], "Наявність тарифікції для Польщі (PL)");
  assert(DISTANCE_TOLL_RATES['PL']?.ratePerKmEur === 0.05, "Коректний тариф за км для Польщі (0.05 €/км)");
  assert(DISTANCE_TOLL_RATES['PL']?.calculatorUrl === 'https://etoll.gov.pl/ua/', "Наявність офіційного посилання на калькулятор e-TOLL");

  assert(!!DISTANCE_TOLL_RATES['IT'], "Наявність тарифікції для Італії (IT)");
  assert(DISTANCE_TOLL_RATES['IT']?.ratePerKmEur === 0.08, "Коректний тариф за км для Італії (0.08 €/км)");
  assert(!!DISTANCE_TOLL_RATES['HR'], "Наявність тарифікції для Хорватії (HR)");
  assert(!!DISTANCE_TOLL_RATES['RS'], "Наявність тарифікції для Сербії (RS)");
  console.log("");

  // ---------------------------------------------------------------------------
  // ТЕСТ 4: Інтерактивне додавання зупинок (Map Tap-to-Add)
  // ---------------------------------------------------------------------------
  console.log("--- Тест 4: Інтерактивне додавання зупинок (Tap-to-Add) ---");
  const initialStopsCount = useTripStore.getState().stops.length;
  console.log(`Початкова кількість зупинок: ${initialStopsCount}`);
  
  // Імітація кліку на мапі (додавання Львова)
  console.log("Імітація кліку на мапі: координати 49.8397, 24.0297 (Львів)...");
  await store.addStopAtLocation(49.8397, 24.0297, 'Львів');
  
  const updatedStops = useTripStore.getState().stops;
  assert(updatedStops.length === initialStopsCount + 1, "Кількість зупинок збільшилась на 1 після кліку");
  
  // Перевірка, що нова зупинка вставлена перед кінцевою
  const addedStop = updatedStops[updatedStops.length - 2];
  assert(addedStop.value === 'Львів', "Нова зупинка вставлена перед кінцевою точкою маршруту");
  console.log("");

  // ---------------------------------------------------------------------------
  // ПІДСУМОК
  // ---------------------------------------------------------------------------
  console.log("=========================================================");
  console.log(`📊 РЕЗУЛЬТАТ ТЕСТУВАННЯ: ${passedTests} / ${totalTests} тестів успішно пройдено.`);
  console.log("=========================================================");

  if (passedTests === totalTests) {
    console.log("🎉 Всі вимоги Фази 2 виконано бездоганно! Можна переходити до релізу.");
    process.exit(0);
  } else {
    console.error("⚠️ Виявлено помилки під час верифікації.");
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error("Критична помилка виконання тесту:", err);
  process.exit(1);
});
