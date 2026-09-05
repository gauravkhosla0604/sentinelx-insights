import React, { useState } from "react";
import { FileText, Download, Printer, X } from "lucide-react";

import { buildReportHtml } from "@/lib/report";
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

  const generate = () => setHtml(buildReportHtml({ email, threat, campaign, ai, evidence }));

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

  const print = () => {
    const frame = document.getElementById("sx-report-frame") as HTMLIFrameElement | null;
    frame?.contentWindow?.focus();
    frame?.contentWindow?.print();
  };

  return (
    <>
      <button
        onClick={generate}
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
              </button>
            </div>
          </div>
          <iframe
            id="sx-report-frame"
            title="SentinelX Incident Report"
            srcDoc={html}
            className="flex-1 w-full rounded-lg bg-white border border-cyber-border"
          />
        </div>
      )}
    </>
  );
};
