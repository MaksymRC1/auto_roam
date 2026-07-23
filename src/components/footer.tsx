"use client";

import { useState, useEffect } from "react";
import { TermsModal } from "./terms-modal";
import { PrivacyModal } from "./privacy-modal";

interface FooterProps {
  /** Optional: callback to open the rating modal from the parent page */
  onOpenRating?: () => void;
}

export function Footer({ onOpenRating }: FooterProps) {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  useEffect(() => {
    if (isContactOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";

      const preventScroll = (e: Event) => {
        // Prevent scrolling unless the event originates from inside the popup itself
        // But since the popup has no scrollable content, we can just prevent all.
        e.preventDefault();
      };

      window.addEventListener("wheel", preventScroll, { passive: false });
      window.addEventListener("touchmove", preventScroll, { passive: false });

      return () => {
        document.body.style.overflow = "unset";
        document.documentElement.style.overflow = "unset";
        window.removeEventListener("wheel", preventScroll);
        window.removeEventListener("touchmove", preventScroll);
      };
    }
  }, [isContactOpen]);

  return (
    <>
      <footer className="hidden md:flex w-full h-10 items-center justify-between px-8 text-xs text-white/50 bg-black/30 backdrop-blur-md border-t border-white/10 z-[100] relative mt-auto">
        <div className="flex items-center gap-3">
          <span>© {new Date().getFullYear()} AutoRoam. Всі права захищені.</span>
          <div className="relative group cursor-default">
            <span className="bg-white/10 px-2 py-0.5 rounded text-white/70 hover:bg-white/20 transition-colors">v1.0.1</span>
            
            {/* Version Tooltip */}
            <div className="absolute bottom-full left-0 mb-2 w-[250px] p-3 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-300 translate-y-1 group-hover:translate-y-0 z-[120] bg-black/50 backdrop-blur-md border border-white/10">
              <h4 className="text-white/90 font-medium text-[13px] mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-blue-400">new_releases</span>
                Версія 1.0.1
              </h4>
              <ul className="text-white/60 text-[11px] flex flex-col gap-1 list-disc pl-4">
                <li>Офлайн-режим</li>
                <li>Інтерактивний таймлайн маршруту</li>
                <li>Калькулятор пального та кошторис</li>
                <li>Анімації та сучасний UI/UX</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 relative">
          <button 
            onClick={(e) => { e.preventDefault(); setIsTermsOpen(true); }}
            className="flex items-center justify-center rounded-full bg-transparent text-white/50 hover:text-white transition-all group relative focus:outline-none"
            aria-label="Умови використання"
            title="Умови використання"
          >
            <span className="material-symbols-outlined text-[16px] transition-all duration-300 [font-variation-settings:'FILL'_0] group-hover:[font-variation-settings:'FILL'_1]">
              description
            </span>
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); setIsPrivacyOpen(true); }}
            className="flex items-center justify-center rounded-full bg-transparent text-white/50 hover:text-white transition-all group relative focus:outline-none"
            aria-label="Політика конфіденційності"
            title="Політика конфіденційності"
          >
            <span className="material-symbols-outlined text-[16px] transition-all duration-300 [font-variation-settings:'FILL'_0] group-hover:[font-variation-settings:'FILL'_1]">
              shield
            </span>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsContactOpen(!isContactOpen);
            }}
            className="flex items-center justify-center rounded-full bg-transparent text-white/50 hover:text-white transition-all group relative focus:outline-none"
            aria-label="Зв'язатися з нами"
            title="Зв'язатися з нами"
          >
            <span className="material-symbols-outlined text-[16px] transition-all duration-300 [font-variation-settings:'FILL'_0] group-hover:[font-variation-settings:'FILL'_1]">
              chat
            </span>
          </button>
          {onOpenRating && (
            <button
              onClick={onOpenRating}
              className="flex items-center justify-center rounded-full bg-transparent text-white/50 hover:text-white transition-all group relative focus:outline-none"
              aria-label="Оцінити продукт"
            >
              <span
                className="material-symbols-outlined text-[16px] transition-all duration-300 [font-variation-settings:'FILL'_0] group-hover:[font-variation-settings:'FILL'_1]"
              >
                favorite
              </span>
            </button>
          )}

          {/* Contact Popover */}
          {isContactOpen && (
            <>
              {/* Invisible backdrop to close popover on click outside */}
              <div
                className="fixed inset-0 w-screen h-screen z-[70] bg-black/0 cursor-default pointer-events-auto"
                onClick={() => setIsContactOpen(false)}
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
              />
              <div
                className="fixed bottom-14 right-8 w-[220px] rounded-2xl shadow-2xl p-4 flex flex-col gap-3 z-[110] animate-in slide-in-from-bottom-2 fade-in duration-200 pointer-events-auto"
                style={{
                  background: "rgba(0, 0, 0, 0.45)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                }}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white/90 font-medium text-sm">
                    Звʼязатися з нами
                  </span>
                  <button
                    onClick={() => setIsContactOpen(false)}
                    className="text-white/40 hover:text-white transition-colors focus:outline-none"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      close
                    </span>
                  </button>
                </div>

                <div className="flex flex-row justify-center gap-3">
                  <a
                    href="tg://user?id=8746006264"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 cursor-pointer bg-white/5"
                    title="Telegram"
                  >
                    <span className="material-symbols-outlined text-[#229ED9] text-[24px] [font-variation-settings:'FILL'_1]">
                      send
                    </span>
                  </a>
                  <a
                    href="https://wa.me/qr/SGAWLLEOFIRZE1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 cursor-pointer bg-white/5"
                    title="WhatsApp"
                  >
                    <span className="material-symbols-outlined text-[#25D366] text-[24px] [font-variation-settings:'FILL'_1]">
                      chat
                    </span>
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </footer>
      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </>
  );
}
