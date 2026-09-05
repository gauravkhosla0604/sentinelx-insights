'use client';

import React, { useState } from 'react';
import { ParsedEmailData, ThreatAnalysis } from '@/types';
import { Mail, AlertOctagon, Eye, ExternalLink, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmailOverviewProps {
  email: ParsedEmailData;
  threat: ThreatAnalysis;
}

export const EmailOverview: React.FC<EmailOverviewProps> = ({ email, threat }) => {
  const [viewMode, setViewMode] = useState<'html' | 'text'>('html');

  const senderDomain = email.from.address?.split('@')[1] || '';
  const replyToDomain = email.replyTo?.address?.split('@')[1] || '';
  const returnPathDomain = email.returnPath?.split('@')[1] || '';

  const hasReplyToMismatch = replyToDomain && senderDomain && replyToDomain !== senderDomain;
  const hasReturnPathMismatch = returnPathDomain && senderDomain && returnPathDomain !== senderDomain;

  return (
    <div className="space-y-4">
      {/* Brand Impersonation Alert Banner */}
      {threat.impersonatedBrand && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-cyber-crimsonDark/25 border border-cyber-crimson/70 rounded-xl p-4 sm:p-4.5 flex items-start gap-3.5 shadow-glowCrimsonSm"
        >
          <div className="p-2 rounded-lg bg-cyber-crimsonDark/40 text-cyber-crimsonBright border border-cyber-crimson/50 shrink-0">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div className="flex-1 font-sans">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyber-crimsonDark text-cyber-crimsonBright font-bold border border-cyber-crimson/60">
                Impersonation Alert
              </span>
              <h4 className="text-sm font-bold text-cyber-textPrimary">
                Protected Enterprise Typo-Squatting: {threat.impersonatedBrand.brand}
              </h4>
            </div>
            <p className="text-xs text-cyber-textSecondary mt-1 leading-relaxed">
              The transmitting infrastructure mimics protected brand asset{' '}
              <strong className="text-cyber-textPrimary font-mono">{threat.impersonatedBrand.legitimateDomain}</strong>{' '}
              via deceptive domain variation{' '}
              <strong className="text-cyber-crimsonBright font-mono bg-cyber-black px-1.5 py-0.5 rounded border border-cyber-crimson/50">
                {threat.impersonatedBrand.lookalikeDomain}
              </strong>.
            </p>
          </div>
        </motion.div>
      )}

      {/* Header Metadata Grid */}
      <div className="corner-bracket bg-cyber-panel border border-cyber-border rounded-xl p-5 shadow-panel">
        <div className="flex items-center justify-between border-b border-cyber-border/80 pb-3 mb-4 font-mono text-xs">
          <div className="flex items-center gap-2 text-cyber-textPrimary font-bold uppercase tracking-wider">
            <Mail className="w-4 h-4 text-cyber-emerald" />
            <span>RFC 822 Header Telemetry</span>
          </div>
          <span className="text-cyber-textMuted text-[11px]">
            {email.date ? new Date(email.date).toUTCString() : 'N/A'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          {/* Subject */}
          <div className="col-span-1 md:col-span-2 bg-cyber-surface/90 p-3.5 rounded-lg border border-cyber-border">
            <span className="text-cyber-textDim uppercase block text-[10px] mb-1">Subject Line</span>
            <span className="text-cyber-textPrimary font-bold text-sm select-all">
              {email.subject}
            </span>
          </div>

          {/* From */}
          <div className="bg-cyber-surface/90 p-3 rounded-lg border border-cyber-border">
            <span className="text-cyber-textDim uppercase block text-[10px] mb-1">From (Header Sender)</span>
            <div className="flex items-center justify-between gap-2">
              <span className="text-cyber-textPrimary select-all truncate">
                {email.from.name ? `${email.from.name} ` : ''}&lt;{email.from.address}&gt;
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyber-panel text-cyber-emerald border border-cyber-border shrink-0 font-bold">
                {senderDomain}
              </span>
            </div>
          </div>

          {/* To */}
          <div className="bg-cyber-surface/90 p-3 rounded-lg border border-cyber-border">
            <span className="text-cyber-textDim uppercase block text-[10px] mb-1">To (Recipient)</span>
            <span className="text-cyber-textPrimary select-all truncate block">
              {email.to.map((t) => t.address).join(', ') || 'Undisclosed recipients'}
            </span>
          </div>

          {/* Reply-To */}
          <div className={`p-3 rounded-lg border ${hasReplyToMismatch ? 'bg-cyber-amberDark/20 border-cyber-amber/60' : 'bg-cyber-surface/90 border-cyber-border'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-cyber-textDim uppercase block text-[10px]">Reply-To Route</span>
              {hasReplyToMismatch && (
                <span className="text-[9px] font-bold text-cyber-amberBright font-mono px-1.5 py-0.5 rounded bg-cyber-amberDark/40 border border-cyber-amber/60">
                  DIVERGENT DESTINATION
                </span>
              )}
            </div>
            <span className="text-cyber-textPrimary select-all truncate block font-bold">
              {email.replyTo ? `${email.replyTo.address}` : 'Unset (Defaults to From Address)'}
            </span>
          </div>

          {/* Return-Path */}
          <div className={`p-3 rounded-lg border ${hasReturnPathMismatch ? 'bg-cyber-amberDark/20 border-cyber-amber/60' : 'bg-cyber-surface/90 border-cyber-border'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-cyber-textDim uppercase block text-[10px]">Return-Path (Envelope Sender)</span>
              {hasReturnPathMismatch && (
                <span className="text-[9px] font-bold text-cyber-amberBright font-mono px-1.5 py-0.5 rounded bg-cyber-amberDark/40 border border-cyber-amber/60">
                  ENVELOPE MISMATCH
                </span>
              )}
            </div>
            <span className="text-cyber-textPrimary select-all truncate block font-bold">
              {email.returnPath || 'None Specified'}
            </span>
          </div>
        </div>
      </div>

      {/* Email Body Inspector */}
      <div className="corner-bracket bg-cyber-panel border border-cyber-border rounded-xl p-5 shadow-panel">
        <div className="flex items-center justify-between border-b border-cyber-border/80 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyber-emerald" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyber-textPrimary font-mono">
              Payload Content Sandbox
            </h4>
          </div>

          <div className="flex items-center gap-1 bg-cyber-surface/90 p-1 rounded-lg border border-cyber-border text-xs font-mono">
            <button
              onClick={() => setViewMode('html')}
              className={`px-3 py-1 rounded-md transition-all ${
                viewMode === 'html'
                  ? 'bg-cyber-panel text-cyber-emeraldBright font-bold border border-cyber-emerald/50 shadow-glowEmeraldSm'
                  : 'text-cyber-textMuted hover:text-cyber-textPrimary'
              }`}
            >
              Rendered HTML
            </button>
            <button
              onClick={() => setViewMode('text')}
              className={`px-3 py-1 rounded-md transition-all ${
                viewMode === 'text'
                  ? 'bg-cyber-panel text-cyber-emeraldBright font-bold border border-cyber-emerald/50 shadow-glowEmeraldSm'
                  : 'text-cyber-textMuted hover:text-cyber-textPrimary'
              }`}
            >
              Raw Text
            </button>
          </div>
        </div>

        {viewMode === 'html' && email.bodyHtml ? (
          <div className="border border-cyber-border rounded-lg overflow-hidden bg-white shadow-inner">
            <iframe
              srcDoc={email.bodyHtml}
              sandbox="allow-same-origin"
              title="Email HTML Preview"
              className="w-full h-80 sm:h-96 border-none"
            />
          </div>
        ) : (
          <pre className="p-4 bg-cyber-black border border-cyber-border rounded-lg text-xs font-mono text-cyber-textPrimary whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed select-all">
            {email.bodyText || 'No text content extracted'}
          </pre>
        )}
      </div>
    </div>
  );
};
