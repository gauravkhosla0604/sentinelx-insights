'use client';

import React from 'react';
import { ThreatAnalysis, CampaignDnaResult, ThreatSeverity } from '@/types';
import { ShieldAlert, AlertTriangle, ShieldCheck, Activity, Target, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ThreatScoreWidgetProps {
  threat: ThreatAnalysis;
  campaign?: CampaignDnaResult | null;
}

function severityTheme(severity: ThreatSeverity) {
  switch (severity) {
    case 'critical':
      return { text: 'text-cyber-crimsonBright', badge: 'bg-cyber-crimsonDark/30 border-cyber-crimson/70 text-cyber-crimsonBright' };
    case 'high':
      return { text: 'text-cyber-amberBright', badge: 'bg-cyber-amberDark/30 border-cyber-amber/60 text-cyber-amberBright' };
    case 'medium':
      return { text: 'text-cyber-amber', badge: 'bg-cyber-amber/10 border-cyber-amber/40 text-cyber-amber' };
    case 'low':
      return { text: 'text-cyber-tealBright', badge: 'bg-cyber-teal/10 border-cyber-teal/40 text-cyber-tealBright' };
    default:
      return { text: 'text-cyber-textSecondary', badge: 'bg-cyber-surface border-cyber-border text-cyber-textSecondary' };
  }
}

export const ThreatScoreWidget: React.FC<ThreatScoreWidgetProps> = ({
  threat,
  campaign,
}) => {
  const { score, level, breakdown, indicatorsCount } = threat;
  const triggered = threat.factors.filter((f) => f.triggered);


  const getScoreTheme = () => {
    switch (level) {
      case 'CRITICAL':
        return {
          textColor: 'text-cyber-crimsonBright',
          borderColor: 'border-cyber-crimson',
          badgeBg: 'bg-cyber-crimsonDark/30',
          badgeBorder: 'border-cyber-crimson/70',
          badgeText: 'text-cyber-crimsonBright',
          barGradient: 'from-cyber-crimson to-cyber-crimsonBright',
          glowClass: 'shadow-glowCrimson',
          ringColor: '#f43f5e',
        };
      case 'HIGH':
        return {
          textColor: 'text-cyber-amberBright',
          borderColor: 'border-cyber-amber',
          badgeBg: 'bg-cyber-amberDark/30',
          badgeBorder: 'border-cyber-amber/60',
          badgeText: 'text-cyber-amberBright',
          barGradient: 'from-cyber-amber to-cyber-amberBright',
          glowClass: 'shadow-glowAmber',
          ringColor: '#f59e0b',
        };
      case 'SUSPICIOUS':
        return {
          textColor: 'text-cyber-amber',
          borderColor: 'border-cyber-amber/60',
          badgeBg: 'bg-cyber-amber/10',
          badgeBorder: 'border-cyber-amber/40',
          badgeText: 'text-cyber-amber',
          barGradient: 'from-cyber-amber to-cyber-amberBright',
          glowClass: 'shadow-glowAmber',
          ringColor: '#f59e0b',
        };
      case 'LOW':
      default:
        return {
          textColor: 'text-cyber-emeraldBright',
          borderColor: 'border-cyber-emerald',
          badgeBg: 'bg-cyber-emeraldDark/30',
          badgeBorder: 'border-cyber-emerald/60',
          badgeText: 'text-cyber-emeraldBright',
          barGradient: 'from-cyber-emerald to-cyber-emeraldBright',
          glowClass: 'shadow-glowEmerald',
          ringColor: '#10b981',
        };
    }
  };

  const theme = getScoreTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="corner-bracket bg-cyber-panel/95 border border-cyber-border rounded-xl p-5 sm:p-6 shadow-panel space-y-5 relative overflow-hidden backdrop-blur-md"
    >
      {/* Background ambient glow behind score */}
      <div
        className="absolute -top-16 -left-16 w-56 h-56 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ backgroundColor: theme.ringColor }}
      />

      {/* Top Assessment Overview */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        {/* Left: Prominent Radial Score Centerpiece */}
        <div className="flex items-center gap-5">
          <div className="relative flex items-center justify-center shrink-0">
            {/* Circular Gauge */}
            <div
              className={`w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center ${theme.borderColor} ${theme.glowClass} bg-cyber-black/90 transition-all duration-500`}
            >
              <span className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${theme.textColor}`}>
                {score}
              </span>
              <span className="text-[10px] font-mono uppercase text-cyber-textDim tracking-widest -mt-0.5">
                / 100
              </span>
            </div>
            {/* Subtle reticle corner markings */}
            <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-cyber-emerald" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-cyber-emerald" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono uppercase tracking-wider text-cyber-textMuted flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-cyber-emerald" />
                Deterministic Scoring
              </span>
              <span
                className={`px-2.5 py-0.5 text-[11px] font-mono font-bold uppercase rounded border ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}
              >
                {level}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-cyber-textPrimary tracking-tight font-sans">
              Threat Score {score}/100
            </h3>
            <p className="text-xs text-cyber-textSecondary mt-1 max-w-lg font-sans leading-relaxed">
              Rules-based threat accumulation derived from protocol authentication failures, typo-squatting lookalikes, credential-harvesting vectors, and coercion tactics.
            </p>
          </div>
        </div>

        {/* Middle: Threat Index Progress Meter & Category Breakdown */}
        <div className="flex-1 max-w-md">
          <div className="flex justify-between items-center text-xs font-mono text-cyber-textSecondary mb-2">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyber-emerald" />
              Accumulated Threat Index
            </span>
            <span className={`font-bold font-mono ${theme.textColor}`}>{score}% Total</span>
          </div>

          {/* Meter Bar */}
          <div className="h-2 w-full bg-cyber-black rounded-full overflow-hidden p-0.5 border border-cyber-border">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(score, 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full bg-gradient-to-r ${theme.barGradient}`}
            />
          </div>

          {/* Category Contributions */}
          <div className="grid grid-cols-4 gap-2 mt-3 text-center font-mono">
            <div className="bg-cyber-surface/90 border border-cyber-border p-1.5 rounded-md">
              <span className="block text-[10px] uppercase text-cyber-textDim">Auth</span>
              <span className={`text-xs font-bold ${breakdown.authScore > 0 ? 'text-cyber-crimsonBright' : 'text-cyber-textMuted'}`}>
                +{breakdown.authScore}
              </span>
            </div>
            <div className="bg-cyber-surface/90 border border-cyber-border p-1.5 rounded-md">
              <span className="block text-[10px] uppercase text-cyber-textDim">Domain</span>
              <span className={`text-xs font-bold ${breakdown.domainScore > 0 ? 'text-cyber-amberBright' : 'text-cyber-textMuted'}`}>
                +{breakdown.domainScore}
              </span>
            </div>
            <div className="bg-cyber-surface/90 border border-cyber-border p-1.5 rounded-md">
              <span className="block text-[10px] uppercase text-cyber-textDim">URL</span>
              <span className={`text-xs font-bold ${breakdown.urlScore > 0 ? 'text-cyber-tealBright' : 'text-cyber-textMuted'}`}>
                +{breakdown.urlScore}
              </span>
            </div>
            <div className="bg-cyber-surface/90 border border-cyber-border p-1.5 rounded-md">
              <span className="block text-[10px] uppercase text-cyber-textDim">Content</span>
              <span className={`text-xs font-bold ${breakdown.contentScore > 0 ? 'text-cyber-violet' : 'text-cyber-textMuted'}`}>
                +{breakdown.contentScore}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick IOC Telemetry */}
        <div className="flex lg:flex-col justify-around lg:justify-center border-t lg:border-t-0 lg:border-l border-cyber-border/80 pt-3 lg:pt-0 lg:pl-6 gap-3 font-mono text-xs">
          <div className="text-right">
            <span className="block text-[10px] uppercase text-cyber-textDim">Extracted Indicators</span>
            <span className="text-xs font-bold text-cyber-emeraldBright">
              {indicatorsCount.ips} IPs · {indicatorsCount.domains} Doms · {indicatorsCount.urls} URLs
            </span>
          </div>
          <div className="text-right">
            <span className="block text-[10px] uppercase text-cyber-textDim">Payload Objects</span>
            <span className="text-xs text-cyber-textSecondary">
              {indicatorsCount.attachments > 0 ? `${indicatorsCount.attachments} detected` : 'Clean (No files)'}
            </span>
          </div>
        </div>
      </div>

      {/* WHY THIS SCORE? — evidence-driven contribution breakdown */}
      <div className="pt-4 border-t border-cyber-border/80 relative z-10">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-cyber-textPrimary flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-cyber-emerald" />
            Why this score?
          </h4>
          <span className="text-[10px] font-mono uppercase text-cyber-textDim">
            {triggered.length} evidence-backed factor{triggered.length === 1 ? '' : 's'} · rule-driven, not AI-generated
          </span>
        </div>

        {triggered.length === 0 ? (
          <p className="text-xs font-mono text-cyber-textMuted">
            Insufficient evidence — no scoring rule was triggered by this artifact.
          </p>
        ) : (
          <div className="space-y-1.5">
            {triggered.map((factor) => {
              const sev = severityTheme(factor.severity);
              return (
                <div
                  key={factor.id}
                  className="grid grid-cols-[54px_1fr] sm:grid-cols-[54px_1fr_92px] gap-3 items-start bg-cyber-surface/80 border border-cyber-border hover:border-cyber-borderHighlight transition-colors rounded-md px-3 py-2"
                >
                  <span className={`font-mono font-black text-sm ${sev.text}`}>+{factor.points}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-cyber-textPrimary">{factor.title}</span>
                      <span className="text-[10px] font-mono uppercase text-cyber-textDim">
                        {factor.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-cyber-textSecondary mt-0.5 leading-relaxed">
                      {factor.explanation}
                    </p>
                    <p className="text-[10px] font-mono text-cyber-textMuted mt-1 break-words">
                      <span className="text-cyber-textDim uppercase">Evidence: </span>
                      {factor.evidence}
                    </p>
                  </div>
                  <span
                    className={`hidden sm:inline-block justify-self-end px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded border ${sev.badge}`}
                  >
                    {factor.severity}
                  </span>
                </div>
              );
            })}
            <div className="flex items-center justify-between px-3 py-2 rounded-md border border-cyber-border bg-cyber-black/60 font-mono text-xs">
              <span className="uppercase tracking-widest text-cyber-textDim">Total accumulated</span>
              <span className={`font-black ${theme.textColor}`}>{score} / 100 · {level}</span>
            </div>
            {campaign?.matchedCampaign && (
              <p className="text-[10px] font-mono text-cyber-textMuted px-1 pt-1">
                Campaign correlation ({campaign.matchPercentage}% match with {campaign.matchedCampaign}) is reported
                separately as investigative context and does not inflate the rule-based score.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Six Key Overview Metric Tiles */}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-4 border-t border-cyber-border/80 font-mono text-xs relative z-10">
        <div className="bg-cyber-surface/90 p-2.5 rounded-md border border-cyber-border hover:border-cyber-borderHighlight transition-colors">
          <span className="text-[10px] uppercase text-cyber-textDim block mb-0.5">Threat Score</span>
          <span className={`font-bold ${theme.textColor}`}>{score}/100</span>
        </div>

        <div className="bg-cyber-surface/90 p-2.5 rounded-md border border-cyber-border hover:border-cyber-borderHighlight transition-colors">
          <span className="text-[10px] uppercase text-cyber-textDim block mb-0.5">Severity</span>
          <span className={`font-bold ${theme.textColor}`}>{level}</span>
        </div>

        <div className="bg-cyber-surface/90 p-2.5 rounded-md border border-cyber-border hover:border-cyber-borderHighlight transition-colors">
          <span className="text-[10px] uppercase text-cyber-textDim block mb-0.5">Attack Type</span>
          <span className="font-bold text-cyber-textPrimary truncate block">
            {campaign?.attackType || 'Credential Phishing'}
          </span>
        </div>

        <div className="bg-cyber-surface/90 p-2.5 rounded-md border border-cyber-border hover:border-cyber-borderHighlight transition-colors">
          <span className="text-[10px] uppercase text-cyber-textDim block mb-0.5">Target Brand</span>
          <span className="font-bold text-cyber-emeraldBright truncate block">
            {threat.impersonatedBrand?.brand || campaign?.impersonatedBrand || 'None'}
          </span>
        </div>

        <div className="bg-cyber-surface/90 p-2.5 rounded-md border border-cyber-border hover:border-cyber-borderHighlight transition-colors">
          <span className="text-[10px] uppercase text-cyber-textDim block mb-0.5">Campaign DNA</span>
          <span className="font-bold text-cyber-violet truncate block">
            {campaign?.matchPercentage ? `${campaign.matchPercentage}% Match` : 'N/A'}
          </span>
        </div>

        <div className="bg-cyber-surface/90 p-2.5 rounded-md border border-cyber-border hover:border-cyber-borderHighlight transition-colors">
          <span className="text-[10px] uppercase text-cyber-textDim block mb-0.5">Linked Cases</span>
          <span className="font-bold text-cyber-textPrimary truncate block">
            {campaign?.relatedIncidentsCount ? `${campaign.relatedIncidentsCount} Incidents` : '0 Cases'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
