import React, { useState } from "react";
<<<<<<< HEAD
import { FileText, Download, Printer, X, Copy, Check } from "lucide-react";

import { buildReportHtml, buildReportText } from "@/lib/report";
=======
import { FileText, Download, Printer, X } from "lucide-react";

import { buildReportHtml } from "@/lib/report";
>>>>>>> 8ffb0bbb306588311054f361cbdf39a0cafe2038
import type {
  ParsedEmailData,
  ThreatAnalysis,
  CampaignDnaResult,
  AiAnalysisResult,
  EvidenceMetadata,
} from "@/types";

interface ReportButtonProps {
  email: ParsedEmailData;
  threat: ThreatAnalysis;
  campaign: CampaignDnaResult | null;
  ai: AiAnalysisResult | null;
  evidence: EvidenceMetadata | null;
}

export const ReportButton: React.FC<ReportButtonProps> = ({
  email,
  threat,
  campaign,
  ai,
  evidence,
}) => {
  const [html, setHtml] = useState<string | null>(null);
<<<<<<< HEAD
  const [copied, setCopied] = useState(false);

  const payload = { email, threat, campaign, ai, evidence };
  const generate = () => setHtml(buildReportHtml(payload));
=======

  const generate = () => setHtml(buildReportHtml({ email, threat, campaign, ai, evidence }));
>>>>>>> 8ffb0bbb306588311054f361cbdf39a0cafe2038

  const download = () => {
    if (!html) return;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SentinelX-Incident-Report-${evidence?.evidenceId || "ARTIFACT"}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

<<<<<<< HEAD
  const copy = async () => {
    await navigator.clipboard.writeText(buildReportText(payload));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

=======
>>>>>>> 8ffb0bbb306588311054f361cbdf39a0cafe2038
  const print = () => {
    const frame = document.getElementById("sx-report-frame") as HTMLIFrameElement | null;
    frame?.contentWindow?.focus();
    frame?.contentWindow?.print();
  };

  return (
    <>
      <button
        onClick={generate}
<<<<<<< HEAD
        className="no-print inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyber-emerald to-cyber-teal px-4 py-2.5 text-sm font-semibold text-cyber-black shadow-glowEmeraldSm transition hover:from-cyber-emeraldBright hover:to-cyber-tealBright"
      >
        <FileText className="h-4 w-4" />
        Generate Investigation Report
      </button>

      {html && (
        <div className="fixed inset-0 z-50 flex flex-col bg-cyber-black/85 p-4 backdrop-blur-sm sm:p-8">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
            <div className="font-bold uppercase tracking-widest text-cyber-emeraldBright">
              Investigation Report
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={copy}
                className="inline-flex items-center gap-2 rounded-md border border-cyber-border bg-cyber-surface px-3 py-2 font-semibold text-cyber-textPrimary"
              >
                {copied ? <Check className="h-4 w-4 text-cyber-emerald" /> : <Copy className="h-4 w-4 text-cyber-emerald" />}
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                onClick={download}
                className="inline-flex items-center gap-2 rounded-md border border-cyber-border bg-cyber-surface px-3 py-2 font-semibold text-cyber-textPrimary"
              >
                <Download className="h-4 w-4 text-cyber-emerald" /> Download HTML
              </button>
              <button
                onClick={print}
                className="inline-flex items-center gap-2 rounded-md border border-cyber-border bg-cyber-surface px-3 py-2 font-semibold text-cyber-textPrimary"
              >
                <Printer className="h-4 w-4 text-cyber-emerald" /> Print / PDF
              </button>
              <button
                onClick={() => setHtml(null)}
                className="inline-flex items-center gap-2 rounded-md border border-cyber-border bg-cyber-surface px-3 py-2 font-semibold text-cyber-textPrimary"
              >
                <X className="h-4 w-4 text-cyber-crimson" /> Close
=======
        className="no-print inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-cyber-emerald to-cyber-teal hover:from-cyber-emeraldBright hover:to-cyber-tealBright text-cyber-black font-bold shadow-glowEmerald transition-colors"
        title="Build a full investigator report from this analysis"
      >
        <FileText className="w-4 h-4" />
        <span>Generate Investigation Report</span>
      </button>

      {html && (
        <div className="fixed inset-0 z-50 bg-cyber-black/85 backdrop-blur-sm flex flex-col p-4 sm:p-8">
          <div className="flex items-center justify-between gap-3 mb-3 font-mono text-xs">
            <div className="text-cyber-emeraldBright font-bold uppercase tracking-widest">
              SentinelX Incident Report
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={download}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-cyber-surface border border-cyber-border hover:border-cyber-borderHighlight text-cyber-textPrimary font-semibold"
              >
                <Download className="w-4 h-4 text-cyber-emerald" /> Download HTML
              </button>
              <button
                onClick={print}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-cyber-surface border border-cyber-border hover:border-cyber-borderHighlight text-cyber-textPrimary font-semibold"
              >
                <Printer className="w-4 h-4 text-cyber-emerald" /> Print / Save PDF
              </button>
              <button
                onClick={() => setHtml(null)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-cyber-surface border border-cyber-border hover:border-cyber-borderCrimson text-cyber-textPrimary font-semibold"
              >
                <X className="w-4 h-4 text-cyber-crimson" /> Close
>>>>>>> 8ffb0bbb306588311054f361cbdf39a0cafe2038
              </button>
            </div>
          </div>
          <iframe
            id="sx-report-frame"
            title="SentinelX Incident Report"
            srcDoc={html}
<<<<<<< HEAD
            className="w-full flex-1 rounded-lg border border-cyber-border bg-white"
=======
            className="flex-1 w-full rounded-lg bg-white border border-cyber-border"
>>>>>>> 8ffb0bbb306588311054f361cbdf39a0cafe2038
          />
        </div>
      )}
    </>
  );
};
