"use client";

import { useState, useEffect } from "react";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RatingModal({ isOpen, onClose }: RatingModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('autoroam_app_rating');
      if (saved) {
        setRating(Number(saved));
        setIsSubmitted(true);
      } else {
        setRating(0);
        setHoveredStar(0);
        setIsSubmitted(false);
      }
    }
  }, [isOpen]);

  const handleRate = (star: number) => {
    setRating(star);
    setIsSubmitted(true);
    localStorage.setItem('autoroam_app_rating', String(star));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="w-[320px] rounded-[20px] shadow-2xl p-5 relative flex flex-col gap-4 animate-fade-in-up"
        style={{
          background: "rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          fontFamily: "var(--font-geologica), sans-serif",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2
              className="text-xl text-white mb-1 font-bold"
              style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
            >
              Оцініть AutoRoam
            </h2>
            <p className="text-xs text-white/70">
              Ваша підтримка допомагає нам ставати кращими
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-white/60 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10 focus:outline-none -mt-1 -mr-1"
          >
            <span
              className="material-symbols-outlined text-white text-[20px]"
              style={{ fontVariationSettings: '"FILL" 0' }}
            >
              close
            </span>
          </button>
        </div>

        {/* Star Rating */}
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= (hoveredStar || rating);
              return (
                <button
                  key={star}
                  onClick={() => handleRate(star)}
                  onMouseEnter={() => !isSubmitted && setHoveredStar(star)}
                  onMouseLeave={() => !isSubmitted && setHoveredStar(0)}
                  disabled={isSubmitted}
                  className={`p-1 rounded-lg transition-all duration-200 focus:outline-none ${
                    isSubmitted
                      ? ""
                      : "hover:scale-125 hover:bg-white/10 active:scale-95"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[28px] transition-colors duration-200 ${
                      isFilled ? "text-amber-400" : "text-white/20"
                    }`}
                    style={{
                      fontVariationSettings: isFilled
                        ? '"FILL" 1'
                        : '"FILL" 0',
                    }}
                  >
                    star
                  </span>
                </button>
              );
            })}
          </div>

          {isSubmitted && (
            <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium animate-fade-in-up">
              <span className="material-symbols-outlined text-[16px]">
                check_circle
              </span>
              Дякуємо за вашу оцінку!
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-white/10" />

        {/* Donate Section */}
        <div>
          <h3 className="text-sm text-white font-bold mb-1">
            Підтримати проект
          </h3>
          <p className="text-xs text-white/50 mb-3">
            Допоможіть нам розвивати AutoRoam далі
          </p>
          <div className="flex flex-col gap-2">
            <a
              href="https://send.monobank.ua/jar/U3CVzKjWp"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full h-[52px] rounded-xl bg-black hover:bg-neutral-900 border border-white/10 transition-all duration-300 text-white font-bold text-sm cursor-pointer shadow-lg hover:border-white/20 select-none group"
            >
              {/* Premium Monobank Monopay style SVG */}
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-[15px] tracking-tight">mono</span>
                <span className="px-1.5 py-0.5 rounded-[4px] bg-[#E95353] text-[10px] font-black uppercase tracking-wider text-white group-hover:bg-[#f26161] transition-colors">pay</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
