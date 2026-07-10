import { MapIcon, CheckCircle2 } from "lucide-react";

export function LeftPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center p-2 text-center h-full">
      <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <MapIcon className="w-8 h-8" />
      </div>
      <h3 className="text-2xl font-bold text-slate-800 mb-6 drop-shadow-sm">Можливості платформи</h3>
      <ul className="text-left space-y-5 mb-8">
        <li className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <span className="text-slate-700 font-medium"><strong>Точний маршрут:</strong> Будуйте детальні автомаршрути між будь-якими містами Європи.</span>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <span className="text-slate-700 font-medium"><strong>Менеджер кордонів:</strong> Автоматичне визначення пунктів пропуску з можливістю їх зміни.</span>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <span className="text-slate-700 font-medium"><strong>Розрахунок витрат:</strong> Детальний кошторис на пальне та ночівлі з урахуванням актуальних цін.</span>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <span className="text-slate-700 font-medium"><strong>Проміжні зупинки:</strong> Зручне додавання готелів, заправок та цікавих місць по дорозі.</span>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <span className="text-slate-700 font-medium"><strong>Інтерактивна мапа:</strong> Повний візуальний контроль маршруту з підтримкою драг-н-дроп.</span>
        </li>
        <li className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <span className="text-slate-700 font-medium"><strong>Інтеграція з Waze:</strong> Готові посилання для навігації на кожному етапі вашої подорожі.</span>
        </li>
      </ul>
    </div>
  );
}
