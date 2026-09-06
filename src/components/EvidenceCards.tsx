'use client';

import React, { useState } from 'react';
import { ThreatFactor } from '@/types';
import {
  ShieldAlert,
  AlertTriangle,
  FileSearch,
  Globe,
  Link,
  MessageSquareWarning,
  CheckCircle2,
  Terminal,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EvidenceCardsProps {
  factors: ThreatFactor[];
}

export const EvidenceCards: React.FC<EvidenceCardsProps> = ({ factors }) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const triggeredFactors = factors.filter((f) => f.triggered);

  const filtered = activeFilter === 'all'
    ? triggeredFactors
    : triggeredFactors.filter((f) => f.category === activeFilter);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'authentication':
        return <ShieldAlert className="w-4 h-4 text-cyber-crimsonBright" />;
      case 'domain':
        return <Globe className="w-4 h-4 text-cyber-amberBright" />;
      case 'url':
        return <Link className="w-4 h-4 text-cyber-tealBright" />;
      case 'content':
        return <MessageSquareWarning className="w-4 h-4 text-cyber-violet" />;
      default:
        return <FileSearch className="w-4 h-4 text-cyber-emerald" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-cyber-crimsonDark/30 text-cyber-crimsonBright border border-cyber-crimson/60 shadow-glowCrimsonSm">
            CRITICAL
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-cyber-amberDark/30 text-cyber-amberBright border border-cyber-amber/60">
            HIGH
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-cyber-amber/10 text-cyber-amber border border-cyber-amber/40">
            MEDIUM
          </span>
        );
      case 'low':
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-cyber-surface text-cyber-textMuted border border-cyber-border">
            LOW
          </span>
        );
    }
  };

  if (triggeredFactors.length === 0) {
    return (
      <div className="bg-cyber-panel border border-cyber-border rounded-xl p-8 text-center shadow-panel">
        <CheckCircle2 className="w-10 h-10 text-cyber-emerald mx-auto mb-3" />
        <h4 className="text-sm font-semibold text-cyber-textPrimary">No indicator cards</h4>
        <p className="text-xs text-cyber-textMuted mt-1 max-w-sm mx-auto font-sans">
          No scoring rules were triggered by this artifact. Insufficient evidence of malicious intent.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyber-border/80 pb-3">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-cyber-textPrimary font-mono flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyber-emerald" />
            Evidence ({triggeredFactors.length} indicators)
          </h4>
          <p className="text-[11px] text-cyber-textMuted mt-0.5 font-sans">
            Every point contribution is strictly verifiable and mapped to raw extracted RFC telemetry.
          </p>
        </div>

        {/* Filter Navigation */}
        <div className="flex items-center gap-1 bg-cyber-surface/90 p-1 rounded-lg border border-cyber-border text-xs font-mono">
          {['all', 'authentication', 'domain', 'url', 'content'].map((filterKey) => (
            <button
              key={filterKey}
              onClick={() => setActiveFilter(filterKey)}
              className={`px-2.5 py-1 rounded-md transition-all duration-150 capitalize ${
                activeFilter === filterKey
                  ? 'bg-cyber-panel text-cyber-emeraldBright font-bold border border-cyber-emerald/50 shadow-glowEmeraldSm'
                  : 'text-cyber-textMuted hover:text-cyber-textPrimary'
              }`}
            >
              {filterKey === 'all' ? `All (${triggeredFactors.length})` : filterKey.slice(0, 4)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Evidence Cards */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <AnimatePresence>
          {filtered.map((factor) => (
            <motion.div
              key={factor.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="group bg-cyber-panel border border-cyber-border hover:border-cyber-emerald/50 rounded-xl p-4.5 transition-all duration-200 flex flex-col justify-between shadow-panel hover:shadow-panelHover"
            >
              <div>
                {/* Card Top: Category, Title, Points, Severity */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-cyber-surface border border-cyber-border group-hover:border-cyber-borderHighlight transition-colors">
                      {getCategoryIcon(factor.category)}
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-cyber-textPrimary leading-snug font-sans group-hover:text-cyber-emeraldBright transition-colors">
                        {factor.title}
                      </h5>
                      <span className="text-[10px] font-mono text-cyber-textDim uppercase tracking-wider">
                        Vector: {factor.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {getSeverityBadge(factor.severity)}
                    <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-cyber-crimsonDark/30 text-cyber-crimsonBright border border-cyber-crimson/50">
                      +{factor.points} PTS
                    </span>
                  </div>
                </div>

                {/* Verifiable Technical Artifact Box */}
                <div className="mt-3 bg-cyber-black/90 border border-cyber-border rounded-lg p-2.5 font-mono text-xs text-cyber-textPrimary break-all select-all">
                  <span className="text-[10px] text-cyber-emerald block uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyber-emerald" />
                    Forensic Telemetry Artifact:
                  </span>
                  {factor.evidence}
                </div>

                {/* Rationale / Explanation */}
                <p className="mt-3 text-xs text-cyber-textSecondary leading-relaxed font-sans">
                  <strong className="text-cyber-textPrimary font-semibold">SOC Analysis:</strong> {factor.explanation}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
