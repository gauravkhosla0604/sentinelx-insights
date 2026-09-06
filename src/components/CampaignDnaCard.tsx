'use client';

import React, { useState } from 'react';
import { CampaignDnaResult } from '@/types';
import {
  Dna,
  Network,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  GitBranch,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CampaignDnaCardProps {
  campaign: CampaignDnaResult;
  onViewGraph?: () => void;
}

export const CampaignDnaCard: React.FC<CampaignDnaCardProps> = ({
  campaign,
  onViewGraph,
}) => {
  const [showAllIncidents, setShowAllIncidents] = useState(false);

  if (!campaign.matchedCampaign) {
    return (
      <div className="bg-cyber-panel border border-cyber-border rounded-xl p-4.5 shadow-panel">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyber-surface border border-cyber-border text-cyber-textMuted">
            <Dna className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-cyber-textPrimary font-mono">
              Campaign DNA: Zero Historical Attribution
            </h4>
            <p className="text-[11px] text-cyber-textMuted mt-0.5 font-sans">
              Current email infrastructure does not exhibit significant overlap with known historical attack clusters.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const {
    matchedCampaign,
    campaignName,
    matchPercentage,
    relatedIncidents,
    relatedIncidentsCount,
    matchReasons,
    attackType,
    impersonatedBrand,
    statusNote,
  } = campaign;

  const displayedIncidents = showAllIncidents
    ? relatedIncidents
    : relatedIncidents.slice(0, 3);

  // Footprint aggregated from the correlated historical incident records only.
  const uniq = (values: string[]) => new Set(values.filter(Boolean)).size;
  const footprint = {
    domains: uniq(
      relatedIncidents.flatMap((m) => [m.incident.senderDomain, ...m.incident.urlDomains]),
    ),
    ips: uniq(relatedIncidents.flatMap((m) => m.incident.ips)),
    urls: uniq(relatedIncidents.flatMap((m) => m.incident.urls)),
  };

  type Level = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  const level = (hits: number): Level => {
    if (hits === 0) return 'NONE';
    if (relatedIncidents.length === 0) return 'LOW';
    const ratio = hits / relatedIncidents.length;
    return ratio >= 0.66 ? 'HIGH' : ratio >= 0.33 ? 'MEDIUM' : 'LOW';
  };

  const ipHits = relatedIncidents.filter((m) => m.sharedIps.length > 0);
  const urlHits = relatedIncidents.filter((m) => m.sharedUrlDomains.length > 0);
  const senderHits = relatedIncidents.filter((m) => m.sharedSenderDomain);
  const replyHits = relatedIncidents.filter((m) => m.sharedReplyToDomain);
  const brandHits = relatedIncidents.filter((m) => m.sharedBrand);

  const dimensions: Array<{ label: string; level: Level; detail: string }> = [
    {
      label: 'Sending infrastructure (IP)',
      level: level(ipHits.length),
      detail: ipHits.length
        ? `Shared relays: ${Array.from(new Set(ipHits.flatMap((m) => m.sharedIps))).join(', ')}`
        : 'No relay IP overlap with historical incidents',
    },
    {
      label: 'URL / hosting domains',
      level: level(urlHits.length),
      detail: urlHits.length
        ? `Shared domains: ${Array.from(new Set(urlHits.flatMap((m) => m.sharedUrlDomains))).join(', ')}`
        : 'No link infrastructure overlap',
    },
    {
      label: 'Sender domain pattern',
      level: level(senderHits.length),
      detail: senderHits.length
        ? `${senderHits.length} incident(s) sent from the same domain`
        : 'Sender domain not previously observed',
    },
    {
      label: 'Reply-To collection point',
      level: level(replyHits.length),
      detail: replyHits.length
        ? `${replyHits.length} incident(s) route replies to the same domain`
        : 'No shared reply collection domain',
    },
    {
      label: 'Impersonated brand / intent',
      level: level(brandHits.length),
      detail: brandHits.length
        ? `${impersonatedBrand} impersonated in ${brandHits.length} related incident(s)`
        : 'No shared impersonation target',
    },
    {
      label: 'Attack language similarity',
      level: level(
        relatedIncidents.filter((m) =>
          m.reasons.some((r) => /lure|language|subject|lexical|pattern/i.test(r)),
        ).length,
      ),
      detail: 'Derived from lure/subject similarity reasons recorded by the correlation engine',
    },
  ];


  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="corner-bracket bg-cyber-panel border border-cyber-border rounded-xl p-5 sm:p-6 shadow-panel space-y-4.5 relative overflow-hidden backdrop-blur-md"
    >
      {/* Background ambient spotlight */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyber-emerald/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner: Header + DNA Match Metric */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyber-border/80 pb-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyber-panel to-cyber-surface border border-cyber-emerald/40 text-cyber-emerald shadow-glowEmeraldSm shrink-0">
            <Dna className="w-6 h-6 animate-pulseSlow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded bg-cyber-emeraldDark/40 text-cyber-emeraldBright font-bold border border-cyber-emerald/50 shadow-glowEmeraldSm">
                Campaign DNA Match: {matchPercentage}%
              </span>
              <span className="text-xs font-mono text-cyber-textSecondary">
                Possible Campaign: <strong className="text-cyber-textPrimary">{matchedCampaign}</strong>
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-cyber-textPrimary mt-1 font-sans">
              {campaignName}
            </h3>
            <p className="text-xs text-cyber-textMuted mt-0.5 font-sans">
              {statusNote}
            </p>
          </div>
        </div>

        {/* Quick Campaign Stats */}
        <div className="flex items-center gap-3.5 bg-cyber-surface/90 px-3.5 py-2 rounded-lg border border-cyber-border shrink-0 font-mono text-xs">
          <div>
            <span className="text-cyber-textDim uppercase block text-[9px]">Linked Cases</span>
            <span className="text-cyber-textPrimary font-bold text-sm">
              {relatedIncidentsCount} Incidents
            </span>
          </div>
          <div className="h-6 w-px bg-cyber-border" />
          <div>
            <span className="text-cyber-textDim uppercase block text-[9px]">Target Brand</span>
            <span className="text-cyber-emeraldBright font-bold text-sm">
              {impersonatedBrand}
            </span>
          </div>
        </div>
      </div>

      {/* Campaign footprint — aggregated strictly from correlated incident records */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
        {[
          { label: 'Previous Incidents', value: relatedIncidentsCount, tone: 'text-cyber-textPrimary' },
          { label: 'Domains', value: footprint.domains, tone: 'text-cyber-amberBright' },
          { label: 'IPs', value: footprint.ips, tone: 'text-cyber-crimsonBright' },
          { label: 'URLs', value: footprint.urls, tone: 'text-cyber-tealBright' },
        ].map((tile) => (
          <div key={tile.label} className="bg-cyber-surface/90 border border-cyber-border rounded-md px-3 py-2">
            <span className="block text-[9px] uppercase text-cyber-textDim">{tile.label}</span>
            <span className={`font-bold text-sm ${tile.tone}`}>{tile.value}</span>
          </div>
        ))}
      </div>

      {/* Similarity dimensions */}
      <div>
        <h5 className="text-xs font-mono uppercase tracking-wider text-cyber-textSecondary font-semibold mb-2.5 flex items-center gap-2">
          <GitBranch className="w-3.5 h-3.5 text-cyber-emerald" />
          Campaign Similarity Dimensions
        </h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs font-mono">
          {dimensions.map((dim) => (
            <div
              key={dim.label}
              className="bg-cyber-surface/80 border border-cyber-border rounded-md px-3 py-2 flex items-start justify-between gap-2"
            >
              <div className="min-w-0">
                <span className="block text-cyber-textPrimary font-semibold">{dim.label}</span>
                <span className="block text-[10px] text-cyber-textMuted truncate">{dim.detail}</span>
              </div>
              <span
                className={`shrink-0 px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${
                  dim.level === 'HIGH'
                    ? 'bg-cyber-emeraldDark/40 text-cyber-emeraldBright border-cyber-emerald/50'
                    : dim.level === 'MEDIUM'
                    ? 'bg-cyber-amberDark/30 text-cyber-amberBright border-cyber-amber/50'
                    : dim.level === 'LOW'
                    ? 'bg-cyber-panel text-cyber-textSecondary border-cyber-border'
                    : 'bg-cyber-panel text-cyber-textDim border-cyber-border'
                }`}
              >
                {dim.level === 'NONE' ? 'No overlap' : dim.level}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Correlation Indicators */}
      <div>
        <h5 className="text-xs font-mono uppercase tracking-wider text-cyber-textSecondary font-semibold mb-2.5 flex items-center gap-2">
          <GitBranch className="w-3.5 h-3.5 text-cyber-emerald" />
          Shared Infrastructure & Genetic Attribution Overlap
        </h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
          {matchReasons.map((reason, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 bg-cyber-surface/80 border border-cyber-border px-3 py-2 rounded-md text-cyber-textPrimary"
            >
              <CheckCircle2 className="w-4 h-4 text-cyber-emerald shrink-0" />
              <span className="truncate">{reason}</span>
            </div>
          ))}
        </div>
      </div>


      {/* Correlated Cases Table */}
      <div className="pt-3.5 border-t border-cyber-border/80">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono uppercase tracking-wider text-cyber-textSecondary font-semibold">
            Correlated Historical Incidents ({relatedIncidents.length})
          </span>

          {onViewGraph && (
            <button
              onClick={onViewGraph}
              className="inline-flex items-center gap-1.5 text-xs text-cyber-emerald hover:text-cyber-emeraldBright font-mono font-medium transition-colors"
            >
              <Network className="w-3.5 h-3.5" />
              <span>Explore in Evidence Graph</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="space-y-2">
          {displayedIncidents.map((match) => (
            <div
              key={match.incident.caseId}
              className="bg-cyber-surface/70 border border-cyber-border hover:border-cyber-borderHighlight rounded-lg p-3 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-cyber-emeraldBright">{match.incident.caseId}</span>
                  <span className="text-cyber-dim">|</span>
                  <span className="text-cyber-textMuted text-[11px]">
                    {new Date(match.incident.timestamp).toLocaleDateString()}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${
                      match.strength === 'HIGH'
                        ? 'bg-cyber-crimsonDark/30 text-cyber-crimsonBright border-cyber-crimson/50'
                        : match.strength === 'MEDIUM'
                        ? 'bg-cyber-amberDark/30 text-cyber-amberBright border-cyber-amber/50'
                        : 'bg-cyber-panel text-cyber-textMuted border-cyber-border'
                    }`}
                  >
                    {match.strength} Correlation ({match.score} pts)
                  </span>
                </div>
                <div className="text-cyber-textPrimary font-medium truncate max-w-xl font-sans text-xs">
                  {match.incident.subject}
                </div>
                <div className="text-cyber-textDim text-[11px] truncate">
                  Sender: {match.incident.senderDomain} · Relay: {match.incident.ips.join(', ')}
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] text-cyber-textSecondary block">
                  {match.reasons[0] || 'Infrastructure match'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {relatedIncidents.length > 3 && (
          <button
            onClick={() => setShowAllIncidents(!showAllIncidents)}
            className="mt-3 text-xs font-mono text-cyber-textMuted hover:text-cyber-textPrimary flex items-center gap-1 transition-colors mx-auto"
          >
            {showAllIncidents ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Show Fewer Cases</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Show All {relatedIncidents.length} Related Incidents</span>
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
};
