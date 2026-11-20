"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, ChevronRight, X } from "lucide-react";

const TOUR_SECTIONS = [
  { id: "hero", label: "Overview" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "platforms", label: "Platforms" },
  { id: "contact", label: "Contact" },
];

interface SceneAutoTourProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function SceneAutoTour({ isEnabled, onToggle }: SceneAutoTourProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const userTimerRef = useRef<NodeJS.Timeout | null>(null);
  const tourIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Mark user interaction and pause tour temporarily
  const handleUserActivity = useCallback(() => {
    if (!isEnabled) return;
    setIsUserInteracting(true);

    if (userTimerRef.current) {
      clearTimeout(userTimerRef.current);
    }

    // Resume after 5 seconds of inactivity
    userTimerRef.current = setTimeout(() => {
      setIsUserInteracting(false);
    }, 5000);
  }, [isEnabled]);

  // Listen to user scroll / touch / keyboard interactions
  useEffect(() => {
    if (!isEnabled) return;

    const events = ["wheel", "touchstart", "touchmove", "pointerdown", "keydown"];
    const listener = () => handleUserActivity();

    events.forEach((evt) => {
      window.addEventListener(evt, listener, { passive: true });
    });

    return () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, listener);
      });
      if (userTimerRef.current) {
        clearTimeout(userTimerRef.current);
      }
    };
  }, [isEnabled, handleUserActivity]);

  // Step to next section smoothly
  const stepToSection = useCallback(
    (index: number) => {
      if (index >= TOUR_SECTIONS.length) {
        // Finished tour
        onToggle(false);
        return;
      }
      const section = TOUR_SECTIONS[index];
      const target = document.getElementById(section.id);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        setCurrentIndex(index);
      }
    },
    [onToggle]
  );

  // Main guided tour loop
  useEffect(() => {
    if (!isEnabled) {
      if (tourIntervalRef.current) clearInterval(tourIntervalRef.current);
      return;
    }

    tourIntervalRef.current = setInterval(() => {
      if (!isUserInteracting) {
        setCurrentIndex((prev) => {
          const next = prev + 1;
          if (next >= TOUR_SECTIONS.length) {
            onToggle(false);
            return 0;
          }
          const section = TOUR_SECTIONS[next];
          const target = document.getElementById(section.id);
          if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
          }
          return next;
        });
      }
    }, 6000); // 6 seconds per section for comfortable reading

    return () => {
      if (tourIntervalRef.current) clearInterval(tourIntervalRef.current);
    };
  }, [isEnabled, isUserInteracting, onToggle]);

  if (!isEnabled) return null;

  return (
    <aside
      aria-label="Auto tour controls"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#12110E] text-[#FCEFC3] px-4 py-2.5 rounded-full shadow-xl border border-[#00CEC8]/30 flex items-center gap-3 text-xs font-mono backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-300"
    >
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isUserInteracting ? "bg-[#FF9C5F]" : "bg-[#00CEC8]"
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              isUserInteracting ? "bg-[#FF9C5F]" : "bg-[#00CEC8]"
            }`}
          />
        </span>
        <span className="font-bold text-white">
          {isUserInteracting ? "Tour Paused" : "Auto-Touring"}
        </span>
      </div>

      <span className="text-white/40">·</span>

      <span className="text-[#00CEC8] font-bold">
        {TOUR_SECTIONS[currentIndex]?.label || "Exploring"}
      </span>

      <span className="text-white/40">·</span>

      <button
        type="button"
        onClick={() => stepToSection((currentIndex + 1) % TOUR_SECTIONS.length)}
        className="flex items-center gap-1 text-[#FCEFC3]/80 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-white/10"
        title="Next Section"
      >
        <span>Next</span>
        <ChevronRight className="w-3.5 h-3.5 text-[#FF9C5F]" />
      </button>

      <button
        type="button"
        onClick={() => onToggle(false)}
        className="text-white/60 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10 ml-1"
        title="Stop Auto-Tour"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </aside>
  );
}
