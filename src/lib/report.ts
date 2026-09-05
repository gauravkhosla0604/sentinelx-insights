import type {
  ParsedEmailData,
  ThreatAnalysis,
  CampaignDnaResult,
  AiAnalysisResult,
  EvidenceMetadata,
} from "@/types";
import { incidentIdFromHash } from "./evidence";

const NA = "Not available";

function esc(value: unknown): string {
  const s = value === null || value === undefined || value === "" ? NA : String(value);
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rows(pairs: Array<[string, unknown]>): string {
  return pairs
    .map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`)
    .join("");
}

function list(items: string[], empty = "Insufficient evidence"): string {
  if (!items.length) return `<p class="muted">${empty}</p>`;
  return `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
}

export interface ReportInput {
  email: ParsedEmailData;
  threat: ThreatAnalysis;
  campaign: CampaignDnaResult | null;
  ai: AiAnalysisResult | null;
  evidence: EvidenceMetadata | null;
}

export function buildReportHtml({ email, threat, campaign, ai, evidence }: ReportInput): string {
  const incidentId = evidence
    ? incidentIdFromHash(evidence.sha256, evidence.analyzedAt)
    : "SX-INC-UNREGISTERED";

  const factors = threat.factors.filter((f) => f.triggered);

  const scoreRows = factors.length
    ? factors
        .map(
          (f) => `<tr>
            <td class="mono">+${f.points}</td>
            <td><strong>${esc(f.title)}</strong><br/><span class="muted">${esc(f.explanation)}</span></td>
            <td class="mono up">${esc(f.severity)}</td>
            <td class="mono small">${esc(f.evidence)}</td>
          </tr>`,
        )
        .join("")
    : `<tr><td colspan="4" class="muted">No scoring factors triggered — insufficient evidence of malicious intent.</td></tr>`;

  const timeline: string[] = [];
  if (email.date) timeline.push(`${new Date(email.date).toUTCString()} — Message composed/sent`);
  email.receivedHops.forEach((hop) => {
    timeline.push(
      `${hop.date || "Unknown time"} — Hop ${hop.hopNumber}: from ${hop.from || NA} by ${hop.by || NA}${hop.ip ? ` [${hop.ip}]` : ""}`,
    );
  });
  if (evidence) timeline.push(`${new Date(evidence.analyzedAt).toUTCString()} — Ingested and analyzed by SentinelX`);
  (campaign?.relatedIncidents || []).forEach((m) =>
    timeline.push(
      `${m.incident.timestamp} — Related historical incident ${m.incident.caseId} (${m.strength} match): ${m.incident.subject}`,
    ),
  );

  const recommended = [
    `Quarantine the message and any copies matching subject "${email.subject}"`,
    email.domains.length
      ? `Block sender/link domains: ${email.domains.join(", ")}`
      : "Block malicious domains: none extracted",
    email.urls.length
      ? `Block URLs: ${email.urls.map((u) => u.url).join(", ")}`
      : "Block malicious URLs: none extracted",
    email.ips.length ? `Block/monitor infrastructure IPs: ${email.ips.join(", ")}` : "Block IPs: none extracted",
    "Search organisation mailboxes for related emails from the same campaign infrastructure",
    `Investigate affected users${email.to.length ? `: ${email.to.map((t) => t.address).join(", ")}` : ""} and rotate credentials if links were clicked`,
    "Preserve the original .eml artifact together with its SHA-256 hash for chain of custody",
  ];

  const campaignSection = campaign
    ? `
    ${rows([
      ["Campaign", campaign.campaignName],
      ["Campaign ID", campaign.matchedCampaign],
      ["Match", campaign.matchedCampaign ? `${campaign.matchPercentage}%` : "No campaign match"],
      ["Related incidents", campaign.relatedIncidentsCount],
      ["Attack type", campaign.attackType],
      ["Impersonated brand", campaign.impersonatedBrand],
      ["Status", campaign.statusNote],
    ])}`
    : rows([["Campaign correlation", NA]]);

  const relatedRows = (campaign?.relatedIncidents || [])
    .map(
      (m) => `<tr>
        <td class="mono">${esc(m.incident.caseId)}</td>
        <td>${esc(m.incident.subject)}</td>
        <td class="mono">${esc(m.incident.sender)}</td>
        <td class="mono up">${esc(m.strength)}</td>
        <td class="small">${esc(m.reasons.join("; "))}</td>
      </tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/>
<title>SentinelX Incident Report — ${esc(incidentId)}</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { font-family: ui-sans-serif, "Segoe UI", Roboto, sans-serif; color:#0f172a; background:#f8fafc; margin:0; padding:32px; }
  .sheet { max-width: 900px; margin:0 auto; background:#fff; padding:40px; border:1px solid #e2e8f0; }
  h1 { font-size:22px; margin:0 0 4px; letter-spacing:.06em; }
  h2 { font-size:14px; text-transform:uppercase; letter-spacing:.12em; margin:28px 0 10px; border-bottom:2px solid #0f172a; padding-bottom:6px; }
  .head { display:flex; justify-content:space-between; gap:16px; border-bottom:3px solid #0f172a; padding-bottom:14px; }
  .badge { display:inline-block; padding:6px 12px; border-radius:4px; font-weight:700; letter-spacing:.08em; color:#fff; }
  .CRITICAL{background:#b91c1c} .HIGH{background:#c2410c} .SUSPICIOUS{background:#a16207} .LOW{background:#15803d}
  table { width:100%; border-collapse:collapse; font-size:12px; }
  th,td { border:1px solid #e2e8f0; padding:7px 9px; text-align:left; vertical-align:top; }
  th { background:#f1f5f9; width:190px; font-weight:600; }
  table.grid th { width:auto; }
  .mono { font-family: ui-monospace, Menlo, Consolas, monospace; }
  .small { font-size:11px; }
  .up { text-transform:uppercase; }
  .muted { color:#64748b; }
  ul { margin:6px 0; padding-left:18px; font-size:12px; }
  li { margin:3px 0; }
  .score { font-size:44px; font-weight:800; line-height:1; }
  footer { margin-top:32px; border-top:1px solid #e2e8f0; padding-top:10px; font-size:11px; color:#64748b; }
  @media print { body { background:#fff; padding:0 } .sheet { border:none; padding:0 } }
</style></head>
<body><div class="sheet">
  <div class="head">
    <div>
      <h1>SENTINELX INCIDENT REPORT</h1>
      <div class="muted small">Email Threat Investigation &amp; Campaign Reconstruction · SIH 26106</div>
      <div class="mono small" style="margin-top:8px">Incident ID: ${esc(incidentId)}</div>
      <div class="mono small">Generated: ${esc(new Date().toUTCString())}</div>
    </div>
    <div style="text-align:right">
      <div class="score">${esc(threat.score)}<span class="muted" style="font-size:16px">/100</span></div>
      <div class="badge ${esc(threat.level)}">${esc(threat.level)}</div>
    </div>
  </div>

  <h2>1. Email Information</h2>
  <table>${rows([
    ["Sender", email.from.address ? `${email.from.name || ""} <${email.from.address}>` : NA],
    ["Recipient(s)", email.to.map((t) => t.address).join(", ")],
    ["Subject", email.subject],
    ["Timestamp", email.date ? new Date(email.date).toUTCString() : NA],
    ["Message-ID", email.messageId],
  ])}</table>

  <h2>2. Forensic Findings</h2>
  <table>${rows([
    ["SPF", `${email.authenticationResults.spf.result.toUpperCase()} — ${email.authenticationResults.spf.details || NA}`],
    ["DKIM", `${email.authenticationResults.dkim.result.toUpperCase()} — ${email.authenticationResults.dkim.details || NA}`],
    ["DMARC", `${email.authenticationResults.dmarc.result.toUpperCase()} — ${email.authenticationResults.dmarc.details || NA}`],
    ["Reply-To", email.replyTo?.address],
    ["Return-Path", email.returnPath],
    ["Received hops", email.receivedHops.length],
    ["Attachments", email.attachments.map((a) => `${a.filename} (${a.contentType})`).join(", ")],
  ])}</table>

  <h2>3. Indicators of Compromise</h2>
  <table>
    <tr><th>IP addresses</th><td>${email.ips.length ? esc(email.ips.join(", ")) : `<span class="muted">${NA}</span>`}</td></tr>
    <tr><th>Domains</th><td>${email.domains.length ? esc(email.domains.join(", ")) : `<span class="muted">${NA}</span>`}</td></tr>
    <tr><th>URLs</th><td class="small">${email.urls.length ? email.urls.map((u) => esc(u.url)).join("<br/>") : `<span class="muted">${NA}</span>`}</td></tr>
  </table>

  <h2>4. Threat Assessment</h2>
  <table>${rows([
    ["Threat score", `${threat.score} / 100`],
    ["Severity", threat.level],
    ["Authentication subtotal", threat.breakdown.authScore],
    ["Domain subtotal", threat.breakdown.domainScore],
    ["URL subtotal", threat.breakdown.urlScore],
    ["Content subtotal", threat.breakdown.contentScore],
  ])}</table>
  <table class="grid" style="margin-top:10px">
    <tr><th>Points</th><th>Finding</th><th>Severity</th><th>Evidence source</th></tr>
    ${scoreRows}
  </table>
  ${ai ? `<p class="small"><strong>Analyst interpretation (${esc(ai.modelUsed)}):</strong> ${esc(ai.summary)}</p>` : ""}

  <h2>5. Campaign Intelligence</h2>
  <table>${campaignSection}</table>
  ${
    relatedRows
      ? `<table class="grid" style="margin-top:10px"><tr><th>Case ID</th><th>Subject</th><th>Sender</th><th>Match</th><th>Shared indicators</th></tr>${relatedRows}</table>`
      : `<p class="muted">No related historical incidents identified.</p>`
  }

  <h2>6. Attack Timeline</h2>
  ${list(timeline, "Insufficient evidence to reconstruct a timeline")}

  <h2>7. Evidence Integrity</h2>
  <table>${rows([
    ["Evidence ID", evidence?.evidenceId],
    ["Original artifact", evidence?.filename],
    ["Size (bytes)", evidence?.sizeBytes],
    ["SHA-256", evidence?.sha256],
    ["Analysis timestamp", evidence ? new Date(evidence.analyzedAt).toUTCString() : NA],
  ])}</table>
  <p class="small muted">Hash computed over the original uploaded artifact prior to processing. The original evidence file is never modified by SentinelX.</p>

  <h2>8. Recommended Actions</h2>
  ${list(recommended)}

  <footer>SENTINELX // Traditional tools analyze emails. SentinelX reconstructs campaigns. · All values in this report are derived from the analyzed artifact and the local historical incident dataset.</footer>
</div></body></html>`;
}
