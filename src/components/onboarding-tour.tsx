"use client";

import { useState, useEffect } from "react";
import { useTripStore } from "@/store/useTripStore";
import { ChevronLeft, X } from "lucide-react";

interface TourStep {
  title: string;
  description: string;
  targetId: string;
}

const steps: TourStep[] = [
  {
    title: "Параметри маршруту",
    description: "Додавайте або редагуйте зупинки, заправки та місця для відпочинку.",
    targetId: "tour-step-stops"
  },
  {
    title: "Страхування та віньєтки",
    description: "Додайте вартість зеленої карти та дорожніх зборів для точного кошторису.",
    targetId: "tour-step-insurance"
  },
  {
    title: "Розрахунок палива",
    description: "Вкажіть витрату палива та налаштуйте його тип для подорожі.",
    targetId: "tour-step-fuel"
  },
  {
    title: "Загальний кошторис",
    description: "Контролюйте всі витрати: паливо, готелі та додаткові збори в одному місці.",
    targetId: "tour-step-budget"
  }
];

export function OnboardingTour() {
  const { isCalculated, hasSeenOnboarding, setHasSeenOnboarding } = useTripStore();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isCalculated && !hasSeenOnboarding && !isActive && isMobile) {
      const timer = setTimeout(() => {
        setIsActive(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isCalculated, hasSeenOnboarding, isActive]);

  // Lock scroll before and during the tour
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isCalculated && !hasSeenOnboarding && isMobile) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      
      const preventDefault = (e: TouchEvent) => {
        e.preventDefault();
      };
      // Passive must be false to call preventDefault
      document.addEventListener("touchmove", preventDefault, { passive: false });
      
      return () => {
        document.body.style.overflow = originalStyle;
        document.removeEventListener("touchmove", preventDefault);
      };
    }
  }, [isCalculated, hasSeenOnboarding]);

  useEffect(() => {
    if (!isActive) return;
    
    const updatePosition = () => {
      const targetId = steps[currentStep].targetId;
      const element = document.getElementById(targetId);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
      }
    };
    
    // Initial position
    updatePosition();
    
    // Some elements might animate or shift, so we update shortly after too
    const timer = setTimeout(updatePosition, 300);
    
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("resize", updatePosition);
      clearTimeout(timer);
    };
  }, [isActive, currentStep]);

  if (!isActive) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      finishTour();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(s => s - 1);
    }
  };

  const finishTour = () => {
    setIsActive(false);
    setHasSeenOnboarding(true);
  };

  const step = steps[currentStep];
  
  // Calculate window dimensions to avoid SSR errors
  const winInnerHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  const winInnerWidth = typeof window !== 'undefined' ? window.innerWidth : 375;

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none md:hidden">
      {/* Dimmed background. pointer-events-auto makes it block interactions while touring. */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 pointer-events-auto"
        onClick={finishTour}
      />
      
      {/* Spotlight highlight over the target button */}
      {targetRect && (
        <div 
          className="absolute rounded-full border border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-300 ease-out pointer-events-none z-[61] bg-white/10"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
          }}
        />
      )}

      {/* Popover Card */}
      {targetRect && (
        <div 
          className="absolute z-[62] w-[280px] rounded-[20px] shadow-2xl p-4 flex flex-col gap-3 transition-all duration-300 ease-out pointer-events-auto animate-fade-in-up"
          style={{
            background: "rgba(0, 0, 0, 0.45)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            fontFamily: "var(--font-geologica), sans-serif",
            // Position above or below depending on target position
            ...(targetRect.top > winInnerHeight / 2 
              ? { bottom: winInnerHeight - targetRect.top + 16 } 
              : { top: targetRect.bottom + 16 }
            ),
            left: Math.min(Math.max(16, targetRect.left + targetRect.width / 2 - 140), winInnerWidth - 296)
          }}
        >
          {/* Arrow pointing to the button */}
          <div 
            className={`absolute w-4 h-4 rotate-45 border-white/15 shadow-sm ${targetRect.top > winInnerHeight / 2 ? '-bottom-2 border-r border-b' : '-top-2 border-l border-t'}`}
            style={{
              background: "rgba(20, 20, 20, 0.95)", // Slightly darker solid to mask blur overflow
              // Position arrow exactly pointing to the target's center horizontally relative to popover
              left: Math.max(16, targetRect.left + targetRect.width / 2 - Math.min(Math.max(16, targetRect.left + targetRect.width / 2 - 140), winInnerWidth - 296) - 8)
            }}
          />

          <div className="flex justify-between items-start">
            <h3 className="text-white font-bold text-sm" style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
              {step.title}
            </h3>
            <button 
              onClick={finishTour}
              className="text-white/50 hover:text-white transition-colors w-6 h-6 flex items-center justify-center rounded-full -mt-1 -mr-1 focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <p className="text-white/80 text-xs leading-relaxed min-h-[40px]">
            {step.description}
          </p>

          <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/10">
            <button 
              onClick={finishTour}
              className="text-white/40 hover:text-white/80 text-xs font-medium transition-colors"
            >
              Пропустити
            </button>
            <div className="flex items-center gap-2">
              <div className="text-white/40 text-[10px] font-medium tracking-widest mr-1">
                {currentStep + 1} / {steps.length}
              </div>
              <button 
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:pointer-events-none focus:outline-none"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={handleNext}
                className="px-4 h-8 rounded-full bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs shadow-lg transition-transform active:scale-[0.98] focus:outline-none flex items-center justify-center"
              >
                {currentStep === steps.length - 1 ? "Готово" : "Далі"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
