'use client';

import React from 'react';
import { ParsedEmailData, ThreatAnalysis, CampaignDnaResult, HistoricalIncident } from '@/types';
import {
  GitCommit,
  Clock,
  Terminal,
  Radio,
  ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AttackStoryProps {
  email: ParsedEmailData;
  threat: ThreatAnalysis;
  campaign: CampaignDnaResult;
}

interface StoryEvent {
  id: string;
  timeStr: string;
  dateStr: string;
  timestamp: number;
  stage: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  indicators: string[];
  isCurrent?: boolean;
}

export const AttackStory: React.FC<AttackStoryProps> = ({
  email,
  threat,
  campaign,
}) => {
  const events: StoryEvent[] = [];

  const parseTime = (isoString?: string | null): { timeStr: string; dateStr: string; timestamp: number } => {
    if (!isoString) {
      const now = new Date();
      return {
        timeStr: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dateStr: now.toLocaleDateString(),
        timestamp: now.getTime(),
      };
    }
    const d = new Date(isoString);
    return {
      timeStr: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dateStr: d.toLocaleDateString(),
      timestamp: d.getTime(),
    };
  };

  // 1. Historical incidents
  const incidentList: HistoricalIncident[] = campaign.relatedIncidents.map((m) => m.incident);

  const sortedIncidents = [...incidentList].sort((a, b) => {
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });

  const seenDomains = new Set<string>();
  const seenIps = new Set<string>();

  sortedIncidents.forEach((inc, idx) => {
    const { timeStr, dateStr, timestamp } = parseTime(inc.timestamp);
    const isNewDomain = !seenDomains.has(inc.senderDomain);
    const isNewIp = inc.ips.some((ip) => !seenIps.has(ip));

    seenDomains.add(inc.senderDomain);
    inc.ips.forEach((ip) => seenIps.add(ip));

    let stage = 'Phase 1: Initial Infiltration Wave';
    let title = `Initial Reconnaissance: ${inc.subject}`;
    let severity: StoryEvent['severity'] = 'INFO';

    if (idx === 0) {
      stage = 'Phase 1: Earliest Observed Infiltration';
      title = `Earliest Recorded Activity (${inc.caseId})`;
      severity = 'MEDIUM';
    } else if (isNewDomain) {
      stage = 'Phase 2: Domain Infrastructure Shift';
      title = `Secondary Domain Dispatched (${inc.senderDomain})`;
      severity = 'HIGH';
    } else if (isNewIp) {
      stage = 'Phase 3: Relay Infrastructure Expansion';
      title = `Secondary Relay Deployed (${inc.ips.join(', ')})`;
      severity = 'HIGH';
    } else {
      stage = 'Phase 3: Coordinated Distribution Wave';
      title = `Follow-Up Credential Lure (${inc.caseId})`;
      severity = 'HIGH';
    }

    events.push({
      id: inc.caseId,
      timeStr,
      dateStr,
      timestamp,
      stage,
      title,
      description: `${inc.bodyExcerpt} Dispatched to internal mailboxes via ${inc.senderDomain}.`,
      severity,
      indicators: [
        `Case: ${inc.caseId}`,
        `Sender: ${inc.senderDomain}`,
        `Relay IP: ${inc.ips.join(', ')}`,
      ],
      isCurrent: false,
    });
  });

  // 2. Campaign Convergence Event
  if (events.length > 1 && campaign.matchedCampaign) {
    const middleTimestamp = events[events.length - 1].timestamp - 1800000;
    const midDate = new Date(middleTimestamp);
    events.push({
      id: 'event-correlation',
      timeStr: midDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dateStr: midDate.toLocaleDateString(),
      timestamp: middleTimestamp,
      stage: 'Phase 4: Campaign DNA Correlation',
      title: `Campaign Convergence (${campaign.matchedCampaign})`,
      description: `SentinelX automated heuristic matching correlated ${campaign.relatedIncidentsCount} connected incidents sharing identical relay IPs and credential harvest URLs with ${campaign.matchPercentage}% DNA confidence.`,
      severity: 'HIGH',
      indicators: [
        `Cluster: ${campaign.matchedCampaign}`,
        `Overlap: ${campaign.matchPercentage}% DNA`,
        `Cases Linked: ${campaign.relatedIncidentsCount}`,
      ],
      isCurrent: false,
    });
  }

  // 3. Current Email Event
  const currentTiming = parseTime(email.date);
  events.push({
    id: 'event-current',
    timeStr: currentTiming.timeStr,
    dateStr: currentTiming.dateStr,
    timestamp: currentTiming.timestamp,
    stage: 'Phase 5: High-Urgency Active Attack Wave',
    title: `Active Infiltration Incident [CURRENT CASE]`,
    description: `Targeted credential phishing attempt: "${email.subject}". Authentication failed across SPF/DKIM/DMARC with direct routing to lookalike credential portal.`,
    severity: 'CRITICAL',
    indicators: [
      `Threat Score: ${threat.score}/100 [${threat.level}]`,
      `From: ${email.from.address}`,
      `Brand: ${campaign.impersonatedBrand}`,
    ],
    isCurrent: true,
  });

  events.sort((a, b) => a.timestamp - b.timestamp);

  const getSeverityBadge = (severity: StoryEvent['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 text-[10px] uppercase font-mono font-bold rounded bg-cyber-crimsonDark/30 text-cyber-crimsonBright border border-cyber-crimson/60 shadow-glowCrimsonSm">
            CRITICAL ESCALATION
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 text-[10px] uppercase font-mono font-bold rounded bg-cyber-amberDark/30 text-cyber-amberBright border border-cyber-amber/60">
            HIGH SEVERITY
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 text-[10px] uppercase font-mono font-bold rounded bg-cyber-amber/10 text-cyber-amber border border-cyber-amber/40">
            ELEVATED RISK
          </span>
        );
      case 'INFO':
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] uppercase font-mono font-bold rounded bg-cyber-surface text-cyber-textMuted border border-cyber-border">
            OBSERVATION
          </span>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Title & Subtitle Banner */}
      <div className="corner-bracket bg-cyber-panel border border-cyber-border rounded-xl p-5 sm:p-6 shadow-panel">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyber-border/80 pb-3 mb-3.5">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyber-textPrimary font-mono flex items-center gap-2">
              <GitCommit className="w-4 h-4 text-cyber-emerald" />
              Attack Story & Chronological Evolution
            </h3>
            <p className="text-xs text-cyber-textSecondary mt-0.5 font-sans">
              “How this campaign evolved” — Synthesized timeline tracing multi-wave campaign progression from {events.length} correlated events.
            </p>
          </div>

          <div className="text-xs font-mono text-cyber-textMuted">
            Cluster: <strong className="text-cyber-emeraldBright">{campaign.matchedCampaign || 'Independent Incident'}</strong>
          </div>
        </div>

        <p className="text-xs text-cyber-textSecondary leading-relaxed font-sans">
          Adversaries rarely send a single isolated email. SentinelX traverses historical incident records to synthesize the complete chronological timeline from initial infrastructure staging to the current active spear-phishing wave.
        </p>
      </div>

      {/* Vertical Chronological Timeline */}
      <div className="relative pl-6 sm:pl-8 border-l-2 border-cyber-border ml-3 sm:ml-6 space-y-7 my-5">
        {events.map((evt) => (
          <div key={evt.id} className="relative group">
            {/* Timeline Marker Dot */}
            <div
              className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center bg-cyber-black ${
                evt.isCurrent
                  ? 'border-cyber-crimsonBright ring-4 ring-cyber-crimson/30 shadow-glowCrimson'
                  : evt.severity === 'CRITICAL'
                  ? 'border-cyber-crimson'
                  : evt.severity === 'HIGH'
                  ? 'border-cyber-amber'
                  : 'border-cyber-emerald'
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  evt.isCurrent
                    ? 'bg-cyber-crimsonBright animate-ping'
                    : evt.severity === 'CRITICAL'
                    ? 'bg-cyber-crimson'
                    : evt.severity === 'HIGH'
                    ? 'bg-cyber-amber'
                    : 'bg-cyber-emerald'
                }`}
              />
            </div>

            {/* Event Card */}
            <div
              className={`p-4 sm:p-5 rounded-xl border transition-all duration-200 shadow-panel ${
                evt.isCurrent
                  ? 'bg-cyber-crimsonDark/20 border-cyber-crimson/70 shadow-glowCrimsonSm'
                  : 'bg-cyber-panel border-cyber-border hover:border-cyber-borderHighlight'
              }`}
            >
              {/* Event Header: Time, Stage, Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 font-mono text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1.5 text-cyber-textMuted font-semibold text-xs">
                    <Clock className="w-3.5 h-3.5 text-cyber-emerald" />
                    {evt.dateStr} · {evt.timeStr}
                  </span>
                  <span className="text-cyber-dim">|</span>
                  <span className="text-cyber-emeraldBright font-semibold text-xs">{evt.stage}</span>
                </div>
                <div>{getSeverityBadge(evt.severity)}</div>
              </div>

              {/* Event Title */}
              <h4 className="text-sm sm:text-base font-bold text-cyber-textPrimary font-sans mb-1.5">
                {evt.title}
              </h4>

              {/* Event Description */}
              <p className="text-xs text-cyber-textSecondary leading-relaxed font-sans mb-3">
                {evt.description}
              </p>

              {/* Indicators Chips */}
              <div className="flex items-center gap-2 flex-wrap font-mono text-[11px]">
                {evt.indicators.map((ind, indIdx) => (
                  <span
                    key={indIdx}
                    className="px-2.5 py-1 rounded bg-cyber-surface border border-cyber-border text-cyber-textSecondary select-all"
                  >
                    {ind}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
