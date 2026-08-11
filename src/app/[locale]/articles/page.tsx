"use client";

import { useRef, useState, useEffect } from "react";
import { Navbar } from "@/components/navbar"
import { BackgroundSlideshow } from "@/components/background-slideshow"
import { Footer } from "@/components/footer"
import Link from "next/link"

import articlesData from "@/data/articles.json";

const ARTICLES = articlesData.map((article) => ({
  href: `/articles/${article.id}`,
  image: article.heroImage,
  category: article.category,
  title: article.title,
  date: article.date,
}));

export default function ArticlesPage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [visibleCount, setVisibleCount] = useState(3);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scrollLeftFn = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -424, behavior: 'smooth' });
    }
  };

  const scrollRightFn = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 424, behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen flex flex-col font-sans overflow-x-hidden text-slate-200">
      <Navbar />
      <BackgroundSlideshow />
      
      <div className="flex-grow flex flex-col pt-24 pb-8 md:pb-24 w-full mx-auto z-10">
        
        {/* Header Section */}
        <header className="mb-12 text-center px-4 md:px-8 max-w-[1280px] mx-auto w-full">
          <h1 className="text-3xl md:text-5xl lg:text-[48px] font-extrabold mb-4 drop-shadow-md text-white tracking-tight">
            Поради для мандрівників
          </h1>
          <p className="text-base md:text-lg text-white/90 drop-shadow-sm max-w-2xl mx-auto">
            Експертні поради, маршрути та лайфхаки для вашої ідеальної автомобільної подорожі.
          </p>
        </header>

        {/* Mobile View: Vertical Grid with Load More */}
        <div className="md:hidden flex flex-col px-4">
          <div className="grid grid-cols-1 gap-6">
            {ARTICLES.slice(0, visibleCount).map((article, idx) => (
              <div key={idx} className="animate-fade-in-up [animation-fill-mode:both]" style={{ animationDelay: `${(idx % 3) * 0.15}s` }}>
                <ArticleCardMobile {...article} />
              </div>
            ))}
          </div>
          
          {visibleCount < ARTICLES.length && (
            <div className="mt-10 flex justify-center">
              <button 
                onClick={() => setVisibleCount(prev => prev + 3)}
                className="bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/10 text-white font-medium text-sm py-3 px-8 rounded-full transition-all duration-300 flex items-center gap-2"
              >
                Завантажити ще
                <span className="material-symbols-outlined text-[18px]">refresh</span>
              </button>
            </div>
          )}
        </div>

        {/* Desktop View: Swipeable Carousel */}
        <div className="hidden md:block w-full relative px-12 max-w-[1400px] mx-auto group/carousel">
          
          {/* Scroll Arrows */}
          {canScrollLeft && (
            <button 
              onClick={scrollLeftFn}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:scale-110 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 -ml-4 opacity-0 group-hover/carousel:opacity-100 group-hover/carousel:ml-4"
              aria-label="Previous articles"
            >
              <span className="material-symbols-outlined text-[24px]">chevron_left</span>
            </button>
          )}
          
          {canScrollRight && (
            <button 
              onClick={scrollRightFn}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:scale-110 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 -mr-4 opacity-0 group-hover/carousel:opacity-100 group-hover/carousel:mr-4"
              aria-label="Next articles"
            >
              <span className="material-symbols-outlined text-[24px]">chevron_right</span>
            </button>
          )}

          <div 
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex overflow-x-auto gap-6 pb-12 pt-4 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {ARTICLES.map((article, idx) => (
              <div key={idx} className="flex-none w-[400px] snap-center animate-fade-in-up [animation-fill-mode:both]" style={{ animationDelay: `${idx * 0.15}s` }}>
                <ArticleCardDesktop {...article} />
              </div>
            ))}
          </div>
        </div>

      </div>

      <Footer />
    </main>
  );
}

// Mobile Card
function ArticleCardMobile({ href, image, category, title }: { href: string, image: string, category: string, title: string }) {
  return (
    <Link href={href} className="contents md:hidden">
      <article className="h-full rounded-[20px] overflow-hidden flex flex-col group hover:scale-[1.02] hover:shadow-2xl hover:border-white/40 hover:shadow-blue-500/20 transition-all duration-500 cursor-pointer shadow-xl relative" style={{ background: "rgba(0, 0, 0, 0.45)", backdropFilter: "blur(12px)", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
        <div className="h-56 w-full relative overflow-hidden shrink-0">
          <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={image} alt={title} />
          <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md border border-white/10 text-white px-4 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider">
            {category}
          </div>
        </div>
        <div className="p-6 flex flex-col flex-grow">
          <h2 className="text-xl font-bold text-white mb-6 line-clamp-2 leading-tight">{title}</h2>
          <div className="flex items-center text-white text-sm font-medium mt-auto group-hover:text-blue-300 transition-colors">
            Читати далі
            <span className="material-symbols-outlined ml-2 text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </div>
        </div>
      </article>
    </Link>
  )
}

// Desktop/Tablet Card
function ArticleCardDesktop({ href, image, category, title, date }: { href: string, image: string, category: string, title: string, date: string }) {
  let tagClass = "bg-blue-500/20 text-blue-200 border-blue-500/30";
  if (category === "Кордон") tagClass = "bg-blue-500/20 text-blue-200 border-blue-500/30";
  if (category === "Маршрути") tagClass = "bg-amber-500/20 text-amber-200 border-amber-500/30";
  if (category === "Підготовка") tagClass = "bg-orange-500/20 text-orange-200 border-orange-500/30";

  return (
    <Link href={href} className="contents hidden md:contents">
      <article className="h-full hidden md:flex rounded-[16px] overflow-hidden flex-col group hover:scale-[1.02] hover:border-white/40 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 relative" style={{ background: "rgba(0, 0, 0, 0.45)", backdropFilter: "blur(12px)", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
        <div className="h-64 w-full relative overflow-hidden shrink-0">
          <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={image} alt={title} />
          <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm border ${tagClass}`}>
            {category}
          </div>
        </div>
        <div className="p-6 flex flex-col flex-grow">
          <time className="text-xs text-white/50 mb-2 block font-medium">{date}</time>
          <h2 className="text-2xl font-bold text-white mb-8 line-clamp-3 leading-tight">{title}</h2>
          <div className="inline-flex justify-center items-center px-6 py-3 rounded-xl border border-white/30 text-white font-medium hover:bg-white hover:text-slate-900 transition-all duration-300 w-auto self-start mt-auto">
            Читати далі
            <span className="material-symbols-outlined ml-2 text-[18px] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-2 group-hover:translate-x-1 transition-all duration-300">arrow_forward</span>
          </div>
        </div>
      </article>
    </Link>
  )
}
