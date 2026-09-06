"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, Play, Mail, ScanSearch, Eye, ShieldCheck, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";

interface UploadZoneProps {
  onFileUpload: (file: File) => void;
  onLoadDemo: () => void;
  isLoading: boolean;
}

const FLOW = [
  { label: "Email", icon: Mail },
  { label: "Analyze", icon: ScanSearch },
  { label: "Understand", icon: Eye },
  { label: "Respond", icon: ShieldCheck },
];

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFileUpload,
  onLoadDemo,
  isLoading,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
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
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
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
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
