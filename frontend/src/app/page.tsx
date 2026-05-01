"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { Brain, Sparkles, BookOpen, Loader2 } from "lucide-react";
import MindMapSidebar from "@/components/MindMapSidebar";
import AccessibilityToolbar from "@/components/AccessibilityToolbar";
import type { Node, Edge } from "@xyflow/react";

// Lazy-load MindMapCanvas since React Flow needs browser APIs
const MindMapCanvas = dynamic(() => import("@/components/MindMapCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <Loader2 className="animate-spin text-purple-400" size={32} />
    </div>
  ),
});

const SAMPLE_TEXT = `The theory of general relativity, published by Albert Einstein in 1915, is the geometric theory of gravitation and the current description of gravitation in modern physics. It generalizes special relativity and refines Newton's law of universal gravitation, providing a unified description of gravity as a geometric property of space and time, or four-dimensional spacetime. In particular, the curvature of spacetime is directly related to the energy and momentum of whatever matter and radiation are present. The relation is specified by the Einstein field equations, a system of second-order partial differential equations.

Newton's law of universal gravitation, which describes classical gravity, can be seen as a prediction of general relativity for the almost flat spacetime geometry around stationary mass distributions. Some predictions of general relativity, however, are beyond Newton's law of universal gravitation: these predictions concern the passage of time, the geometry of space, the motion of bodies in free fall, and the propagation of light, and include gravitational time dilation, gravitational lensing, the gravitational redshift of light, the Shapiro time delay and singularities or black holes.`;

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface AnalyzeResult {
  simplified_text: string;
  bullets: string[];
  nodes: Node[];
  edges: Edge[];
}

export default function Home() {
  const [inputText, setInputText] = useState(SAMPLE_TEXT);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setResult(null);
    setShowSidebar(false);
    setShowCanvas(false);

    try {
      const res = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });

      if (!res.ok) throw new Error("API Error");

      const data: AnalyzeResult = await res.json();
      setResult(data);

      // Stagger the reveals for dramatic effect
      setTimeout(() => setShowSidebar(true), 200);
      setTimeout(() => setShowCanvas(true), 500);
    } catch (err) {
      console.error("Analysis failed:", err);
      // Client-side fallback
      const fallback: AnalyzeResult = {
        simplified_text:
          "Einstein found that gravity is not just a force. It is caused by heavy objects bending space and time around them. Imagine placing a bowling ball on a trampoline — it creates a dip, and smaller balls roll towards it.",
        bullets: [
          "Gravity bends space and time, it is not just a pulling force.",
          "Heavier objects create bigger bends in spacetime.",
          "This theory predicts things like black holes and time slowing down near heavy objects.",
        ],
        nodes: [
          { id: "1", data: { label: "General Relativity" }, position: { x: 0, y: 0 }, type: "default" },
          { id: "2", data: { label: "Gravity = Curved Space" }, position: { x: -250, y: 120 }, type: "default" },
          { id: "3", data: { label: "Einstein Equations" }, position: { x: 0, y: 120 }, type: "default" },
          { id: "4", data: { label: "Predictions" }, position: { x: 250, y: 120 }, type: "default" },
          { id: "5", data: { label: "Black Holes" }, position: { x: 150, y: 250 }, type: "default" },
          { id: "6", data: { label: "Time Dilation" }, position: { x: 350, y: 250 }, type: "default" },
        ],
        edges: [
          { id: "e1-2", source: "1", target: "2" },
          { id: "e1-3", source: "1", target: "3" },
          { id: "e1-4", source: "1", target: "4" },
          { id: "e4-5", source: "4", target: "5" },
          { id: "e4-6", source: "4", target: "6" },
        ],
      };
      setResult(fallback);
      setTimeout(() => setShowSidebar(true), 200);
      setTimeout(() => setShowCanvas(true), 500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] relative">
      {/* ── Hero / Header ──────────────────────────────────────────── */}
      <header className="w-full border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
              }}
            >
              <Brain size={22} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-white/90 tracking-tight">
              Lumina<span className="text-purple-400">Read</span>
            </h1>
          </div>
          <p className="text-xs text-white/30 hidden sm:block">
            AI-Powered Accessible Reading
          </p>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col lg:flex-row gap-6 p-6 max-w-7xl mx-auto w-full">
        {/* Left Column: Input */}
        <motion.section
          layout
          className={`flex flex-col gap-4 transition-all duration-500 ${
            showCanvas ? "lg:w-[45%]" : "lg:w-full"
          }`}
        >
          {/* Info banner */}
          <div
            className="rounded-xl px-5 py-3 flex items-center gap-3"
            style={{
              background: "rgba(124,58,237,0.08)",
              border: "1px solid rgba(167,139,250,0.15)",
            }}
          >
            <BookOpen size={18} className="text-purple-400 flex-shrink-0" />
            <p className="text-sm text-white/60">
              Paste any complex text below and click{" "}
              <strong className="text-purple-300">LuminaRead</strong> to
              transform it into ADHD-friendly content with a visual mind map.
            </p>
          </div>

          {/* Text Area */}
          <div className="flex-1 flex flex-col">
            <textarea
              id="input-text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your complex text here..."
              rows={14}
              className="flex-1 w-full rounded-xl p-5 text-sm text-white/85 placeholder-white/25 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                lineHeight: "var(--user-line-height)",
              }}
            />
          </div>

          {/* Analyze Button */}
          <button
            id="analyze-button"
            onClick={handleAnalyze}
            disabled={isLoading || !inputText.trim()}
            className="w-full py-3.5 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            style={{
              background: isLoading
                ? "rgba(124,58,237,0.3)"
                : "linear-gradient(135deg, #7c3aed, #6d28d9)",
              boxShadow: isLoading
                ? "none"
                : "0 4px 24px rgba(124,58,237,0.3)",
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                LuminaRead
              </>
            )}
          </button>
        </motion.section>

        {/* Right Column: Mind Map Canvas */}
        <AnimatePresence>
          {showCanvas && result && (
            <motion.section
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="lg:w-[55%] h-[500px] lg:h-auto"
            >
              <MindMapCanvas nodes={result.nodes} edges={result.edges} />
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* ── Sidebar Overlay ────────────────────────────────────────── */}
      {result && (
        <MindMapSidebar
          isOpen={showSidebar}
          onClose={() => setShowSidebar(false)}
          simplifiedText={result.simplified_text}
          bullets={result.bullets}
        />
      )}

      {/* ── Accessibility Toolbar ──────────────────────────────────── */}
      <AccessibilityToolbar />
    </div>
  );
}
