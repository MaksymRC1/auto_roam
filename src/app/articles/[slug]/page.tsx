import { Navbar } from "@/components/navbar";
import { BackgroundSlideshow } from "@/components/background-slideshow";
import { ArticleRating } from "@/components/article-rating";

// Mock data fetching function
async function getArticle(slug: string) {
  return {
    id: slug,
    category: "МАРШРУТИ",
    title: "Топ 10 автомаршрутів Норвегією: Від фіордів до льодовиків",
    heroImage: "https://lh3.googleusercontent.com/aida/AP1WRLsk3CYSqgkMuQZb5O9D__2_Cm5u4GuuK8oY6Kixm-L6ef3s1HEdj1SOasJ4eU4xqhA_hX7AogLQrQrgYcQajxL8FAW-_LmcNlHi9GiHPVEd4N5I9eFaHM5tWfNpaGCkjvKHrLBweWTvTfsN5JT94i_AUHje6aIFwcwQlQGkvVMvl2dlKlV-d2lZtdEf1IKZW89FLZ041Xmv1d3ZUeM19HwUWcLzDtkiU7x4NAkqiq8E-c2UkEGEnDm7-z0",
    intro: "Норвегія — це країна, створена для епічних дорожніх подорожей. Її звивисті дороги, що прорізають величні гори та огинають глибокі фіорди, пропонують краєвиди, які неможливо забути. Ми зібрали для вас найкращі маршрути, які розкриють справжню красу цієї північної перлини.",
    section1Title: "Чому Норвегія — ідеальна для автоподорожі",
    section1Text: "Свобода пересування — головна перевага подорожі на авто. Ви можете зупинитися біля будь-якого водоспаду, змінити плани заради раптово відкритого краєвиду або просто насолоджуватися тишею на відокремленому оглядовому майданчику.",
    tip: "Завжди майте при собі теплий одяг, навіть влітку. Погода в горах може змінитися за лічені хвилини.",
    routes: [
      {
        name: "Атлантична дорога (Atlanterhavsveien)",
        desc: "8 км інженерного дива, що стрибає з острова на острів."
      },
      {
        name: "Стежка Тролів (Trollstigen)",
        desc: "Звивистий гірський серпантин з 11 крутими поворотами та вражаючим водоспадом Стігфоссен."
      },
      {
        name: "Лофотенські острови (Lofoten)",
        desc: "Маршрут E10 через архіпелаг з рибальськими селами та гострими піками, що виростають прямо з океану."
      }
    ],
    contentImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuDEiMsizFe6_H3WsjFrslsMXZ2mJ3QLOQbUTPPLGPeunI2zD7e_PCKtQkNF_37_2smSdzPH00m2E-1CILuUOy_gEmO_KPoxvHduUTKNolZbI4zEQ8RawQQgGjfAW8LT2cncMcDC-qGcZ5DV9k218tKO07VImsSaCAqQn1NxIWIW6ZY0fFRBJ0f9d4Hoa6YlsjFf0x3BCOKyGjcff8dh9kURxHg-cKvMs5BML83AGbElWYyNHfyX6M0EyA"
  };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug);

  return (
    <main className="min-h-screen flex flex-col font-sans overflow-x-hidden text-slate-200">
      <Navbar />
      <BackgroundSlideshow />

      <div className="flex-grow flex flex-col pt-24 md:pt-[100px] pb-12 px-4 md:px-8 w-full max-w-[1280px] mx-auto z-10 gap-8">
        
        {/* Header Image Card */}
        <div className="rounded-[24px] shadow-2xl relative overflow-hidden flex flex-col justify-between items-start p-6 md:p-12 min-h-[60vh] md:min-h-[70vh] border border-white/10 group">
          <div 
            className="absolute inset-0 bg-cover bg-center transform group-hover:scale-105 transition-transform duration-1000" 
            style={{ backgroundImage: `url('${article.heroImage}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
          
          {/* Top Left Tag */}
          <div className="relative z-10">
            <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
              {article.category}
            </span>
          </div>

          {/* Bottom Left Title */}
          <div className="relative z-10 flex flex-col gap-4 items-start text-left">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight drop-shadow-xl max-w-4xl">
              {article.title}
            </h1>
          </div>
        </div>

        {/* Content Glass Card */}
        <article 
          className="rounded-[24px] p-6 md:p-10 flex flex-col gap-8 shadow-2xl relative overflow-hidden" 
          style={{ background: "rgba(0, 0, 0, 0.45)", backdropFilter: "blur(16px)", border: "1px solid rgba(255, 255, 255, 0.1)" }}
        >
          <p className="text-lg text-white/90 leading-relaxed font-medium">
            {article.intro}
          </p>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4 drop-shadow-sm">{article.section1Title}</h2>
            <p className="text-base text-white/80 leading-relaxed">
              {article.section1Text}
            </p>
          </div>

          {/* Callout Box */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 shadow-inner relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50"></div>
            <div className="flex gap-4">
              <span className="material-symbols-outlined text-blue-400 text-[32px]">explore</span>
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Порада мандрівникам</h3>
                <p className="text-base text-white/80">
                  {article.tip}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mt-2 border-b border-white/10 pb-3 mb-5">Топ маршрутів</h3>
            <ul className="flex flex-col gap-5">
              {article.routes.map((route, idx) => (
                <li key={idx} className="flex gap-3 items-start">
                  <span className="material-symbols-outlined text-white/80 mt-1">route</span>
                  <div>
                    <strong className="text-white text-lg block mb-1">{route.name}</strong>
                    <span className="text-base text-white/70">{route.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="w-full rounded-[16px] overflow-hidden shadow-xl border border-white/10">
            <img 
              className="w-full h-64 md:h-96 object-cover hover:scale-105 transition-transform duration-700" 
              src={article.contentImage} 
              alt="Content Image" 
            />
          </div>

          {/* Interactive Rating Component */}
          <ArticleRating articleId={article.id} />
        </article>
      </div>

      {/* Desktop Footer */}
      <footer className="hidden lg:flex w-full h-10 items-center justify-between px-8 text-xs text-white/50 bg-black/30 backdrop-blur-md border-t border-white/10 z-10 relative mt-auto">
        <span>© 2024 AutoRoam. Всі права захищені.</span>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-white transition-colors">Зв'язатися з нами</a>
          <button className="flex items-center justify-center rounded-full bg-transparent text-white/50 hover:text-white transition-all group relative focus:outline-none">
            <span className="material-symbols-outlined text-[16px] transition-all duration-300 [font-variation-settings:'FILL'_0] group-hover:[font-variation-settings:'FILL'_1] group-focus:[font-variation-settings:'FILL'_1]">favorite</span>
          </button>
        </div>
      </footer>
    </main>
  );
}
