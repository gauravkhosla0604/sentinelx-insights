import type { CampaignDnaResult, ParsedEmailData, ThreatAnalysis } from "@/types";

export interface AttackStoryStep {
  id: string;
  title: string;
  explanation: string;
  evidence: string;
}

const NA = "Not available";

function factor(threat: ThreatAnalysis, id: string) {
  return threat.factors.find((f) => f.triggered && f.id === id);
}

function credentialRequestEvidence(email: ParsedEmailData): string | null {
  const flagged = email.urls.filter((u) => u.flags.includes("credential_harvesting_keyword"));
  if (flagged.length) {
    return flagged[0].url;
  }
  const text = `${email.subject} ${email.bodyText}`;
  const match = text.match(
    /(?:password|credentials|verify your (?:account|identity)|sign in|login to)/i,
  );
  return match ? `Message language: "${match[0]}"` : null;
}

/** Build an evidence-backed attack chain. Steps are omitted when unsupported. */
export function buildAttackStory(
  email: ParsedEmailData,
  threat: ThreatAnalysis,
  campaign?: CampaignDnaResult | null,
): AttackStoryStep[] {
  const steps: AttackStoryStep[] = [];

  const sender = email.from.address || NA;
  steps.push({
    id: "email",
    title: "Suspicious Email",
    explanation: `Inbound message "${email.subject || NA}" is the starting artifact for this investigation.`,
    evidence: `From: ${sender}`,
  });

  const impersonation = factor(threat, "lookalike_domain");
  const brand = threat.impersonatedBrand;
  if (impersonation || brand) {
    steps.push({
      id: "impersonation",
      title: "Impersonation",
      explanation: brand
        ? `Sender infrastructure mimics ${brand.brand} (${brand.legitimateDomain}) using a lookalike domain.`
        : impersonation?.explanation || "Sender identity does not match the claimed organization.",
      evidence: impersonation?.evidence || brand?.lookalikeDomain || NA,
    });
  } else if (factor(threat, "reply_to_mismatch")) {
    const f = factor(threat, "reply_to_mismatch")!;
    steps.push({
      id: "impersonation",
      title: "Impersonation",
      explanation: "Reply routing diverges from the apparent sender, a common impersonation pattern.",
      evidence: f.evidence || NA,
    });
  }

  const urgency = factor(threat, "social_engineering");
  if (urgency) {
    steps.push({
      id: "social",
      title: "Social Engineering",
      explanation: "The message uses urgency and pressure to make the recipient act before verifying the sender.",
      evidence: urgency.evidence || NA,
    });
  }

  const urlFactor = factor(threat, "suspicious_url");
  const suspiciousUrls = email.urls.filter((u) => u.isSuspicious);
  if (urlFactor || suspiciousUrls.length) {
    const sample = suspiciousUrls[0]?.url || urlFactor?.evidence || NA;
    const claimed = brand?.legitimateDomain;
    steps.push({
      id: "link",
      title: "Suspicious Link",
      explanation: claimed
        ? `Destination domain does not match the organization referenced in the email (${claimed}).`
        : "A link in the message points to infrastructure associated with credential harvesting or an unusual host.",
      evidence: sample,
    });
  }

  const credEvidence = credentialRequestEvidence(email);
  if (credEvidence) {
    steps.push({
      id: "credential",
      title: "Credential Theft",
      explanation:
        "The lure asks the recipient to authenticate or submit account details, which would hand credentials to the attacker.",
      evidence: credEvidence,
    });
  }

  if (email.attachments.length > 0) {
    steps.push({
      id: "attachment",
      title: "Attachment-Based Threat",
      explanation: "The message includes file attachments that should be treated as untrusted until independently verified.",
      evidence: email.attachments.map((a) => a.filename).join(", ") || NA,
    });
  }

  const hasAttackPath = steps.some((s) =>
    ["impersonation", "social", "link", "credential", "attachment"].includes(s.id),
  );
  if (hasAttackPath && (threat.level === "HIGH" || threat.level === "CRITICAL" || credEvidence)) {
    steps.push({
      id: "impact",
      title: "Potential Account Compromise",
      explanation:
        campaign?.attackType && campaign.attackType !== "Informational"
          ? `If the recipient follows the lure, the likely outcome is ${campaign.attackType.toLowerCase()} and unauthorized mailbox or account access.`
          : "If the recipient follows the lure, an attacker could obtain account access or persist inside the organisation.",
      evidence: `Threat level ${threat.level} · score ${threat.score}/100`,
    });
  }

  return steps;
}

export function attackStoryPlainText(steps: AttackStoryStep[]): string {
  return steps
    .map((s, i) => `${i + 1}. ${s.title}\n   ${s.explanation}\n   Evidence: ${s.evidence}`)
    .join("\n\n");
}
