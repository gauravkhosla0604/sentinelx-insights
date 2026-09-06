<<<<<<< HEAD
"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, Play, Mail, ScanSearch, Eye, ShieldCheck, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";
=======
'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Play, Crosshair, ShieldAlert, Cpu, Network, Radio, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
>>>>>>> 8ffb0bbb306588311054f361cbdf39a0cafe2038

interface UploadZoneProps {
  onFileUpload: (file: File) => void;
  onLoadDemo: () => void;
  isLoading: boolean;
}

<<<<<<< HEAD
const FLOW = [
  { label: "Email", icon: Mail },
  { label: "Analyze", icon: ScanSearch },
  { label: "Understand", icon: Eye },
  { label: "Respond", icon: ShieldCheck },
];

=======
>>>>>>> 8ffb0bbb306588311054f361cbdf39a0cafe2038
export const UploadZone: React.FC<UploadZoneProps> = ({
  onFileUpload,
  onLoadDemo,
  isLoading,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

<<<<<<< HEAD
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl space-y-10 py-10 sm:py-14"
    >
      <div className="space-y-4 text-center">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-cyber-emeraldBright">
          SentinelX · SIH 26106
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-cyber-textPrimary sm:text-5xl sm:leading-[1.12]">
          Turn Suspicious Emails Into Attack Stories.
        </h1>
        <p className="mx-auto max-w-xl text-sm leading-relaxed text-cyber-textSecondary sm:text-base">
          SentinelX analyzes email evidence, explains the threat, and reconstructs the attack path.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
        {FLOW.map((item, i) => (
          <React.Fragment key={item.label}>
            <div className="flex items-center gap-2 rounded-full border border-cyber-border bg-cyber-panel/80 px-3.5 py-1.5 text-xs font-medium text-cyber-textPrimary">
              <item.icon className="h-3.5 w-3.5 text-cyber-emerald" />
              {item.label}
            </div>
            {i < FLOW.length - 1 && (
              <ArrowDown className="h-3.5 w-3.5 text-cyber-textDim sm:-rotate-90" aria-hidden />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="rounded-2xl border border-cyber-border bg-cyber-panel/85 p-6 shadow-panel backdrop-blur-md sm:p-8">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragOver(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) onFileUpload(file);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors sm:p-10 ${
            isDragOver
              ? "border-cyber-emerald bg-cyber-emerald/10"
              : "border-cyber-border bg-cyber-surface/50 hover:border-cyber-borderHighlight"
=======
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto py-8 sm:py-12 space-y-8"
    >
      {/* Editorial Headline Banner */}
      <div className="text-center space-y-3.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-panel/90 border border-cyber-border text-cyber-textSecondary text-xs font-mono shadow-panel">
          <span className="w-2 h-2 rounded-full bg-cyber-emerald animate-pulse" />
          <span className="text-cyber-emeraldBright font-semibold">SX-CONSOLE v2.4</span>
          <span className="text-cyber-dim">·</span>
          <span>EMAIL FORENSICS & ATTRIBUTION MATRIX</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-cyber-textPrimary tracking-tight font-sans">
          Traditional tools analyze emails.<br />
          <span className="bg-gradient-to-r from-cyber-emerald via-cyber-teal to-cyber-emeraldBright bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            SentinelX reconstructs campaigns.
          </span>
        </h1>

        <p className="text-sm text-cyber-textSecondary max-w-2xl mx-auto font-sans leading-relaxed">
          Ingest raw RFC 822 <code className="text-cyber-emerald font-mono bg-cyber-surface px-1.5 py-0.5 rounded border border-cyber-border text-xs">.eml</code> artifacts, compute deterministic explainable threat scores, isolate homoglyph lookalikes, and correlate infrastructure against historical threat clusters.
        </p>
      </div>

      {/* Main Secure Intake Console */}
      <div className="corner-bracket bg-cyber-panel/90 border border-cyber-border rounded-xl p-6 sm:p-9 shadow-panel relative overflow-hidden backdrop-blur-md">
        {/* Console Header Bar */}
        <div className="flex items-center justify-between border-b border-cyber-border/80 pb-3 mb-6 font-mono text-xs text-cyber-textMuted">
          <div className="flex items-center gap-2.5">
            <Radio className="w-3.5 h-3.5 text-cyber-emerald animate-pulseSlow" />
            <span className="text-cyber-textPrimary font-semibold tracking-wider uppercase">
              Forensic Ingestion Intake
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="hidden sm:inline text-cyber-textDim">PARSER: MIME/RFC822</span>
            <span className="px-2 py-0.5 rounded bg-cyber-surface border border-cyber-border text-cyber-emerald">
              READY
            </span>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-lg p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 ${
            isDragOver
              ? 'border-cyber-emerald bg-cyber-emerald/10 shadow-glowEmerald'
              : 'border-cyber-border hover:border-cyber-borderHighlight bg-cyber-surface/60 hover:bg-cyber-surface/90'
>>>>>>> 8ffb0bbb306588311054f361cbdf39a0cafe2038
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
<<<<<<< HEAD
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileUpload(file);
            }}
            accept=".eml,message/rfc822"
            className="hidden"
          />
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-cyber-border bg-cyber-panel text-cyber-emerald">
            <UploadCloud className="h-6 w-6" />
          </div>
          <h2 className="text-base font-semibold text-cyber-textPrimary">Drop a .eml file or click to browse</h2>
          <p className="mx-auto mt-1.5 max-w-md text-xs text-cyber-textMuted">
            Parse headers, links, and attachments — then reconstruct the attack story.
          </p>

          <div
            className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row"
=======
            onChange={handleFileChange}
            accept=".eml,message/rfc822"
            className="hidden"
          />

          <div className="w-14 h-14 rounded-xl bg-cyber-panel border border-cyber-border flex items-center justify-center mx-auto mb-4 text-cyber-emerald shadow-panel group-hover:scale-110 transition-transform">
            <UploadCloud className="w-7 h-7" />
          </div>

          <h3 className="text-base font-bold text-cyber-textPrimary mb-1.5 font-mono">
            DROP RAW <span className="text-cyber-emerald">.EML</span> FILE OR CLICK TO BROWSE
          </h3>

          <p className="text-xs text-cyber-textMuted max-w-md mx-auto mb-7 font-mono">
            Extracts Authentication-Results, Received MTA hop ladders, hyperlinks, and target domains.
          </p>

          {/* Action Trigger Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5"
>>>>>>> 8ffb0bbb306588311054f361cbdf39a0cafe2038
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
<<<<<<< HEAD
              className="w-full rounded-lg bg-gradient-to-r from-cyber-emerald to-cyber-teal px-6 py-2.5 text-sm font-semibold text-cyber-black shadow-glowEmeraldSm transition hover:from-cyber-emeraldBright hover:to-cyber-tealBright disabled:opacity-40 sm:w-auto"
            >
              Analyze an Email
            </button>
            <button
              onClick={onLoadDemo}
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-cyber-border bg-cyber-surface px-5 py-2.5 text-sm font-medium text-cyber-textPrimary hover:border-cyber-borderHighlight disabled:opacity-40 sm:w-auto"
            >
              <Play className="h-3.5 w-3.5 fill-current text-cyber-emerald" />
              Load demo attack
=======
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-mono font-semibold rounded-md bg-cyber-panel hover:bg-cyber-panelHover text-cyber-textPrimary border border-cyber-border hover:border-cyber-borderHighlight transition-all duration-150"
            >
              Select .EML from Storage
            </button>

            <span className="text-xs text-cyber-textDim font-mono">or</span>

            <button
              onClick={onLoadDemo}
              disabled={isLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-mono font-bold rounded-md bg-gradient-to-r from-cyber-emerald to-cyber-teal hover:from-cyber-emeraldBright hover:to-cyber-tealBright text-cyber-black shadow-glowEmerald transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Load Demo Attack (Microsoft Phish)</span>
>>>>>>> 8ffb0bbb306588311054f361cbdf39a0cafe2038
            </button>
          </div>
        </div>
      </div>
<<<<<<< HEAD
=======

      {/* Feature Architecture Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-cyber-panel/80 border border-cyber-border rounded-lg p-4.5 shadow-panel hover:border-cyber-borderHighlight transition-colors">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-1.5 rounded bg-cyber-crimsonDark/30 text-cyber-crimson border border-cyber-crimson/50">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold font-mono text-cyber-textPrimary uppercase tracking-wider">
              Explainable Threat Engine
            </h4>
          </div>
          <p className="text-xs text-cyber-textSecondary leading-relaxed">
            Deterministic scoring (0–100) based on SPF/DKIM/DMARC failure, homoglyph lookalikes, reply divergence, and coercion.
          </p>
        </div>

        <div className="bg-cyber-panel/80 border border-cyber-border rounded-lg p-4.5 shadow-panel hover:border-cyber-borderHighlight transition-colors">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-1.5 rounded bg-cyber-emeraldDark/30 text-cyber-emerald border border-cyber-emerald/50">
              <Cpu className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold font-mono text-cyber-textPrimary uppercase tracking-wider">
              Deep Header Forensics
            </h4>
          </div>
          <p className="text-xs text-cyber-textSecondary leading-relaxed">
            MTA hop ladders, envelope vs header domain mismatches, lexical URL parsing, and verifiable forensic evidence cards.
          </p>
        </div>

        <div className="bg-cyber-panel/80 border border-cyber-border rounded-lg p-4.5 shadow-panel hover:border-cyber-borderHighlight transition-colors">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-1.5 rounded bg-cyber-violetDim text-cyber-violet border border-cyber-violet/50">
              <Network className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold font-mono text-cyber-textPrimary uppercase tracking-wider">
              Campaign DNA & Graph
            </h4>
          </div>
          <p className="text-xs text-cyber-textSecondary leading-relaxed">
            Correlate infrastructure across historical incidents to reconstruct coordinated threat actor campaigns.
          </p>
        </div>
      </div>
>>>>>>> 8ffb0bbb306588311054f361cbdf39a0cafe2038
    </motion.div>
  );
};
