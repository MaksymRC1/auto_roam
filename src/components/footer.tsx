"use client";

import { useState } from "react";

interface FooterProps {
  /** Optional: callback to open the rating modal from the parent page */
  onOpenRating?: () => void;
}

export function Footer({ onOpenRating }: FooterProps) {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <>
      <footer className="hidden md:flex w-full h-10 items-center justify-between px-8 text-xs text-white/50 bg-black/30 backdrop-blur-md border-t border-white/10 z-[100] relative mt-auto">
        <div className="flex items-center gap-3">
          <span>© {new Date().getFullYear()} AutoRoam. Всі права захищені.</span>
          <div className="relative group cursor-default">
            <span className="bg-white/10 px-2 py-0.5 rounded text-white/70 hover:bg-white/20 transition-colors">v1.0.1</span>
            
            {/* Version Tooltip */}
            <div className="absolute bottom-full left-0 mb-3 w-[280px] p-4 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-[120]"
              style={{
                background: "rgba(15, 23, 42, 0.95)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <h4 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-blue-400">new_releases</span>
                Версія 1.0.1
              </h4>
              <ul className="text-white/70 text-xs flex flex-col gap-1.5 list-disc pl-4">
                <li>PWA-додаток (встановлення на смартфон)</li>
                <li>Офлайн-режим (Мандрівка) та кешування</li>
                <li>Інтерактивний таймлайн маршруту</li>
                <li>Калькулятор пального та кошторис</li>
                <li>Анімації та сучасний UI/UX</li>
              </ul>
              
              {/* Tooltip Arrow */}
              <div className="absolute top-full left-4 -mt-[1px] border-[6px] border-transparent border-t-[rgba(15,23,42,0.95)]"></div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 relative">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsContactOpen(!isContactOpen);
            }}
            className="hover:text-white transition-colors cursor-pointer focus:outline-none pointer-events-auto"
          >
            Зв&#39;язатися з нами
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
                className="fixed inset-0 z-[70] cursor-default pointer-events-auto"
                onClick={() => setIsContactOpen(false)}
              />
              <div
                className="fixed bottom-14 right-8 w-[220px] rounded-2xl shadow-2xl p-4 flex flex-col gap-3 z-[110] animate-in slide-in-from-bottom-2 fade-in duration-200 pointer-events-auto"
                style={{
                  background: "rgba(15, 23, 42, 0.95)",
                  backdropFilter: "blur(24px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
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

                <div className="flex flex-col gap-1.5">
                  <a
                    href="tg://user?id=8746006264"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[#229ED9] text-[16px] [font-variation-settings:'FILL'_1]">
                      send
                    </span>
                    <span className="text-white/90 text-sm">
                      Telegram
                    </span>
                  </a>
                  <a
                    href="https://wa.me/qr/SGAWLLEOFIRZE1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[#25D366] text-[16px] [font-variation-settings:'FILL'_1]">
                      chat
                    </span>
                    <span className="text-white/90 text-sm">
                      WhatsApp
                    </span>
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </footer>
    </>
  );
}
