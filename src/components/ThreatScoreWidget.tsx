"use client";

import React from "react";
import { Activity } from "lucide-react";
import { motion } from "framer-motion";
import type { CampaignDnaResult, ThreatAnalysis } from "@/types";

interface ThreatScoreWidgetProps {
  threat: ThreatAnalysis;
  campaign?: CampaignDnaResult | null;
}

export const ThreatScoreWidget: React.FC<ThreatScoreWidgetProps> = ({ threat, campaign }) => {
  const { score, level } = threat;
  const triggered = threat.factors.filter((f) => f.triggered);
  const attackType =
    campaign?.attackType && campaign.attackType !== "NONE" ? campaign.attackType : "Not available";

  const confidence =
    triggered.length >= 4 ? "High confidence" : triggered.length >= 2 ? "Medium confidence" : triggered.length === 1 ? "Limited evidence" : "Insufficient evidence";

  const theme =
    level === "CRITICAL"
      ? {
          label: "CRITICAL RISK",
          text: "text-cyber-crimsonBright",
          ring: "border-cyber-crimson shadow-glowCrimson",
          bar: "from-cyber-crimson to-cyber-crimsonBright",
          glow: "rgba(244,63,94,0.22)",
        }
      : level === "HIGH"
        ? {
            label: "HIGH RISK",
            text: "text-cyber-amberBright",
            ring: "border-cyber-amber shadow-glowAmber",
            bar: "from-cyber-amber to-cyber-amberBright",
            glow: "rgba(245,158,11,0.2)",
          }
        : level === "SUSPICIOUS"
          ? {
              label: "MEDIUM RISK",
              text: "text-cyber-amber",
              ring: "border-cyber-amber/70",
              bar: "from-cyber-amber to-cyber-amberBright",
              glow: "rgba(245,158,11,0.12)",
            }
          : {
              label: "LOW RISK",
              text: "text-cyber-emeraldBright",
              ring: "border-cyber-emerald shadow-glowEmerald",
              bar: "from-cyber-emerald to-cyber-emeraldBright",
              glow: "rgba(16,185,129,0.16)",
            };

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-cyber-border bg-cyber-panel/90 p-5 shadow-panel backdrop-blur-md sm:p-7"
    >
      <div
        className="pointer-events-none absolute -left-10 -top-16 h-48 w-48 rounded-full blur-3xl"
        style={{ backgroundColor: theme.glow }}
      />
      <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <div
            className={`flex h-28 w-28 flex-col items-center justify-center rounded-2xl border-2 bg-cyber-black/80 ${theme.ring}`}
          >
            <span className={`font-mono text-4xl font-black tracking-tight ${theme.text}`}>{score}</span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-cyber-textDim">/ 100</span>
          </div>
          <div>
            <p className={`font-mono text-xs font-bold uppercase tracking-[0.18em] ${theme.text}`}>{theme.label}</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-cyber-textPrimary sm:text-3xl">
              {attackType}
            </h2>
            <p className="mt-2 text-sm text-cyber-textSecondary">
              {triggered.length} indicator{triggered.length === 1 ? "" : "s"} detected
              <span className="mx-2 text-cyber-textDim">·</span>
              {confidence}
            </p>
          </div>
        </div>

        <div className="w-full max-w-xs">
          <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-cyber-textMuted">
            <span className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-cyber-emerald" />
              Risk index
            </span>
            <span className={theme.text}>{score}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full border border-cyber-border bg-cyber-black">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(score, 100)}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className={`h-full rounded-full bg-gradient-to-r ${theme.bar}`}
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
};
