"use client";

import { useState, useEffect } from "react";

type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

export function FaqAccordion({ items }: { items: FAQItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && items.some(item => item.id === hash)) {
      setOpenId(hash);
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  }, [items]);

  const toggleItem = (id: string) => {
    setOpenId(openId === id ? null : id);
    window.history.replaceState(null, "", `#${id}`);
  };

  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div 
            key={item.id} 
            id={item.id}
            className="rounded-[16px] overflow-hidden transition-all duration-300"
            style={{ background: "rgba(0, 0, 0, 0.45)", backdropFilter: "blur(16px)", border: "1px solid rgba(255, 255, 255, 0.1)" }}
          >
            <button 
              onClick={() => toggleItem(item.id)}
              className="w-full flex justify-between items-center p-5 text-left focus:outline-none"
            >
              <h3 className="text-lg md:text-xl font-bold text-white drop-shadow-sm pr-4">
                {item.question}
              </h3>
              <span 
                className={`material-symbols-outlined text-white transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
              >
                expand_more
              </span>
            </button>
            <div 
              className={`transition-all duration-300 ease-in-out overflow-hidden`}
              style={{ maxHeight: isOpen ? "2000px" : "0px", opacity: isOpen ? 1 : 0 }}
            >
              <div className="p-5 pt-0 text-white/80 leading-relaxed">
                {item.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
