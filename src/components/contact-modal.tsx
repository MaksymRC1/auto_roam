"use client";

import { useEffect } from "react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in transition-all"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div 
        className="w-full max-w-sm rounded-[20px] shadow-2xl p-5 relative flex flex-col gap-4 animate-fade-in-up"
        style={{
          background: "rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          fontFamily: "var(--font-geologica), sans-serif"
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl text-white mb-1.5 font-bold" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
              Звʼязатися з нами
            </h1>
            <p className="text-xs text-white/80 font-normal">
              Оберіть зручний для вас спосіб звʼязку.
            </p>
          </div>
          <button 
            onClick={onClose}
            aria-label="Close" 
            className="text-white/60 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10 focus:outline-none -mt-1 -mr-1"
          >
            <span className="material-symbols-outlined text-white text-[20px]" style={{ fontVariationSettings: '"FILL" 0' }}>close</span>
          </button>
        </div>

        {/* Contact Links */}
        <div className="flex flex-col gap-2.5">
          <a href="tg://user?id=8746006264" target="_blank" rel="noopener noreferrer" 
             className="flex items-center gap-3 p-3 rounded-xl transition-all duration-300 hover:bg-white/10 border border-white/5 hover:border-white/20 group cursor-pointer"
             style={{ background: "rgba(255, 255, 255, 0.05)" }}>
            <div className="w-9 h-9 rounded-full bg-[#229ED9]/20 flex items-center justify-center text-[#229ED9] group-hover:bg-[#229ED9] group-hover:text-white transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[18px]">send</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-medium text-sm">Telegram</span>
              <span className="text-white/50 text-xs">Особистий чат</span>
            </div>
          </a>

          <a href="https://wa.me/qr/SGAWLLEOFIRZE1" target="_blank" rel="noopener noreferrer"
             className="flex items-center gap-3 p-3 rounded-xl transition-all duration-300 hover:bg-white/10 border border-white/5 hover:border-white/20 group cursor-pointer"
             style={{ background: "rgba(255, 255, 255, 0.05)" }}>
            <div className="w-9 h-9 rounded-full bg-[#25D366]/20 flex items-center justify-center text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[18px]">chat</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-medium text-sm">WhatsApp</span>
              <span className="text-white/50 text-xs">Особистий чат</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
