"use client";

import React from "react";
import { Shield, UploadCloud, Play, RotateCcw } from "lucide-react";

interface HeaderProps {
  onLoadDemo: () => void;
  onFileUpload: (file: File) => void;
  onReset: () => void;
  isLoading: boolean;
  activeFileName?: string | null;
  threatLevel?: "LOW" | "SUSPICIOUS" | "HIGH" | "CRITICAL" | null;
}

export const Header: React.FC<HeaderProps> = ({
  onLoadDemo,
  onFileUpload,
  onReset,
  isLoading,
  activeFileName,
  threatLevel,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <header className="sticky top-0 z-40 border-b border-cyber-border/80 bg-cyber-black/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyber-emerald/30 bg-cyber-panel text-cyber-emerald">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold tracking-tight text-cyber-textPrimary">
                Sentinel<span className="text-cyber-emeraldBright">X</span>
              </span>
              <span className="hidden rounded border border-cyber-border bg-cyber-surface px-1.5 py-0.5 font-mono text-[10px] text-cyber-textMuted sm:inline">
                SIH-26106
              </span>
            </div>
            <p className="hidden text-[11px] text-cyber-textMuted sm:block">Email Threat Investigation</p>
          </div>
          {threatLevel && (
            <span
              className={`ml-2 hidden rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase sm:inline ${
                threatLevel === "CRITICAL"
                  ? "border-cyber-crimson/50 bg-cyber-crimsonDark/30 text-cyber-crimsonBright"
                  : threatLevel === "HIGH"
                    ? "border-cyber-amber/50 bg-cyber-amberDark/30 text-cyber-amberBright"
                    : threatLevel === "SUSPICIOUS"
                      ? "border-cyber-amber/30 text-cyber-amber"
                      : "border-cyber-emerald/40 text-cyber-emeraldBright"
              }`}
            >
              {threatLevel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
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
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-cyber-border bg-cyber-panel px-3 py-2 text-xs font-medium text-cyber-textPrimary hover:border-cyber-borderHighlight disabled:opacity-40"
          >
            <UploadCloud className="h-4 w-4 text-cyber-emerald" />
            <span className="hidden sm:inline">Upload</span> .eml
          </button>
          <button
            onClick={onLoadDemo}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyber-emerald to-cyber-teal px-3.5 py-2 text-xs font-semibold text-cyber-black shadow-glowEmeraldSm disabled:opacity-40"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            Demo
          </button>
          {activeFileName && (
            <button
              onClick={onReset}
              disabled={isLoading}
              className="rounded-lg p-2 text-cyber-textMuted hover:bg-cyber-panel hover:text-cyber-textPrimary"
              title="Reset investigation"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
