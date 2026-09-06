import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import React, { useState } from "react";
import {
  Layers,
  FileSearch,
  Network,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { Header } from "@/components/Header";
import { UploadZone } from "@/components/UploadZone";
import { ThreatScoreWidget } from "@/components/ThreatScoreWidget";
import { EmailOverview } from "@/components/EmailOverview";
import { EvidenceCards } from "@/components/EvidenceCards";
import { ForensicsTab } from "@/components/ForensicsTab";
import { CampaignDnaCard } from "@/components/CampaignDnaCard";
import { CampaignGraph } from "@/components/CampaignGraph";
import { AttackStory } from "@/components/AttackStory";
import { WhySuspicious } from "@/components/WhySuspicious";
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
      { title: "SentinelX — Email Threat Investigation" },
      {
        name: "description",
        content:
          "Turn suspicious emails into attack stories. SentinelX explains the threat and reconstructs the attack path.",
      },
    ],
  }),
  component: Home,
});

type TabType = "overview" | "forensics" | "graph" | "response";

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
    `relative flex items-center gap-2 whitespace-nowrap px-3.5 py-3 text-xs font-medium transition-colors ${
      activeTab === tab
        ? "border-b-2 border-cyber-emerald text-cyber-emeraldBright"
        : "border-b-2 border-transparent text-cyber-textMuted hover:text-cyber-textPrimary"
    }`;

  return (
    <div className="flex min-h-screen flex-col font-sans text-cyber-textPrimary cyber-bg">
      <Header
        onLoadDemo={handleLoadDemo}
        onFileUpload={handleFileUpload}
        onReset={handleReset}
        isLoading={isLoading}
        activeFileName={activeFileName}
        threatLevel={threatData?.level}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-cyber-crimson/70 bg-cyber-crimsonDark/30 p-4 font-mono text-xs text-cyber-crimsonBright">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading && (
          <div className="space-y-3 py-24 text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-cyber-emerald" />
            <h3 className="text-sm font-semibold uppercase tracking-widest text-cyber-textPrimary">
              Analyzing email evidence
            </h3>
            <p className="mx-auto max-w-md text-xs text-cyber-textMuted">
              Parsing the message, scoring indicators, and reconstructing the attack path…
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
            <div className="flex flex-col justify-between gap-3 rounded-xl border border-cyber-border bg-cyber-panel/80 px-4 py-3 sm:flex-row sm:items-center">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyber-textDim">
                  Email Threat Investigation
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-cyber-textMuted">Case ID</span>
                  <span className="font-mono font-semibold text-cyber-emeraldBright">
                    {evidence?.evidenceId || "Not available"}
                  </span>
                  <span className="text-cyber-border">·</span>
                  <span className="rounded-md border border-cyber-emerald/30 bg-cyber-emerald/10 px-2 py-0.5 font-mono text-[10px] uppercase text-cyber-emeraldBright">
                    Analyzed
                  </span>
                  <span className="truncate font-mono text-xs text-cyber-textMuted">{activeFileName}</span>
                </div>
              </div>
            </div>

            <ThreatScoreWidget threat={threatData} campaign={campaignData} />
            <WhySuspicious email={emailData} threat={threatData} />
            <AttackStory email={emailData} threat={threatData} campaign={campaignData} />

            <div className="border-b border-cyber-border/80 flex space-x-1 overflow-x-auto">
              <button onClick={() => setActiveTab("overview")} className={tabClass("overview")}>
                <Layers className="h-4 w-4" />
                Evidence
              </button>
              <button onClick={() => setActiveTab("forensics")} className={tabClass("forensics")}>
                <FileSearch className="h-4 w-4" />
                Forensics
              </button>
              <button onClick={() => setActiveTab("graph")} className={tabClass("graph")}>
                <Network className="h-4 w-4" />
                Graph
                {campaignData?.relatedIncidentsCount ? (
                  <span className="rounded border border-cyber-border bg-cyber-surface px-1.5 py-0.5 font-mono text-[10px] text-cyber-teal">
                    {campaignData.relatedIncidentsCount}
                  </span>
                ) : null}
              </button>
              <button onClick={() => setActiveTab("response")} className={tabClass("response")}>
                <ShieldCheck className="h-4 w-4" />
                Response
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

            {activeTab === "response" && campaignData && (
              <ResponsePack
                email={emailData}
                threat={threatData}
                campaign={campaignData}
                filename={activeFileName}
              />
            )}

            <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-cyber-border bg-cyber-panel/80 p-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-semibold text-cyber-textPrimary">Actions</p>
                <p className="text-xs text-cyber-textMuted">
                  Export this investigation from existing analysis data.
                </p>
              </div>
              <ReportButton
                email={emailData}
                threat={threatData}
                campaign={campaignData}
                ai={aiData}
                evidence={evidence}
              />
            </div>
          </div>
        )}
      </main>

      <footer className="print:hidden border-t border-cyber-border bg-cyber-black/90 py-4 text-center text-xs text-cyber-textDim">
        SentinelX · SIH 26106 · Explains how the attack works and gives you the evidence to respond.
      </footer>
    </div>
  );
}
