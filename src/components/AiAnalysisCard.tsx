'use client';

import React from 'react';
import { AiAnalysisResult } from '@/types';
import { BrainCircuit, CheckCircle2, Terminal, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface AiAnalysisCardProps {
  ai: AiAnalysisResult;
}

export const AiAnalysisCard: React.FC<AiAnalysisCardProps> = ({ ai }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="corner-bracket bg-cyber-panel border border-cyber-border rounded-xl p-5 sm:p-6 shadow-panel space-y-4 relative overflow-hidden backdrop-blur-md"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-cyber-border/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyber-violetDim text-cyber-violet border border-cyber-violet/40">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyber-textPrimary font-mono flex items-center gap-2">
              Semantic Narrative & Psychological Profiling
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-violet" />
            </h4>
            <span className="text-[10px] text-cyber-textMuted font-mono">
              Engine: {ai.modelUsed}
            </span>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-cyber-surface border border-cyber-border text-cyber-textSecondary">
          “Rules provide evidence. AI provides interpretation.”
        </span>
      </div>

      {/* Synthesis Summary */}
      <div className="bg-cyber-surface/90 p-3.5 rounded-lg border border-cyber-border/90">
        <span className="text-[10px] text-cyber-emeraldBright uppercase font-mono font-bold block mb-1 tracking-wider">
          Executive Threat Synthesis
        </span>
        <p className="text-xs text-cyber-textPrimary leading-relaxed font-sans">
          {ai.summary}
        </p>
      </div>

      {/* Social Engineering Vectors */}
      <div>
        <span className="text-[11px] text-cyber-textSecondary uppercase font-mono block mb-2 font-semibold">
          Psychological Coercion & Urgency Vectors ({ai.socialEngineeringSignals.length})
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
          {ai.socialEngineeringSignals.map((signal, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 bg-cyber-surface/70 border border-cyber-border p-2.5 rounded-md text-cyber-textPrimary"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-cyber-amber shrink-0 mt-0.5" />
              <span className="text-xs">{signal}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
