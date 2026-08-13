"use client";

import { useState, useEffect } from "react";
import { useTripStore } from "@/store/useTripStore";
import { ChevronLeft, X } from "lucide-react";

interface TourStep {
  title: string;
  description: string;
  targetId: string;
}

import { useTranslations } from "next-intl";

export function TabletOnboardingTour() {
  const t = useTranslations('Onboarding');
  const { isCalculated, hasSeenTabletOnboarding, setHasSeenTabletOnboarding } = useTripStore();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const steps: TourStep[] = [
    {
      title: t('routeParamsTitle'),
      description: t('routeParamsDesc'),
      targetId: "desktop-tour-search"
    },
    {
      title: t('smartPanelsTitle'),
      description: t('smartPanelsDesc'),
      targetId: "desktop-tour-panels"
    },
    {
      title: t('mapTimelineTitle'),
      description: t('mapTimelineDesc'),
      targetId: "desktop-tour-map"
    }
  ];
  
  useEffect(() => {
    // Determine if it's a tablet/desktop screen (>768px)
    const isDesktop = window.innerWidth >= 768;
    if (isCalculated && !hasSeenTabletOnboarding && !isActive && isDesktop) {
      const timer = setTimeout(() => {
        setIsActive(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isCalculated, hasSeenTabletOnboarding, isActive]);

  // Lock scroll before and during the tour
  useEffect(() => {
    const isDesktop = window.innerWidth >= 768;
    if (isCalculated && !hasSeenTabletOnboarding && isDesktop) {
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
  }, [isCalculated, hasSeenTabletOnboarding]);



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
    setHasSeenTabletOnboarding(true);
  };

  useEffect(() => {
    if (!isActive) return;
    
    const updatePosition = () => {
      const targetId = steps[currentStep].targetId;
      const element = document.getElementById(targetId);
      
      // Fallback: If element is missing, skip to next step
      if (!element && currentStep < steps.length - 1) {
          handleNext();
          return;
      }

      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
        
        // Ensure the element is visible on screen if it's offscreen
        if (rect.top < 0 || rect.bottom > window.innerHeight) {
             element.scrollIntoView({ behavior: 'smooth', block: 'center' });
             setTimeout(() => {
                 const newRect = element?.getBoundingClientRect();
                 if (newRect) setTargetRect(newRect);
             }, 500);
        }
      }
    };
    
    updatePosition();
    
    const timer = setTimeout(updatePosition, 300);
    
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("resize", updatePosition);
      clearTimeout(timer);
    };
  }, [isActive, currentStep]);

  if (!isActive) return null;

  const step = steps[currentStep];
  
  // Calculate window dimensions to avoid SSR errors
  const winInnerHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  const winInnerWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none hidden md:block">
      {/* Dimmed background */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 pointer-events-auto"
        onClick={finishTour}
      />
      
      {/* Spotlight highlight over the target button */}
      {targetRect && (
        <div 
          className="absolute rounded-3xl border border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all duration-300 ease-out pointer-events-none z-[61] bg-white/10"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        />
      )}

      {/* Popover Card */}
      {targetRect && (
        <div 
          className="absolute z-[62] w-[320px] rounded-[20px] shadow-2xl p-5 flex flex-col gap-3 transition-all duration-300 ease-out pointer-events-auto animate-fade-in-up"
          style={{
            background: "rgba(0, 0, 0, 0.45)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            fontFamily: "var(--font-geologica), sans-serif",
            // Position above, below or side depending on target position and available space
            // If it's on the right side of the screen, show to the left
            ...(targetRect.left > winInnerWidth / 2 
              ? { right: winInnerWidth - targetRect.left + 24, top: Math.max(20, targetRect.top + targetRect.height / 2 - 100) } 
              : { left: targetRect.right + 24, top: Math.max(20, targetRect.top + targetRect.height / 2 - 100) }
            ),
          }}
        >
          {/* Arrow pointing to the target */}
          <div 
            className={`absolute w-4 h-4 rotate-45 border-white/15 shadow-sm ${targetRect.left > winInnerWidth / 2 ? '-right-2 border-r border-t' : '-left-2 border-l border-b'}`}
            style={{
              background: "rgba(20, 20, 20, 0.95)",
              top: '50%',
              transform: 'translateY(-50%) rotate(45deg)'
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

          <div className="flex items-center justify-between mt-3 pt-4 border-t border-white/10">
            <button 
              onClick={finishTour}
              className="text-white/40 hover:text-white/80 text-xs font-medium transition-colors"
            >
              {t('skip')}
            </button>
            <div className="flex items-center gap-2">
              <div className="text-white/40 text-[10px] font-medium tracking-widest mr-2">
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
                {currentStep === steps.length - 1 ? t('done') : t('next')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
