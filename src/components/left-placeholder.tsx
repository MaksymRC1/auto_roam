export function LeftPlaceholder() {
  return (
    <div className="rounded-[20px] p-6 md:p-10 shadow-2xl text-white h-full flex flex-col justify-center" style={{ background: "rgba(0, 0, 0, 0.45)", backdropFilter: "blur(16px)", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md border border-white/10">
            <span className="material-symbols-outlined leading-none">map</span>
          </div>
          <div>
            <h3 className="font-sans text-sm font-bold text-white mb-1">Точний маршрут</h3>
            <p className="font-sans text-slate-300 text-sm">Точне планування для будь-якого типу транспорту.</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md border border-white/10">
            <span className="material-symbols-outlined leading-none">verified_user</span>
          </div>
          <div>
            <h3 className="font-sans text-sm font-bold text-white mb-1">Менеджер кордонів</h3>
            <p className="font-sans text-slate-300 text-sm">Час очікування та правила перетину в реальному часі.</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md border border-white/10">
            <span className="material-symbols-outlined leading-none">account_balance_wallet</span>
          </div>
          <div>
            <h3 className="font-sans text-sm font-bold text-white mb-1">Калькулятор витрат</h3>
            <p className="font-sans text-slate-300 text-sm">Оцінка палива, мита та проживання.</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md border border-white/10">
            <span className="material-symbols-outlined leading-none">add_location</span>
          </div>
          <div>
            <h3 className="font-sans text-sm font-bold text-white mb-1">Проміжні зупинки</h3>
            <p className="font-sans text-slate-300 text-sm">Легко додавайте точки до вашої подорожі.</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md border border-white/10">
            <span className="material-symbols-outlined leading-none">explore</span>
          </div>
          <div>
            <h3 className="font-sans text-sm font-bold text-white mb-1">Інтеграція з Google Maps</h3>
            <p className="font-sans text-slate-300 text-sm">Відкривайте готові маршрути безпосередньо у додатку.</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md border border-white/10">
            <span className="material-symbols-outlined leading-none">navigation</span>
          </div>
          <div>
            <h3 className="font-sans text-sm font-bold text-white mb-1">Інтеграція з Waze</h3>
            <p className="font-sans text-slate-300 text-sm">Експортуйте напряму у ваш навігаційний додаток.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
