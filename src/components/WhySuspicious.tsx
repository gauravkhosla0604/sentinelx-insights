"use client";

import React from "react";
import { HelpCircle } from "lucide-react";
import type { ParsedEmailData, ThreatAnalysis, ThreatSeverity } from "@/types";

interface WhySuspiciousProps {
  email: ParsedEmailData;
  threat: ThreatAnalysis;
}

const SEV_ORDER: Record<ThreatSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
};

function sevLabel(s: ThreatSeverity) {
  if (s === "critical") return "CRITICAL";
  if (s === "high") return "HIGH";
  if (s === "medium") return "MEDIUM";
  if (s === "low") return "LOW";
  return "INFO";
}

function sevStyle(s: ThreatSeverity) {
  switch (s) {
    case "critical":
      return "border-cyber-crimson/50 bg-cyber-crimsonDark/20 shadow-glowCrimsonSm";
    case "high":
      return "border-cyber-crimson/35 bg-cyber-crimsonDark/10";
    case "medium":
      return "border-cyber-amber/40 bg-cyber-amber/5";
    default:
      return "border-cyber-border bg-cyber-surface/80";
  }
}

function sevDot(s: ThreatSeverity) {
  if (s === "critical" || s === "high") return "bg-cyber-crimsonBright";
  if (s === "medium") return "bg-cyber-amberBright";
  return "bg-cyber-teal";
}

export const WhySuspicious: React.FC<WhySuspiciousProps> = ({ email, threat }) => {
  const findings = [...threat.factors.filter((f) => f.triggered)].sort(
    (a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity] || b.points - a.points,
  );

  if (email.attachments.length > 0 && !findings.some((f) => f.id === "attachment")) {
    findings.push({
      id: "attachment",
      title: "Attachment present",
      category: "content",
      points: 0,
      triggered: true,
      severity: "medium",
      evidence: email.attachments.map((a) => `${a.filename} (${a.contentType || "type unknown"})`).join(", "),
      explanation: "The message includes attachments. Treat them as untrusted until independently verified.",
    });
  }

  return (
    <section className="rounded-2xl border border-cyber-border bg-cyber-panel/80 backdrop-blur-md p-5 sm:p-6 shadow-panel">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-cyber-textPrimary uppercase">
            <HelpCircle className="h-4 w-4 text-cyber-emerald" />
            Why is this suspicious?
          </h2>
          <p className="mt-1 text-xs text-cyber-textSecondary">
            Strongest indicators from this artifact. Nothing here is invented.
          </p>
        </div>
        <span className="shrink-0 rounded-md border border-cyber-border bg-cyber-surface px-2 py-1 font-mono text-[10px] uppercase text-cyber-textMuted">
          {findings.length} indicator{findings.length === 1 ? "" : "s"}
        </span>
      </div>

      {findings.length === 0 ? (
        <p className="rounded-lg border border-cyber-border bg-cyber-surface/60 px-4 py-6 text-center text-sm text-cyber-textMuted">
          No high-signal indicators were triggered. Insufficient evidence of malicious intent.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {findings.map((f) => (
            <li
              key={f.id}
              className={`rounded-xl border px-4 py-3 ${sevStyle(f.severity)}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${sevDot(f.severity)}`} />
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-cyber-textMuted">
                  {sevLabel(f.severity)}
                </span>
                <span className="text-sm font-semibold text-cyber-textPrimary">{f.title}</span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-cyber-textSecondary">{f.explanation}</p>
              <p className="mt-2 break-all font-mono text-[11px] text-cyber-textMuted">
                <span className="uppercase tracking-wider text-cyber-textDim">Evidence · </span>
                {f.evidence || "Not available"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
