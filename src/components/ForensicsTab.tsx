'use client';

import React, { useState } from 'react';
import { ParsedEmailData } from '@/types';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Server,
  Link,
  Globe,
  Radio,
  Copy,
  Check,
  Terminal,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ForensicsTabProps {
  email: ParsedEmailData;
}

export const ForensicsTab: React.FC<ForensicsTabProps> = ({ email }) => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const getAuthBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold bg-cyber-emeraldDark/30 text-cyber-emeraldBright border border-cyber-emerald/60 shadow-glowEmeraldSm">
            <ShieldCheck className="w-3.5 h-3.5" />
            PASS
          </span>
        );
      case 'fail':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold bg-cyber-crimsonDark/30 text-cyber-crimsonBright border border-cyber-crimson/60 shadow-glowCrimsonSm">
            <ShieldX className="w-3.5 h-3.5" />
            FAIL
          </span>
        );
      case 'softfail':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold bg-cyber-amberDark/30 text-cyber-amberBright border border-cyber-amber/60">
            <ShieldAlert className="w-3.5 h-3.5" />
            SOFTFAIL
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold bg-cyber-surface text-cyber-textMuted border border-cyber-border">
            {status.toUpperCase()}
          </span>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* 1. Protocol Authentication Results */}
      <div className="corner-bracket bg-cyber-panel border border-cyber-border rounded-xl p-5 sm:p-6 shadow-panel">
        <div className="flex items-center justify-between border-b border-cyber-border/80 pb-3.5 mb-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyber-textPrimary font-mono flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyber-emerald" />
              RFC 8601 Protocol Authentication Audit
            </h4>
            <p className="text-xs text-cyber-textMuted mt-0.5 font-sans">
              Evaluated directly from RFC 8601 <code className="text-cyber-emerald font-mono">Authentication-Results</code> headers.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* SPF */}
          <div className="bg-cyber-surface/90 border border-cyber-border rounded-lg p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-cyber-textPrimary">SPF Protocol</span>
                {getAuthBadge(email.authenticationResults.spf.result)}
              </div>
              <p className="text-xs text-cyber-textSecondary leading-relaxed font-mono">
                {email.authenticationResults.spf.details || 'Sender Policy Framework evaluation'}
              </p>
            </div>
            <div className="mt-3.5 pt-2 border-t border-cyber-border text-[10px] text-cyber-textDim font-mono uppercase tracking-wider">
              RFC 7208 Path Verification
            </div>
          </div>

          {/* DKIM */}
          <div className="bg-cyber-surface/90 border border-cyber-border rounded-lg p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-cyber-textPrimary">DKIM Signature</span>
                {getAuthBadge(email.authenticationResults.dkim.result)}
              </div>
              <p className="text-xs text-cyber-textSecondary leading-relaxed font-mono">
                {email.authenticationResults.dkim.details || 'DomainKeys Identified Mail cryptographic signature'}
              </p>
            </div>
            <div className="mt-3.5 pt-2 border-t border-cyber-border text-[10px] text-cyber-textDim font-mono uppercase tracking-wider">
              RFC 6376 Cryptographic Validation
            </div>
          </div>

          {/* DMARC */}
          <div className="bg-cyber-surface/90 border border-cyber-border rounded-lg p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-cyber-textPrimary">DMARC Policy</span>
                {getAuthBadge(email.authenticationResults.dmarc.result)}
              </div>
              <p className="text-xs text-cyber-textSecondary leading-relaxed font-mono">
                {email.authenticationResults.dmarc.details || 'Domain-based Message Authentication & Conformance'}
              </p>
            </div>
            <div className="mt-3.5 pt-2 border-t border-cyber-border text-[10px] text-cyber-textDim font-mono uppercase tracking-wider">
              RFC 7489 Alignment Enforcement
            </div>
          </div>
        </div>

        {/* Raw Authentication Header */}
        <div className="mt-4 bg-cyber-black border border-cyber-border rounded-lg p-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-cyber-textMuted mb-1.5">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyber-emerald" />
              Raw Authentication-Results Header
            </span>
            <button
              onClick={() => copyToClipboard(email.authenticationResults.raw, 'rawAuth')}
              className="hover:text-cyber-textPrimary transition-colors flex items-center gap-1 text-xs"
            >
              {copiedItem === 'rawAuth' ? <Check className="w-3.5 h-3.5 text-cyber-emerald" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedItem === 'rawAuth' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="text-xs font-mono text-cyber-textSecondary break-all select-all">
            {email.authenticationResults.raw}
          </div>
        </div>
      </div>

      {/* 2. Received Hop Routing Ladder */}
      <div className="corner-bracket bg-cyber-panel border border-cyber-border rounded-xl p-5 sm:p-6 shadow-panel">
        <div className="flex items-center justify-between border-b border-cyber-border/80 pb-3.5 mb-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyber-textPrimary font-mono flex items-center gap-2">
              <Server className="w-4 h-4 text-cyber-emerald" />
              MTA Received Relay Hop Ladder ({email.receivedHops.length} Hops Traversed)
            </h4>
            <p className="text-xs text-cyber-textMuted mt-0.5 font-sans">
              Chronological mail transfer agent traversal reconstructed from message transmission headers.
            </p>
          </div>
        </div>

        {email.receivedHops.length === 0 ? (
          <p className="text-xs text-cyber-textMuted font-mono">No Received headers found in message.</p>
        ) : (
          <div className="space-y-2">
            {email.receivedHops.map((hop) => (
              <div
                key={hop.hopNumber}
                className="bg-cyber-surface/90 border border-cyber-border rounded-lg p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-cyber-panel text-cyber-emeraldBright font-bold flex items-center justify-center shrink-0 border border-cyber-border text-[11px]">
                    #{hop.hopNumber}
                  </span>
                  <div>
                    <div className="text-cyber-textPrimary">
                      <span className="text-cyber-textDim">From:</span> {hop.from || 'Unknown'}{' '}
                      <span className="text-cyber-textDim">By:</span> {hop.by || 'Unknown'}
                    </div>
                    {hop.date && (
                      <div className="text-[11px] text-cyber-textMuted mt-0.5">
                        Timestamp: {hop.date}
                      </div>
                    )}
                  </div>
                </div>

                {hop.ip && (
                  <div className="flex items-center gap-2 bg-cyber-panel px-3 py-1 rounded-md border border-cyber-border shrink-0">
                    <Radio className="w-3.5 h-3.5 text-cyber-crimsonBright" />
                    <span className="text-cyber-textPrimary select-all font-bold">{hop.ip}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Extracted URLs and Suspicious Signals */}
      <div className="corner-bracket bg-cyber-panel border border-cyber-border rounded-xl p-5 sm:p-6 shadow-panel">
        <div className="flex items-center justify-between border-b border-cyber-border/80 pb-3.5 mb-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyber-textPrimary font-mono flex items-center gap-2">
              <Link className="w-4 h-4 text-cyber-emerald" />
              Extracted Hyperlinks ({email.urls.length} Detected)
            </h4>
            <p className="text-xs text-cyber-textMuted mt-0.5 font-sans">
              Automated credential-harvesting lexical analysis and host domain resolution.
            </p>
          </div>
        </div>

        {email.urls.length === 0 ? (
          <p className="text-xs text-cyber-textMuted font-mono">No hyperlinks detected in email payload.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-cyber-surface/90 text-cyber-textMuted border-b border-cyber-border">
                <tr>
                  <th className="p-2.5 uppercase text-[10px]">Domain</th>
                  <th className="p-2.5 uppercase text-[10px]">Destination URL</th>
                  <th className="p-2.5 uppercase text-[10px]">Risk Assessment</th>
                  <th className="p-2.5 text-right uppercase text-[10px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-border/60">
                {email.urls.map((u, i) => (
                  <tr key={i} className="hover:bg-cyber-surface/50 transition-colors">
                    <td className="p-2.5 text-cyber-emerald font-semibold">{u.domain}</td>
                    <td className="p-2.5 text-cyber-textPrimary max-w-xs md:max-w-md truncate select-all" title={u.url}>
                      {u.url}
                    </td>
                    <td className="p-2.5">
                      {u.isSuspicious ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-cyber-crimsonDark/30 text-cyber-crimsonBright border border-cyber-crimson/50 font-bold">
                          CREDENTIAL VECTOR
                        </span>
                      ) : (
                        <span className="text-cyber-textDim text-[11px]">Neutral</span>
                      )}
                    </td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() => copyToClipboard(u.url, `url-${i}`)}
                        className="p-1 rounded hover:bg-cyber-panel text-cyber-textMuted hover:text-cyber-textPrimary transition-colors inline-flex items-center gap-1 text-[11px]"
                        title="Copy URL"
                      >
                        {copiedItem === `url-${i}` ? <Check className="w-3.5 h-3.5 text-cyber-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Extracted IOCs (IPs & Domains) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* IPs */}
        <div className="corner-bracket bg-cyber-panel border border-cyber-border rounded-xl p-5 shadow-panel">
          <h4 className="text-xs font-bold uppercase tracking-wider text-cyber-textPrimary font-mono flex items-center gap-2 mb-3">
            <Radio className="w-4 h-4 text-cyber-crimsonBright" />
            Extracted IP Addresses ({email.ips.length})
          </h4>
          <div className="space-y-1.5">
            {email.ips.length === 0 ? (
              <p className="text-xs text-cyber-textMuted font-mono">No IP addresses isolated.</p>
            ) : (
              email.ips.map((ip, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-cyber-surface/90 border border-cyber-border rounded-md text-xs font-mono"
                >
                  <span className="text-cyber-textPrimary select-all">{ip}</span>
                  <button
                    onClick={() => copyToClipboard(ip, `ip-${idx}`)}
                    className="text-cyber-textMuted hover:text-cyber-textPrimary p-0.5"
                  >
                    {copiedItem === `ip-${idx}` ? <Check className="w-3.5 h-3.5 text-cyber-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Domains */}
        <div className="corner-bracket bg-cyber-panel border border-cyber-border rounded-xl p-5 shadow-panel">
          <h4 className="text-xs font-bold uppercase tracking-wider text-cyber-textPrimary font-mono flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-cyber-amberBright" />
            Discovered Domain Assets ({email.domains.length})
          </h4>
          <div className="space-y-1.5">
            {email.domains.length === 0 ? (
              <p className="text-xs text-cyber-textMuted font-mono">No domains extracted.</p>
            ) : (
              email.domains.map((domain, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-cyber-surface/90 border border-cyber-border rounded-md text-xs font-mono"
                >
                  <span className="text-cyber-textPrimary select-all">{domain}</span>
                  <button
                    onClick={() => copyToClipboard(domain, `dom-${idx}`)}
                    className="text-cyber-textMuted hover:text-cyber-textPrimary p-0.5"
                  >
                    {copiedItem === `dom-${idx}` ? <Check className="w-3.5 h-3.5 text-cyber-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
