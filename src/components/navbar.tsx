"use client";
import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { ContactModal } from './contact-modal'
import { RatingModal } from './rating-modal'
import { SupportModal } from './support-modal'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isContactOpen, setIsContactOpen] = useState(false)
  const [isRatingOpen, setIsRatingOpen] = useState(false)
  const [isSupportOpen, setIsSupportOpen] = useState(false)

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    // Cleanup function
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  const openContact = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMenuOpen(false);
    setIsContactOpen(true);
  }

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 text-white shadow-2xl transition-all duration-300" style={{ background: "rgba(0, 0, 0, 0.45)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
        <div className="flex justify-between items-center h-14 w-full px-4 md:px-8">
          <a className="font-display font-bold text-2xl text-white flex items-center gap-2" href="/">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>route</span>
            AutoRoam
          </a>
          <div className="hidden md:flex items-center gap-6">
            <a className="text-white/80 hover:text-white font-medium transition-colors text-sm" href="/articles">Статті</a>
            <a className="text-white/80 hover:text-white font-medium transition-colors text-sm" href="/faq">FAQ</a>
            <button 
              className="text-white/80 hover:text-white font-medium transition-colors text-sm focus:outline-none" 
              onClick={() => setIsSupportOpen(true)}
            >
              Підтримка
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsRatingOpen(true)}
              className="p-1.5 flex items-center justify-center rounded-full bg-transparent text-white transition-all text-xs font-bold group relative focus:outline-none"
              aria-label="Підтримати проект"
            >
              <Heart className="w-5 h-5 text-white/90 transform-gpu will-change-transform transition-colors duration-300 fill-transparent group-hover:fill-white group-focus:fill-white" />
              <span className="absolute right-0 top-10 scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200 bg-slate-900 border border-white/10 px-3 py-1.5 rounded-lg text-xs text-white/90 shadow-xl whitespace-nowrap pointer-events-none">
                Підтримати проект
              </span>
            </button>
            <button 
              className="md:hidden text-white p-2" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Закрити меню" : "Відкрити меню"}
            >
              <span className="material-symbols-outlined">{isMenuOpen ? "close" : "menu"}</span>
            </button>

          </div>
        </div>

        <div 
          className={`md:hidden absolute top-14 left-0 w-full flex flex-col items-center py-8 gap-6 shadow-2xl transition-all duration-300 origin-top z-50 ${
            isMenuOpen ? "opacity-100 scale-y-100 pointer-events-auto" : "opacity-0 scale-y-95 pointer-events-none"
          }`} 
          style={{ background: "rgba(0, 0, 0, 0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}
          aria-hidden={!isMenuOpen}
        >
          <a className="text-white/90 hover:text-white font-medium text-lg" href="/articles" onClick={() => setIsMenuOpen(false)}>Статті</a>
          <a className="text-white/90 hover:text-white font-medium text-lg" href="/faq" onClick={() => setIsMenuOpen(false)}>FAQ</a>

          <a className="text-white/90 hover:text-white font-medium text-lg" href="#" onClick={openContact}>Зв&#39;язатися з нами</a>

        </div>
      </nav>

      {/* Mobile Menu Backdrop (Catches clicks to close menu and block page interaction) */}
      {isMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 top-14 z-40 bg-transparent"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Contact Modal (mobile only) */}
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />

      {/* Rating Modal */}
      <RatingModal isOpen={isRatingOpen} onClose={() => setIsRatingOpen(false)} />

      {/* Support Modal */}
      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
    </>
  )
}
