import { ParsedEmailData, ThreatAnalysis, ThreatFactor, ThreatSeverity } from '@/types';
import { extractDomainFromEmail } from './utils';

// Protected domains to defend against lookalikes
export const PROTECTED_DOMAINS = [
  'microsoft.com',
  'google.com',
  'paypal.com',
  'sbi.co.in',
  'hdfcbank.com',
];

// Levenshtein distance algorithm for fuzzy string matching
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Check if a candidate domain looks like any protected domain
export function checkLookalikeDomain(candidateDomain: string): {
  isLookalike: boolean;
  protectedDomain: string;
  brand: string;
  reason: string;
} | null {
  if (!candidateDomain) return null;
  const candidate = candidateDomain.toLowerCase();

  for (const protectedDom of PROTECTED_DOMAINS) {
    if (candidate === protectedDom) {
      continue; // Exact match is the authentic domain itself
    }

    const brand = protectedDom.split('.')[0]; // e.g., "microsoft", "sbi", "hdfcbank"

    // 1. Check for homoglyph / visual substitutions: '0' for 'o', '1' for 'l' or 'i', 'vv' for 'w'
    const normalizedCandidate = candidate
      .replace(/0/g, 'o')
      .replace(/1/g, 'l')
      .replace(/vv/g, 'w');

    // If candidate domain contains the brand with hyphenated suffix/prefix (e.g. micros0ft-support-auth.com)
    if (
      normalizedCandidate.includes(brand) &&
      !candidate.endsWith(`.${protectedDom}`)
    ) {
      return {
        isLookalike: true,
        protectedDomain: protectedDom,
        brand: brand.toUpperCase(),
        reason: `Domain contains protected brand "${brand}" with deceptive prefix/suffix or substitution: "${candidateDomain}"`,
      };
    }

    // 2. Check Levenshtein distance on base domain name
    const candidateBase = candidate.split('.')[0];
    if (candidateBase.length >= 3 && Math.abs(candidateBase.length - brand.length) <= 3) {
      const dist = levenshteinDistance(candidateBase, brand);
      if (dist > 0 && dist <= 2) {
        return {
          isLookalike: true,
          protectedDomain: protectedDom,
          brand: brand.toUpperCase(),
          reason: `Typo-squatting detected (edit distance ${dist}) mimicking "${protectedDom}": "${candidateDomain}"`,
        };
      }
    }
  }

  return null;
}

const URGENCY_PATTERNS = [
  /account\s+(?:suspension|suspended|locked|terminated|disabled)/i,
  /immediate\s+action\s+required/i,
  /action\s+required/i,
  /verify\s+your\s+(?:account|identity|credentials|access)/i,
  /security\s+alert/i,
  /unauthorized\s+(?:access|activity|sign-in)/i,
  /within\s+(?:24|48|12)\s+hours/i,
  /password\s+expires?/i,
  /urgent\s+notice/i,
  /critical\s+warning/i,
];

export function analyzeThreat(email: ParsedEmailData): ThreatAnalysis {
  const factors: ThreatFactor[] = [];
  const senderDomain = extractDomainFromEmail(email.from.address);
  const replyToDomain = email.replyTo?.address ? extractDomainFromEmail(email.replyTo.address) : '';
  const returnPathDomain = email.returnPath ? extractDomainFromEmail(email.returnPath) : '';

  let authScore = 0;
  let domainScore = 0;
  let urlScore = 0;
  let contentScore = 0;

  // 1. SPF Fail (+15)
  const spfStatus = email.authenticationResults.spf.result;
  const isSpfFail = spfStatus === 'fail' || spfStatus === 'softfail' || spfStatus === 'permerror';
  if (isSpfFail) {
    authScore += 15;
    factors.push({
      id: 'spf_fail',
      title: 'SPF Authentication Failure',
      category: 'authentication',
      points: 15,
      triggered: true,
      severity: 'high',
      evidence: `SPF Result: ${spfStatus.toUpperCase()} (${email.authenticationResults.spf.details || 'Sender IP unverified'})`,
      explanation: 'Sender IP is not permitted by the transmitting domain SPF policy, indicating unauthorized relay or spoofed origin.',
    });
  }

  // 2. DKIM Fail (+15)
  const dkimStatus = email.authenticationResults.dkim.result;
  const isDkimFail = dkimStatus === 'fail' || dkimStatus === 'permerror';
  if (isDkimFail) {
    authScore += 15;
    factors.push({
      id: 'dkim_fail',
      title: 'DKIM Signature Failure',
      category: 'authentication',
      points: 15,
      triggered: true,
      severity: 'high',
      evidence: `DKIM Result: ${dkimStatus.toUpperCase()} (${email.authenticationResults.dkim.details || 'Signature validation failed'})`,
      explanation: 'Cryptographic DKIM signature missing, invalid, or tampered with in transit. Domain integrity cannot be guaranteed.',
    });
  }

  // 3. DMARC Fail (+20)
  const dmarcStatus = email.authenticationResults.dmarc.result;
  const isDmarcFail = dmarcStatus === 'fail' || dmarcStatus === 'permerror';
  if (isDmarcFail) {
    authScore += 20;
    factors.push({
      id: 'dmarc_fail',
      title: 'DMARC Policy Rejection',
      category: 'authentication',
      points: 20,
      triggered: true,
      severity: 'critical',
      evidence: `DMARC Result: ${dmarcStatus.toUpperCase()} (${email.authenticationResults.dmarc.details || 'Domain alignment check failed'})`,
      explanation: 'DMARC alignment check failed. The sender address does not align with validated SPF/DKIM domains, violating publication policy.',
    });
  }

  // 4. Reply-To Domain Mismatch (+10)
  if (replyToDomain && senderDomain && replyToDomain !== senderDomain) {
    domainScore += 10;
    factors.push({
      id: 'reply_to_mismatch',
      title: 'Reply-To Routing Divergence',
      category: 'domain',
      points: 10,
      triggered: true,
      severity: 'medium',
      evidence: `From Domain: "${senderDomain}" ≠ Reply-To Domain: "${replyToDomain}"`,
      explanation: 'Responses will be routed to an external destination distinct from the apparent sender, typical in credential interception campaigns.',
    });
  }

  // 5. Return-Path Mismatch (+5)
  if (returnPathDomain && senderDomain && returnPathDomain !== senderDomain) {
    domainScore += 5;
    factors.push({
      id: 'return_path_mismatch',
      title: 'Return-Path Domain Mismatch',
      category: 'domain',
      points: 5,
      triggered: true,
      severity: 'low',
      evidence: `From Domain: "${senderDomain}" ≠ Return-Path: "${returnPathDomain}"`,
      explanation: 'Envelope sender bounce route is decoupled from the header sender, suggesting external mailer relay infrastructure.',
    });
  }

  // 6. Lookalike Domain (+15)
  let lookalikeHit: ReturnType<typeof checkLookalikeDomain> = null;
  for (const dom of email.domains) {
    const hit = checkLookalikeDomain(dom);
    if (hit) {
      lookalikeHit = hit;
      break;
    }
  }

  if (lookalikeHit) {
    domainScore += 15;
    factors.push({
      id: 'lookalike_domain',
      title: 'Targeted Brand Lookalike Domain',
      category: 'domain',
      points: 15,
      triggered: true,
      severity: 'critical',
      evidence: lookalikeHit.reason,
      explanation: `Deceptive domain engineering designed to impersonate protected enterprise infrastructure (${lookalikeHit.protectedDomain}).`,
    });
  }

  // 7. Suspicious Credential/Login URL (+10)
  const suspiciousUrls = email.urls.filter((u) => u.isSuspicious);
  if (suspiciousUrls.length > 0) {
    urlScore += 10;
    const sampleUrl = suspiciousUrls[0].url;
    factors.push({
      id: 'suspicious_url',
      title: 'Credential Harvesting Link Vector',
      category: 'url',
      points: 10,
      triggered: true,
      severity: 'high',
      evidence: `Identified ${suspiciousUrls.length} suspicious link(s). Target: ${sampleUrl}`,
      explanation: 'Embedded hyperlink targets login verification, authentication prompts, or raw IP infrastructure, characteristic of credential harvesters.',
    });
  }

  // 8. Social-Engineering Signal (+10)
  const fullContent = `${email.subject} ${email.bodyText}`;
  const matchedUrgency: string[] = [];
  for (const pattern of URGENCY_PATTERNS) {
    const m = fullContent.match(pattern);
    if (m) {
      matchedUrgency.push(m[0]);
    }
  }

  if (matchedUrgency.length > 0) {
    contentScore += 10;
    factors.push({
      id: 'social_engineering',
      title: 'Psychological Urgency & Coercion Signal',
      category: 'content',
      points: 10,
      triggered: true,
      severity: 'medium',
      evidence: `Trigger phrases detected: "${matchedUrgency.slice(0, 3).join('", "')}"`,
      explanation: 'High-pressure phrasing (account suspension, immediate action, deadline coercion) utilized to induce urgency and bypass protocol.',
    });
  }

  // Calculate total score capped at 100
  const rawScore = authScore + domainScore + urlScore + contentScore;
  const score = Math.min(100, rawScore);

  let level: 'LOW' | 'SUSPICIOUS' | 'HIGH' | 'CRITICAL';
  if (score >= 80) {
    level = 'CRITICAL';
  } else if (score >= 60) {
    level = 'HIGH';
  } else if (score >= 30) {
    level = 'SUSPICIOUS';
  } else {
    level = 'LOW';
  }

  return {
    score,
    level,
    factors,
    impersonatedBrand: lookalikeHit
      ? {
          brand: lookalikeHit.brand,
          legitimateDomain: lookalikeHit.protectedDomain,
          lookalikeDomain: email.domains.find((d) => checkLookalikeDomain(d)) || '',
        }
      : null,
    breakdown: {
      authScore,
      domainScore,
      urlScore,
      contentScore,
    },
    indicatorsCount: {
      ips: email.ips.length,
      domains: email.domains.length,
      urls: email.urls.length,
      attachments: email.attachments.length,
    },
  };
}
