"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, List, X } from "lucide-react";

interface MindMapSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  simplifiedText: string;
  bullets: string[];
}

export default function MindMapSidebar({
  isOpen,
  onClose,
  simplifiedText,
  bullets,
}: MindMapSidebarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          id="mind-map-sidebar"
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 260 }}
          className="fixed right-0 top-0 h-full w-[380px] z-40 flex flex-col overflow-y-auto"
          style={{
            background: "rgba(255,255,255,0.06)",
            borderLeft: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: "-8px 0 40px rgba(0,0,0,0.3)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-purple-400" />
              <h2 className="text-lg font-semibold text-white/90">
                Simplified View
              </h2>
            </div>
            <button
              id="close-sidebar"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Close Sidebar"
            >
              <X size={16} className="text-white/70" />
            </button>
          </div>

          {/* Simplified Text */}
          <div className="px-6 mb-6">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="rounded-xl p-4"
              style={{
                background: "rgba(124,58,237,0.08)",
                border: "1px solid rgba(167,139,250,0.18)",
              }}
            >
              <p className="text-sm text-white/80 leading-relaxed">
                {simplifiedText}
              </p>
            </motion.div>
          </div>

          {/* Bullet Points */}
          <div className="px-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <List size={16} className="text-purple-400" />
              <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
                Key Takeaways
              </h3>
            </div>
            <ul className="space-y-3">
              {bullets.map((bullet, index) => (
                <motion.li
                  key={index}
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.25 + index * 0.1, duration: 0.4 }}
                  className="flex items-start gap-3"
                >
                  <span
                    className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5"
                    style={{
                      background: "rgba(124,58,237,0.25)",
                      color: "#a78bfa",
                    }}
                  >
                    {index + 1}
                  </span>
                  <p className="text-sm text-white/75 leading-relaxed">
                    {bullet}
                  </p>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Branding Footer */}
          <div className="mt-auto px-6 py-5 border-t border-white/5 text-center">
            <p className="text-xs text-white/30">
              Powered by <span className="text-purple-400">LuminaRead AI</span>
            </p>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
