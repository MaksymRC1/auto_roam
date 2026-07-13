"use client";

import { useState, useEffect } from "react";

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
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
      setName("");
      setEmail("");
      setMessage("");
      setIsSubmitted(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: implement backend API call
    setIsSubmitted(true);
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
              Задати питання
            </h2>
            <p className="text-xs text-white/70">
              Напишіть нам, і ми відповімо якнайшвидше
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

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {/* Name */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-white/60 font-medium ml-1">
                Ваше ім&#39;я
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Іван"
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-white/60 font-medium ml-1">
                Електронна пошта
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ivan@example.com"
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              />
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-white/60 font-medium ml-1">
                Повідомлення
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Опишіть ваше питання..."
                required
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all resize-none"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-white text-slate-900 font-bold text-sm hover:bg-white/90 transition-all duration-300 mt-1"
            >
              Надіслати
            </button>
          </form>
        ) : (
          /* Success State */
          <div className="flex flex-col items-center gap-3 py-6 animate-fade-in-up">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-emerald-400 text-[32px]"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                check_circle
              </span>
            </div>
            <h3 className="text-white font-bold text-lg">Дякуємо!</h3>
            <p className="text-white/60 text-sm text-center">
              Ваше повідомлення надіслано. Ми відповімо на вашу пошту
              якнайшвидше.
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-6 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white text-sm font-medium hover:bg-white/20 transition-all"
            >
              Закрити
            </button>
          </div>
        )}

        {/* Alternative contact hint */}
        {!isSubmitted && (
          <div className="flex items-center gap-2 justify-center pt-1">
            <span className="text-white/30 text-[11px]">або напишіть в</span>
            <a
              href="https://t.me/AutoRoam"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#229ED9] text-[11px] font-medium hover:underline"
            >
              Telegram
            </a>
            <span className="text-white/20 text-[11px]">·</span>
            <a
              href="https://wa.me/1234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#25D366] text-[11px] font-medium hover:underline"
            >
              WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
