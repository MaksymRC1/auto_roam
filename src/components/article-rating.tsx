"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function ArticleRating({ articleId }: { articleId: string }) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations('ArticleRating');

  const handleRating = async (ratingIndex: number) => {
    if (selectedRating !== null) return; // Prevent multiple ratings
    
    setIsSubmitting(true);
    setSelectedRating(ratingIndex);

    // Send rating to our support API endpoint
    try {
      await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "rating",
          articleId,
          rating: reactions[ratingIndex].label
        })
      });
    } catch (err) {
      console.error("Failed to submit article rating:", err);
    }
    
    setIsSubmitting(false);
  };

  const reactions = [
    { icon: "sentiment_dissatisfied", label: t('boring'), color: "text-slate-400", hoverColor: "group-hover:text-slate-400", activeColor: "bg-slate-500/20 shadow-slate-500/50 text-slate-300" },
    { icon: "sentiment_neutral", label: t('normal'), color: "text-amber-400", hoverColor: "group-hover:text-amber-400", activeColor: "bg-amber-500/20 shadow-amber-500/50 text-amber-300" },
    { icon: "local_fire_department", label: t('fire'), color: "text-orange-500", hoverColor: "group-hover:text-orange-500", activeColor: "bg-orange-500/20 shadow-orange-500/50 text-orange-400" },
    { icon: "favorite", label: t('heart'), color: "text-pink-500", hoverColor: "group-hover:text-pink-500", activeColor: "bg-pink-500/20 shadow-pink-500/50 text-pink-400" },
    { icon: "rocket_launch", label: t('packing'), color: "text-blue-400", hoverColor: "group-hover:text-blue-400", activeColor: "bg-blue-500/20 shadow-blue-500/50 text-blue-300" },
  ];

  return (
    <div className="mt-8 relative p-[1px] rounded-3xl overflow-hidden group/rating">
      {/* Animated gradient border */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-blue-500/40 blur-xl opacity-50 group-hover/rating:opacity-100 transition-opacity duration-700"></div>
      
      <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 bg-black/60 backdrop-blur-2xl border border-white/10 p-6 md:p-8 rounded-[22px] shadow-2xl">
        <div className="flex flex-col items-center md:items-start gap-1">
          <span className="text-white font-bold text-2xl text-center md:text-left drop-shadow-md">
            Оцініть статтю
          </span>
          {selectedRating !== null ? (
            <span className="text-emerald-400 text-sm font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              Дякуємо за ваш відгук!
            </span>
          ) : (
            <span className="text-white/50 text-sm font-medium">Ваша думка важлива для нас</span>
          )}
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          {reactions.map((reaction, i) => {
            const isSelected = selectedRating === i;
            const isNotSelected = selectedRating !== null && selectedRating !== i;

            return (
              <button 
                key={i} 
                onClick={() => handleRating(i)}
                disabled={selectedRating !== null || isSubmitting}
                className={`
                  group relative p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/5 
                  transition-all duration-300 focus:outline-none
                  ${selectedRating === null ? "hover:-translate-y-2 hover:bg-white/10" : ""}
                  ${isSelected ? reaction.activeColor + " scale-110 border-white/20" : ""}
                  ${isNotSelected ? "opacity-30 grayscale blur-[1px]" : ""}
                `}
              >
                <span 
                  className={`
                    material-symbols-outlined text-[28px] sm:text-[32px] transition-colors drop-shadow-md
                    ${selectedRating === null ? "text-white/40 " + reaction.hoverColor : ""}
                    ${isSelected ? reaction.color : ""}
                  `} 
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {reaction.icon}
                </span>
                
                {/* Tooltip */}
                {selectedRating === null && (
                  <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none w-max z-20">
                    <span className="bg-black/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-lg border border-white/10 shadow-2xl block">
                      {reaction.label}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
