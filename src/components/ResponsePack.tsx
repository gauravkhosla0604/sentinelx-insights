'use client';

import React, { useState } from 'react';
import {
  ParsedEmailData,
  ThreatAnalysis,
  CampaignDnaResult,
} from '@/types';
import {
  FileSpreadsheet,
  Printer,
  CheckSquare,
  Square,
  Copy,
  Check,
  ShieldCheck,
  Terminal,
  AlertTriangle,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ResponsePackProps {
  email: ParsedEmailData;
  threat: ThreatAnalysis;
  campaign: CampaignDnaResult;
  filename?: string | null;
}

interface IocItem {
  type: 'IP' | 'Domain' | 'URL';
  value: string;
  source: string;
  caseId: string;
}

export const ResponsePack: React.FC<ResponsePackProps> = ({
  email,
  threat,
  campaign,
  filename,
}) => {
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const toggleAction = (id: string) => {
    setCompletedActions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Compile de-duplicated IOCs
  const iocs: IocItem[] = [];
  const seenIocValues = new Set<string>();

  const addIoc = (type: IocItem['type'], value: string, source: string, caseId: string) => {
    const cleanVal = value.trim();
    if (!cleanVal || seenIocValues.has(`${type}:${cleanVal}`)) return;
    seenIocValues.add(`${type}:${cleanVal}`);
    iocs.push({ type, value: cleanVal, source, caseId });
  };

  // Current Email IOCs
  email.ips.forEach((ip) => addIoc('IP', ip, 'RFC 822 Received Hop', 'CURRENT'));
  email.domains.forEach((dom) => addIoc('Domain', dom, 'Header Asset', 'CURRENT'));
  email.urls.forEach((u) => addIoc('URL', u.url, 'Message Body Anchor', 'CURRENT'));

  // Related Incident IOCs
  campaign.relatedIncidents.forEach((match) => {
    match.incident.ips.forEach((ip) => addIoc('IP', ip, 'Correlated Incident Relay', match.incident.caseId));
    match.incident.urlDomains.forEach((dom) => addIoc('Domain', dom, 'Historical Phish Domain', match.incident.caseId));
    match.incident.urls.forEach((url) => addIoc('URL', url, 'Historical Credential Link', match.incident.caseId));
  });

  const handleExportCsv = () => {
    const headers = ['type', 'value', 'source', 'caseId'];
    const rows = iocs.map((ioc) => [
      `"${ioc.type}"`,
      `"${ioc.value.replace(/"/g, '""')}"`,
      `"${ioc.source.replace(/"/g, '""')}"`,
      `"${ioc.caseId}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SentinelX-IOC-Export-${campaign.matchedCampaign || 'INCIDENT'}-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const analystActions = [
    {
      id: 'action-1',
      title: 'Query Organization Mailboxes for Cluster Spread',
      description: `Execute enterprise SIEM/M365 compliance search for sender domains (${email.domains.slice(0, 2).join(', ')}) and subjects matching "${email.subject.substring(0, 45)}...".`,
    },
    {
      id: 'action-2',
      title: 'Submit Perimeter DNS / Web Proxy Block Request',
      description: `Review and push block policies for confirmed deceptive domain assets (${email.domains.join(', ')}) and external credential destinations.`,
    },
    {
      id: 'action-3',
      title: 'Notify and Quarantine Targeted Mailboxes',
      description: `Alert recipients (${email.to.map((t) => t.address).join(', ') || 'targeted users'}) and revoke any compromised session tokens.`,
    },
    {
      id: 'action-4',
      title: 'Audit Web Gateway Logs for Link Clicks',
      description: 'Cross-reference firewall and proxy outbound traffic logs to isolate internal IP addresses that executed HTTP requests to the credential harvesting portals.',
    },
    {
      id: 'action-5',
      title: 'Enforce Mandatory Active Directory Password Reset',
      description: 'If telemetry indicates form submission on credential harvesting domains, immediately trigger self-service MFA reset and Active Directory credential rotation.',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Action Toolbar */}
      <div className="corner-bracket flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-cyber-panel border border-cyber-border p-4 sm:p-5 rounded-xl font-mono text-xs print:hidden shadow-panel">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyber-textPrimary flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyber-emerald" />
            Response Pack & Incident Remediation Dossier
          </h3>
          <p className="text-xs text-cyber-textMuted mt-0.5 font-sans">
            Defensive countermeasures, de-duplicated IOC artifact export, and printable forensic dossier.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-cyber-surface hover:bg-cyber-panelHover text-cyber-textPrimary border border-cyber-border hover:border-cyber-borderHighlight font-semibold transition-all"
            title="Download CSV file of all IOCs"
          >
            <FileSpreadsheet className="w-4 h-4 text-cyber-emerald" />
            <span>Export IOC CSV</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-cyber-emerald to-cyber-teal hover:from-cyber-emeraldBright hover:to-cyber-tealBright text-cyber-black font-bold shadow-glowEmerald transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="Print or save PDF forensic report"
          >
            <Printer className="w-4 h-4" />
            <span>Print Forensic Report</span>
          </button>
        </div>
      </div>

      {/* Printable Report Container */}
      <div id="forensic-report-content" className="space-y-5">
        {/* Print-only Header */}
        <div className="hidden print:block border-b-2 border-black pb-4 mb-4">
          <h1 className="text-xl font-bold font-mono">SENTINELX // FORENSIC THREAT DOSSIER</h1>
          <p className="text-xs text-gray-600">
            Email Threat Investigation & Campaign Reconstruction Platform · SIH 26106
          </p>
          <div className="text-[10px] font-mono text-gray-500 mt-1">
            Generated: {new Date().toUTCString()} | Artifact: {filename || 'email.eml'}
          </div>
        </div>

        {/* 1. Investigation Summary */}
        <div className="corner-bracket bg-cyber-panel border border-cyber-border rounded-xl p-5 shadow-panel print:border-gray-400 print:bg-white print:text-black">
          <h4 className="text-xs font-mono uppercase tracking-wider text-cyber-textPrimary font-bold mb-3.5 print:text-black">
            1. Investigation Summary & Telemetry Overview
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
            <div className="bg-cyber-surface/90 p-3 rounded-lg border border-cyber-border print:bg-gray-100 print:border-gray-300">
              <span className="text-cyber-textDim text-[10px] uppercase block print:text-gray-600">Threat Rating</span>
              <span className="text-cyber-crimsonBright font-bold text-sm print:text-red-700">
                {threat.score}/100 [{threat.level}]
              </span>
            </div>

            <div className="bg-cyber-surface/90 p-3 rounded-lg border border-cyber-border print:bg-gray-100 print:border-gray-300">
              <span className="text-cyber-textDim text-[10px] uppercase block print:text-gray-600">Classification</span>
              <span className="text-cyber-textPrimary font-bold text-sm print:text-black">
                {campaign.attackType}
              </span>
            </div>

            <div className="bg-cyber-surface/90 p-3 rounded-lg border border-cyber-border print:bg-gray-100 print:border-gray-300">
              <span className="text-cyber-textDim text-[10px] uppercase block print:text-gray-600">Targeted Brand</span>
              <span className="text-cyber-emeraldBright font-bold text-sm print:text-blue-800">
                {campaign.impersonatedBrand}
              </span>
            </div>

            <div className="bg-cyber-surface/90 p-3 rounded-lg border border-cyber-border print:bg-gray-100 print:border-gray-300">
              <span className="text-cyber-textDim text-[10px] uppercase block print:text-gray-600">Campaign Cluster</span>
              <span className="text-cyber-violet font-bold text-sm print:text-blue-900">
                {campaign.matchedCampaign || 'N/A'}
              </span>
            </div>

            <div className="bg-cyber-surface/90 p-3 rounded-lg border border-cyber-border print:bg-gray-100 print:border-gray-300">
              <span className="text-cyber-textDim text-[10px] uppercase block print:text-gray-600">DNA Match</span>
              <span className="text-cyber-textPrimary font-bold text-sm print:text-black">
                {campaign.matchPercentage}%
              </span>
            </div>

            <div className="bg-cyber-surface/90 p-3 rounded-lg border border-cyber-border print:bg-gray-100 print:border-gray-300">
              <span className="text-cyber-textDim text-[10px] uppercase block print:text-gray-600">Linked Cases</span>
              <span className="text-cyber-textPrimary font-bold text-sm print:text-black">
                {campaign.relatedIncidentsCount} Incidents
              </span>
            </div>

            <div className="bg-cyber-surface/90 p-3 rounded-lg border border-cyber-border print:bg-gray-100 print:border-gray-300">
              <span className="text-cyber-textDim text-[10px] uppercase block print:text-gray-600">SPF / DKIM / DMARC</span>
              <span className="text-cyber-crimsonBright font-bold text-sm print:text-red-700">
                FAIL / FAIL / FAIL
              </span>
            </div>

            <div className="bg-cyber-surface/90 p-3 rounded-lg border border-cyber-border print:bg-gray-100 print:border-gray-300">
              <span className="text-cyber-textDim text-[10px] uppercase block print:text-gray-600">Extracted IOCs</span>
              <span className="text-cyber-textPrimary font-bold text-sm print:text-black">
                {iocs.length} Artifacts
              </span>
            </div>
          </div>
        </div>

        {/* 2. Indicators of Compromise */}
        <div className="corner-bracket bg-cyber-panel border border-cyber-border rounded-xl p-5 shadow-panel print:border-gray-400 print:bg-white print:text-black">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-cyber-textPrimary font-bold print:text-black">
              2. De-duplicated Indicators of Compromise ({iocs.length} Objects)
            </h4>
            <span className="text-[11px] font-mono text-cyber-textDim print:hidden">
              De-duplicated across active and historical campaign cases
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-cyber-surface/90 text-cyber-textMuted border-b border-cyber-border">
                <tr>
                  <th className="p-2.5 text-[10px] uppercase">Type</th>
                  <th className="p-2.5 text-[10px] uppercase">Indicator Value</th>
                  <th className="p-2.5 text-[10px] uppercase">Context</th>
                  <th className="p-2.5 text-[10px] uppercase">Case Origin</th>
                  <th className="p-2.5 text-right text-[10px] uppercase print:hidden">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyber-border/60 print:divide-gray-300">
                {iocs.map((ioc, idx) => (
                  <tr key={idx} className="hover:bg-cyber-surface/50 transition-colors">
                    <td className="p-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          ioc.type === 'IP'
                            ? 'bg-cyber-crimsonDark/30 text-cyber-crimsonBright border-cyber-crimson/50'
                            : ioc.type === 'Domain'
                            ? 'bg-cyber-amberDark/30 text-cyber-amberBright border-cyber-amber/50'
                            : 'bg-cyber-violetDim text-cyber-violet border-cyber-violet/50'
                        }`}
                      >
                        {ioc.type}
                      </span>
                    </td>
                    <td className="p-2.5 text-cyber-textPrimary font-semibold select-all print:text-black truncate max-w-xs md:max-w-md">
                      {ioc.value}
                    </td>
                    <td className="p-2.5 text-cyber-textSecondary print:text-gray-700 text-xs">{ioc.source}</td>
                    <td className="p-2.5 text-cyber-emeraldBright print:text-blue-800">{ioc.caseId}</td>
                    <td className="p-2.5 text-right print:hidden">
                      <button
                        onClick={() => copyToClipboard(ioc.value, `ioc-${idx}`)}
                        className="text-cyber-textMuted hover:text-cyber-textPrimary p-1 rounded hover:bg-cyber-surface"
                        title="Copy Indicator"
                      >
                        {copiedKey === `ioc-${idx}` ? (
                          <Check className="w-3.5 h-3.5 text-cyber-emerald" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Correlated Campaign Cases */}
        <div className="corner-bracket bg-cyber-panel border border-cyber-border rounded-xl p-5 shadow-panel print:border-gray-400 print:bg-white print:text-black">
          <h4 className="text-xs font-mono uppercase tracking-wider text-cyber-textPrimary font-bold mb-3 print:text-black">
            3. Correlated Campaign Cases
          </h4>
          <div className="space-y-2">
            {campaign.relatedIncidents.map((m) => (
              <div
                key={m.incident.caseId}
                className="bg-cyber-surface/90 border border-cyber-border p-3 rounded-lg text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 print:bg-gray-50 print:border-gray-300 print:text-black"
              >
                <div>
                  <span className="text-cyber-emeraldBright font-bold print:text-blue-800">{m.incident.caseId}</span> —{' '}
                  <span className="text-cyber-textPrimary print:text-black">{m.incident.subject}</span>
                </div>
                <div className="text-cyber-textMuted text-[11px] print:text-gray-700 shrink-0">
                  {m.reasons[0] || 'Infrastructure match'} ({m.strength})
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Recommended Analyst Actions */}
        <div className="corner-bracket bg-cyber-panel border border-cyber-border rounded-xl p-5 shadow-panel print:border-gray-400 print:bg-white print:text-black">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-cyber-textPrimary font-bold print:text-black">
              4. Recommended SOC Analyst Containment Actions
            </h4>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-cyber-amberDark/30 text-cyber-amberBright border border-cyber-amber/50 print:hidden">
              Human-in-the-Loop Authority Required
            </span>
          </div>
          <p className="text-xs text-cyber-textMuted mb-3.5 print:text-gray-600 font-sans">
            SentinelX automates forensic extraction, but policy enforcement remains strictly under certified analyst authorization.
          </p>

          <div className="space-y-2.5">
            {analystActions.map((act) => {
              const isDone = Boolean(completedActions[act.id]);
              return (
                <div
                  key={act.id}
                  onClick={() => toggleAction(act.id)}
                  className={`p-3 rounded-lg border text-xs font-mono cursor-pointer transition-all flex items-start gap-3 ${
                    isDone
                      ? 'bg-cyber-emeraldDark/20 border-cyber-emerald/60 print:bg-gray-100'
                      : 'bg-cyber-surface/90 border-cyber-border hover:border-cyber-borderHighlight print:bg-white print:border-gray-300'
                  }`}
                >
                  <button className="mt-0.5 text-cyber-textMuted print:hidden">
                    {isDone ? (
                      <CheckSquare className="w-4 h-4 text-cyber-emerald" />
                    ) : (
                      <Square className="w-4 h-4 text-cyber-textDim" />
                    )}
                  </button>
                  <div className="flex-1">
                    <h5
                      className={`font-semibold ${
                        isDone ? 'text-cyber-emeraldBright line-through' : 'text-cyber-textPrimary'
                      } print:text-black text-xs`}
                    >
                      {act.title}
                    </h5>
                    <p className="text-cyber-textSecondary text-[11px] mt-0.5 print:text-gray-700 font-sans">
                      {act.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
