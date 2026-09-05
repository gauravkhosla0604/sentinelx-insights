import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import React, { useState } from "react";
import {
  Layers,
  FileSearch,
  Network,
  GitCommit,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

import { Header } from "@/components/Header";
import { UploadZone } from "@/components/UploadZone";
import { ThreatScoreWidget } from "@/components/ThreatScoreWidget";
import { EmailOverview } from "@/components/EmailOverview";
import { EvidenceCards } from "@/components/EvidenceCards";
import { ForensicsTab } from "@/components/ForensicsTab";
import { CampaignDnaCard } from "@/components/CampaignDnaCard";
import { CampaignGraph } from "@/components/CampaignGraph";
import { AttackStory } from "@/components/AttackStory";
import { ResponsePack } from "@/components/ResponsePack";
import { AiAnalysisCard } from "@/components/AiAnalysisCard";
import { ReportButton } from "@/components/ReportButton";
import { analyzeEml, analyzeDemoAttack } from "@/lib/analysis.functions";
import { sha256Hex, evidenceIdFromHash } from "@/lib/evidence";
import type {
  ParsedEmailData,
  ThreatAnalysis,
  CampaignDnaResult,
  AiAnalysisResult,
  EvidenceMetadata,
} from "@/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SentinelX — Email Threat Investigation & Campaign Intelligence" },
      {
        name: "description",
        content:
          "Upload a suspicious .eml and reconstruct the campaign behind it: evidence-based threat scoring, campaign DNA, evidence graph and one-click investigation reports.",
      },
      { property: "og:title", content: "SentinelX — Email Threat Investigation Platform" },
      {
        property: "og:description",
        content:
          "Forensic email investigation: evidence-based threat score, campaign correlation, evidence graph and investigator reports.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

type TabType = "overview" | "forensics" | "graph" | "story" | "response";

function Home() {
  const runAnalyzeEml = useServerFn(analyzeEml);
  const runDemo = useServerFn(analyzeDemoAttack);

  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [emailData, setEmailData] = useState<ParsedEmailData | null>(null);
  const [threatData, setThreatData] = useState<ThreatAnalysis | null>(null);
  const [campaignData, setCampaignData] = useState<CampaignDnaResult | null>(null);
  const [aiData, setAiData] = useState<AiAnalysisResult | null>(null);
  const [activeFileName, setActiveFileName] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<EvidenceMetadata | null>(null);

  const handleLoadDemo = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await runDemo({});
      setEmailData(data.email);
      setThreatData(data.threat);
      setCampaignData(data.campaign);
      setAiData(data.ai);
      setActiveFileName(data.filename);
      const hash = await sha256Hex(new TextEncoder().encode(data.rawEml));
      setEvidence({
        filename: data.filename,
        sizeBytes: new TextEncoder().encode(data.rawEml).byteLength,
        sha256: hash,
        evidenceId: evidenceIdFromHash(hash),
        analyzedAt: new Date().toISOString(),
      });
      setActiveTab("overview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading demo attack");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);

      const buffer = await file.arrayBuffer();
      // Evidence integrity: hash the ORIGINAL bytes before any processing.
      const hash = await sha256Hex(new Uint8Array(buffer));
      const rawEml = new TextDecoder("utf-8").decode(buffer);

      const data = await runAnalyzeEml({ data: { rawEml } });

      setEmailData(data.email);
      setThreatData(data.threat);
      setCampaignData(data.campaign);
      setAiData(data.ai);
      setActiveFileName(file.name);
      setEvidence({
        filename: file.name,
        sizeBytes: buffer.byteLength,
        sha256: hash,
        evidenceId: evidenceIdFromHash(hash),
        analyzedAt: new Date().toISOString(),
      });
      setActiveTab("overview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error parsing uploaded EML");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setEmailData(null);
    setThreatData(null);
    setCampaignData(null);
    setAiData(null);
    setActiveFileName(null);
    setEvidence(null);
    setError(null);
    setActiveTab("overview");
  };

  const tabClass = (tab: TabType) =>
    `relative flex items-center gap-2 py-3 px-3.5 border-b-2 font-bold transition-all whitespace-nowrap text-xs ${
      activeTab === tab
        ? "border-cyber-emerald text-cyber-emeraldBright bg-cyber-panel/60 shadow-[0_4px_12px_-4px_rgba(16,185,129,0.3)]"
        : "border-transparent text-cyber-textMuted hover:text-cyber-textPrimary hover:bg-cyber-panel/30"
    }`;

  return (
    <div className="min-h-screen cyber-bg text-cyber-textPrimary flex flex-col font-sans">
      <Header
        onLoadDemo={handleLoadDemo}
        onFileUpload={handleFileUpload}
        onReset={handleReset}
        isLoading={isLoading}
        activeFileName={activeFileName}
        threatLevel={threatData?.level}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-cyber-crimsonDark/30 border border-cyber-crimson/70 text-cyber-crimsonBright flex items-center gap-3 text-xs font-mono shadow-glowCrimsonSm">
            <AlertCircle className="w-4 h-4 text-cyber-crimson shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading && (
          <div className="py-28 text-center space-y-4">
            <div className="relative w-16 h-16 mx-auto">
              <Loader2 className="w-16 h-16 text-cyber-emerald animate-spin" />
              <div className="absolute inset-0 rounded-full bg-cyber-emerald/10 blur-xl animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-cyber-textPrimary font-mono uppercase tracking-widest">
              Synthesizing Telemetry &amp; Genetic Campaign Overlap
            </h3>
            <p className="text-xs text-cyber-textMuted font-mono max-w-md mx-auto">
              Evaluating SPF/DKIM/DMARC alignment · Isolating homoglyph lookalikes · Correlating
              infrastructure clusters...
            </p>
          </div>
        )}

        {!isLoading && !emailData && (
          <UploadZone
            onFileUpload={handleFileUpload}
            onLoadDemo={handleLoadDemo}
            isLoading={isLoading}
          />
        )}

        {!isLoading && emailData && threatData && (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-cyber-panel border border-cyber-border px-4 py-2.5 rounded-xl text-xs font-mono shadow-panel"
            >
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-cyber-textDim uppercase text-[10px]">Active Artifact:</span>
                <span className="text-cyber-emerald font-bold">{activeFileName}</span>
                <span className="text-cyber-border">|</span>
                <span className="text-cyber-textDim uppercase text-[10px]">Timestamp:</span>
                <span className="text-cyber-textSecondary">
                  {emailData.date ? new Date(emailData.date).toUTCString() : "Not available"}
                </span>
                {campaignData?.matchedCampaign && (
                  <>
                    <span className="text-cyber-border">|</span>
                    <span className="text-cyber-textDim uppercase text-[10px]">Cluster ID:</span>
                    <span className="text-cyber-violet font-bold">
                      {campaignData.matchedCampaign}
                    </span>
                  </>
                )}
              </div>
              <ReportButton
                email={emailData}
                threat={threatData}
                campaign={campaignData}
                ai={aiData}
                evidence={evidence}
              />
            </motion.div>

            <ThreatScoreWidget threat={threatData} campaign={campaignData} />

            <div className="border-b border-cyber-border/80 flex space-x-1 sm:space-x-2 overflow-x-auto text-xs font-mono">
              <button onClick={() => setActiveTab("overview")} className={tabClass("overview")}>
                <Layers className="w-4 h-4" />
                Overview
              </button>
              <button onClick={() => setActiveTab("forensics")} className={tabClass("forensics")}>
                <FileSearch className="w-4 h-4" />
                Forensics
              </button>
              <button onClick={() => setActiveTab("graph")} className={tabClass("graph")}>
                <Network className="w-4 h-4" />
                Evidence Graph
                {campaignData?.relatedIncidentsCount ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyber-surface text-cyber-teal border border-cyber-border font-bold">
                    {campaignData.relatedIncidentsCount}
                  </span>
                ) : null}
              </button>
              <button onClick={() => setActiveTab("story")} className={tabClass("story")}>
                <GitCommit className="w-4 h-4" />
                Attack Story
              </button>
              <button onClick={() => setActiveTab("response")} className={tabClass("response")}>
                <ShieldCheck className="w-4 h-4" />
                Response Pack
              </button>
            </div>

            {activeTab === "overview" && (
              <div className="space-y-6">
                {campaignData && (
                  <CampaignDnaCard
                    campaign={campaignData}
                    onViewGraph={() => setActiveTab("graph")}
                  />
                )}
                {aiData && <AiAnalysisCard ai={aiData} />}
                <EmailOverview email={emailData} threat={threatData} />
                <EvidenceCards factors={threatData.factors} />
              </div>
            )}

            {activeTab === "forensics" && <ForensicsTab email={emailData} />}

            {activeTab === "graph" && campaignData && (
              <CampaignGraph email={emailData} threat={threatData} campaign={campaignData} />
            )}

            {activeTab === "story" && campaignData && (
              <AttackStory email={emailData} threat={threatData} campaign={campaignData} />
            )}

            {activeTab === "response" && campaignData && (
              <ResponsePack
                email={emailData}
                threat={threatData}
                campaign={campaignData}
                filename={activeFileName}
              />
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-cyber-border bg-cyber-black/90 py-4 text-center text-xs font-mono text-cyber-textDim print:hidden">
        SENTINELX // RECONSTRUCTION SUITE · SIH 26106 · “TRADITIONAL TOOLS ANALYZE EMAILS. SENTINELX
        RECONSTRUCTS CAMPAIGNS.”
      </footer>
    </div>
  );
}
