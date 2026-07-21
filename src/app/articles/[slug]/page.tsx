import { Navbar } from "@/components/navbar";
import { BackgroundSlideshow } from "@/components/background-slideshow";
import { ArticleRating } from "@/components/article-rating";
import { Footer } from "@/components/footer";

import articlesData from "@/data/articles.json";

async function getArticle(slug: string) {
  return articlesData.find(a => a.id === slug) || articlesData[0];
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const article = await getArticle(resolvedParams.slug);

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
              {article.routes.map((route: { name: string; desc: string }, idx: number) => (
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

      <Footer />
    </main>
  );
}
