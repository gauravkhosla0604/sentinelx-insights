<<<<<<< HEAD
"use client";

import React from "react";
import { Shield, UploadCloud, Play, RotateCcw } from "lucide-react";
=======
'use client';

import React from 'react';
import { Shield, UploadCloud, Play, RotateCcw, Crosshair, Radio } from 'lucide-react';
import { motion } from 'framer-motion';
>>>>>>> 8ffb0bbb306588311054f361cbdf39a0cafe2038

interface HeaderProps {
  onLoadDemo: () => void;
  onFileUpload: (file: File) => void;
  onReset: () => void;
  isLoading: boolean;
  activeFileName?: string | null;
<<<<<<< HEAD
  threatLevel?: "LOW" | "SUSPICIOUS" | "HIGH" | "CRITICAL" | null;
=======
  threatLevel?: 'LOW' | 'SUSPICIOUS' | 'HIGH' | 'CRITICAL' | null;
>>>>>>> 8ffb0bbb306588311054f361cbdf39a0cafe2038
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

<<<<<<< HEAD
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
=======
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const getThreatBadge = () => {
    if (!threatLevel) {
      return (
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded border border-cyber-border bg-cyber-surface/80 text-cyber-textDim text-[11px] font-mono">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-emerald opacity-50" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-emerald" />
          </span>
          <span className="text-cyber-textSecondary font-semibold tracking-wider">STANDBY // SENSORS ARMED</span>
        </div>
      );
    }

    switch (threatLevel) {
      case 'CRITICAL':
        return (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2 px-3 py-1 rounded bg-cyber-crimsonDark/30 border border-cyber-crimson/70 text-cyber-crimsonBright text-[11px] font-mono font-bold shadow-glowCrimsonSm tracking-wider"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-crimson opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-crimson" />
            </span>
            <span>CRITICAL INCIDENT // BREACH RISK</span>
          </motion.div>
        );
      case 'HIGH':
        return (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2 px-3 py-1 rounded bg-cyber-amberDark/30 border border-cyber-amber/60 text-cyber-amberBright text-[11px] font-mono font-bold tracking-wider"
          >
            <span className="w-2 h-2 rounded-full bg-cyber-amber animate-pulse" />
            <span>HIGH THREAT DETECTED</span>
          </motion.div>
        );
      case 'SUSPICIOUS':
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded bg-cyber-amber/10 border border-cyber-amber/40 text-cyber-amber text-[11px] font-mono font-bold tracking-wider">
            <span className="w-2 h-2 rounded-full bg-cyber-amber" />
            <span>SUSPICIOUS ANOMALY</span>
          </div>
        );
      case 'LOW':
        return (
          <div className="flex items-center gap-2 px-3 py-1 rounded bg-cyber-emeraldDark/30 border border-cyber-emerald/60 text-cyber-emeraldBright text-[11px] font-mono font-bold tracking-wider">
            <span className="w-2 h-2 rounded-full bg-cyber-emerald" />
            <span>VERIFIED BENIGN</span>
          </div>
        );
    }
  };

  return (
    <header className="border-b border-cyber-border/80 bg-cyber-black/90 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Emblem & Identity */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative group cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyber-panel to-cyber-surface border border-cyber-emerald/40 flex items-center justify-center text-cyber-emerald shadow-glowEmeraldSm group-hover:border-cyber-emerald transition-all duration-300">
                <Crosshair className="w-5 h-5 text-cyber-emerald transition-transform group-hover:rotate-90 duration-500" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyber-emerald border-2 border-cyber-black" />
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-extrabold tracking-wider text-cyber-textPrimary text-base sm:text-lg font-sans">
                  SENTINEL<span className="text-cyber-emeraldBright drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]">X</span>
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyber-panel border border-cyber-border text-cyber-textSecondary tracking-widest">
                  SIH-26106
                </span>
                {getThreatBadge()}
              </div>
              <p className="text-[11px] font-mono text-cyber-textMuted tracking-tight hidden sm:block">
                Campaign Reconstruction Engine <span className="text-cyber-dim">·</span> <span className="text-cyber-textSecondary">Forensic Threat Intelligence</span>
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".eml,message/rfc822"
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="group relative inline-flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-medium rounded-md bg-cyber-panel/90 hover:bg-cyber-panelHover text-cyber-textPrimary border border-cyber-border hover:border-cyber-borderHighlight transition-all duration-200 disabled:opacity-40"
              title="Upload raw RFC 822 EML file"
            >
              <UploadCloud className="w-4 h-4 text-cyber-emerald group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Ingest</span> .EML
            </button>

            <button
              onClick={onLoadDemo}
              disabled={isLoading}
              className="relative inline-flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold rounded-md bg-gradient-to-r from-cyber-emerald to-cyber-teal hover:from-cyber-emeraldBright hover:to-cyber-tealBright text-cyber-black shadow-glowEmerald transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
              title="Load synthetic Microsoft impersonation attack artifact"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Load Demo Attack</span>
            </button>

            {activeFileName && (
              <button
                onClick={onReset}
                disabled={isLoading}
                className="p-2 rounded-md text-cyber-textMuted hover:text-cyber-textPrimary hover:bg-cyber-panel border border-transparent hover:border-cyber-border transition-all"
                title="Reset Investigation Session"
              >
                <RotateCcw className="w-4 h-4 hover:rotate-180 transition-transform duration-500" />
              </button>
            )}
          </div>
>>>>>>> 8ffb0bbb306588311054f361cbdf39a0cafe2038
        </div>
      </div>
    </header>
  );
};
