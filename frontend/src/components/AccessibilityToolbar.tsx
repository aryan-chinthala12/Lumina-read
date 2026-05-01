"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Eye, Type, ALargeSmall, SlidersHorizontal } from "lucide-react";

export default function AccessibilityToolbar() {
  const [dyslexicMode, setDyslexicMode] = useState(false);
  const [lineHeight, setLineHeight] = useState(1.7);
  const [isExpanded, setIsExpanded] = useState(false);

  // Toggle .dyslexic-mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (dyslexicMode) {
      root.classList.add("dyslexic-mode");
    } else {
      root.classList.remove("dyslexic-mode");
    }
  }, [dyslexicMode]);

  // Update --user-line-height CSS variable on <html> for instant slider feedback
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--user-line-height",
      String(lineHeight)
    );
  }, [lineHeight]);

  const handleLineHeightChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLineHeight(parseFloat(e.target.value));
    },
    []
  );

  return (
    <div
      id="accessibility-toolbar"
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
    >
      {/* Expanded panel */}
      {isExpanded && (
        <div
          className="rounded-2xl border p-5 w-72 shadow-2xl"
          style={{
            background: "rgba(255,255,255,0.08)",
            borderColor: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <h3 className="text-sm font-semibold text-white/80 mb-4 tracking-wider uppercase">
            Accessibility
          </h3>

          {/* Dyslexia-Friendly Font Toggle */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2 text-sm text-white/70">
              <Type size={16} />
              <span>Dyslexia Mode</span>
            </div>
            <button
              id="toggle-dyslexic-mode"
              onClick={() => setDyslexicMode(!dyslexicMode)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
                dyslexicMode ? "bg-purple-500" : "bg-white/20"
              }`}
              aria-label="Toggle Dyslexia Mode"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${
                  dyslexicMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Line Height Slider */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <ALargeSmall size={16} />
                <span>Line Height</span>
              </div>
              <span className="text-xs text-purple-300 font-mono">
                {lineHeight.toFixed(1)}
              </span>
            </div>
            <input
              id="line-height-slider"
              type="range"
              min="1.2"
              max="3.0"
              step="0.1"
              value={lineHeight}
              onChange={handleLineHeightChange}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #7c3aed ${
                  ((lineHeight - 1.2) / 1.8) * 100
                }%, rgba(255,255,255,0.15) ${
                  ((lineHeight - 1.2) / 1.8) * 100
                }%)`,
              }}
              aria-label="Adjust Line Height"
            />
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        id="accessibility-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 pulse-glow"
        style={{
          background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
        }}
        aria-label="Accessibility Settings"
      >
        {isExpanded ? (
          <Eye size={22} className="text-white" />
        ) : (
          <SlidersHorizontal size={22} className="text-white" />
        )}
      </button>
    </div>
  );
}
