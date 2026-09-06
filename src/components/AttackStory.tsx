"use client";

import React from "react";
import {
  Mail,
  Fingerprint,
  AlertTriangle,
  Link2,
  KeyRound,
  Paperclip,
  Bomb,
  ArrowDown,
} from "lucide-react";
import { motion } from "framer-motion";
import { buildAttackStory, type AttackStoryStep } from "@/lib/attack-story";
import type { CampaignDnaResult, ParsedEmailData, ThreatAnalysis } from "@/types";

interface AttackStoryProps {
  email: ParsedEmailData;
  threat: ThreatAnalysis;
  campaign: CampaignDnaResult | null;
}

const ICONS: Record<string, React.ReactNode> = {
  email: <Mail className="h-5 w-5" />,
  impersonation: <Fingerprint className="h-5 w-5" />,
  social: <AlertTriangle className="h-5 w-5" />,
  link: <Link2 className="h-5 w-5" />,
  credential: <KeyRound className="h-5 w-5" />,
  attachment: <Paperclip className="h-5 w-5" />,
  impact: <Bomb className="h-5 w-5" />,
};

function StepCard({ step, index, total }: { step: AttackStoryStep; index: number; total: number }) {
  const isImpact = step.id === "impact";
  const isStart = step.id === "email";

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.25 }}
        className={`w-full max-w-xl rounded-2xl border px-4 py-4 sm:px-5 ${
          isImpact
            ? "border-cyber-crimson/50 bg-cyber-crimsonDark/20 shadow-glowCrimsonSm"
            : isStart
              ? "border-cyber-emerald/30 bg-cyber-panel/90"
              : "border-cyber-border bg-cyber-surface/90"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
              isImpact
                ? "border-cyber-crimson/40 bg-cyber-crimsonDark/40 text-cyber-crimsonBright"
                : "border-cyber-emerald/25 bg-cyber-emerald/10 text-cyber-emeraldBright"
            }`}
          >
            {ICONS[step.id] || <Mail className="h-5 w-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-cyber-textDim">
              Step {index + 1} of {total}
            </p>
            <h3 className="mt-0.5 text-base font-semibold text-cyber-textPrimary">{step.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-cyber-textSecondary">{step.explanation}</p>
            <p className="mt-2 break-all font-mono text-[11px] text-cyber-textMuted">
              <span className="uppercase tracking-wider text-cyber-textDim">Evidence · </span>
              {step.evidence || "Not available"}
            </p>
          </div>
        </div>
      </motion.div>
      {index < total - 1 && (
        <ArrowDown className="my-2 h-5 w-5 text-cyber-textDim" aria-hidden />
      )}
    </div>
  );
}

export const AttackStory: React.FC<AttackStoryProps> = ({ email, threat, campaign }) => {
  const steps = buildAttackStory(email, threat, campaign);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-cyber-border bg-cyber-panel/85 p-5 shadow-panel backdrop-blur-md sm:p-7">
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-cyber-emerald/8 blur-3xl" />
      <div className="relative mb-6 text-center sm:text-left">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-cyber-emeraldBright">
          Detection → Why → Attack path → Impact
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-cyber-textPrimary sm:text-2xl">
          Attack Story
        </h2>
        <p className="mt-1.5 max-w-2xl text-sm text-cyber-textSecondary">
          How this email becomes an attack — reconstructed only from evidence in this analysis.
        </p>
      </div>

      <div className="relative mx-auto max-w-xl">
        {steps.map((step, i) => (
          <StepCard key={step.id} step={step} index={i} total={steps.length} />
        ))}
      </div>
    </section>
  );
};
