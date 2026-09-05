import {
  ParsedEmailData,
  ThreatAnalysis,
  HistoricalIncident,
  RelatedIncidentMatch,
  CampaignDnaResult,
} from '@/types';
import incidentsData from '@/data/incidents.json';
import { extractDomainFromEmail } from './utils';

const CAMPAIGN_NAMES: Record<string, string> = {
  'SX-CAMP-001': 'Campaign Alpha (Microsoft 365 Credential Harvester)',
  'SX-CAMP-002': 'Campaign Beta (Banking Financial Impersonation)',
};

export function correlateCampaign(
  email: ParsedEmailData,
  threat: ThreatAnalysis,
  customIncidents?: HistoricalIncident[]
): CampaignDnaResult {
  const incidents: HistoricalIncident[] = (customIncidents || incidentsData) as HistoricalIncident[];

  const currentSenderDomain = extractDomainFromEmail(email.from.address);
  const currentReplyToDomain = email.replyTo?.address
    ? extractDomainFromEmail(email.replyTo.address)
    : '';
  const currentIps = email.ips;
  const currentUrlDomains = email.urls.map((u) => u.domain.toLowerCase());

  // Brand inference
  const currentBrand =
    threat.impersonatedBrand?.brand ||
    (email.subject.toLowerCase().includes('microsoft') || email.bodyText.toLowerCase().includes('microsoft')
      ? 'MICROSOFT'
      : email.subject.toLowerCase().includes('sbi')
      ? 'SBI'
      : email.subject.toLowerCase().includes('hdfc')
      ? 'HDFC'
      : 'NONE');

  // Attack type inference
  const currentAttackType =
    threat.score >= 50
      ? currentBrand === 'SBI' || currentBrand === 'HDFC'
        ? 'Banking Credential Phishing'
        : 'Credential Phishing'
      : 'Informational';

  const currentText = `${email.subject} ${email.bodyText}`.toLowerCase();

  const relatedMatches: RelatedIncidentMatch[] = [];

  for (const inc of incidents) {
    let score = 0;
    const reasons: string[] = [];

    // 1. Same IP (Very Strong: +30)
    const sharedIps = inc.ips.filter((ip) => currentIps.includes(ip));
    if (sharedIps.length > 0) {
      score += 30;
      reasons.push(`Shared infrastructure relay IP: ${sharedIps.join(', ')}`);
    }

    // 2. Same URL Domain (Very Strong: +25)
    const sharedUrlDomains = inc.urlDomains.filter((dom) =>
      currentUrlDomains.some((curDom) => curDom === dom.toLowerCase() || curDom.endsWith(`.${dom.toLowerCase()}`))
    );
    if (sharedUrlDomains.length > 0) {
      score += 25;
      reasons.push(`Identical credential URL domain: ${sharedUrlDomains.join(', ')}`);
    }

    // 3. Same Reply-To Domain (Strong: +15)
    const incReplyToDomain = extractDomainFromEmail(inc.replyTo);
    const sharedReplyTo = Boolean(
      currentReplyToDomain &&
      incReplyToDomain &&
      currentReplyToDomain === incReplyToDomain
    );
    if (sharedReplyTo) {
      score += 15;
      reasons.push(`Shared Reply-To redirect domain: ${currentReplyToDomain}`);
    }

    // 4. Same Sender Domain (Strong: +15)
    const sharedSender = Boolean(
      currentSenderDomain &&
      inc.senderDomain &&
      currentSenderDomain === inc.senderDomain.toLowerCase()
    );
    if (sharedSender) {
      score += 15;
      reasons.push(`Identical sender domain: ${currentSenderDomain}`);
    }

    // 5. Same Impersonated Brand (Medium: +10)
    const sharedBrand = Boolean(
      currentBrand !== 'NONE' &&
      inc.impersonatedBrand &&
      currentBrand.toUpperCase() === inc.impersonatedBrand.toUpperCase()
    );
    if (sharedBrand) {
      score += 10;
      reasons.push(`Targeted brand impersonation match: ${inc.impersonatedBrand}`);
    }

    // 6. Same Attack Type (Medium: +10)
    const sharedAttackType = Boolean(
      currentAttackType &&
      inc.attackType &&
      inc.attackType.toLowerCase().includes('phishing') &&
      currentAttackType.toLowerCase().includes('phishing')
    );
    if (sharedAttackType) {
      score += 10;
      reasons.push(`Consistent attack objective: ${inc.attackType}`);
    }

    // 7. Subject / Body Phrasing Similarity (Medium: +10)
    const keywords = ['account', 'suspension', 'immediate', 'verify', 'credentials', 'password', 'urgent', 'action required'];
    const matchingKeywords = keywords.filter(
      (kw) => currentText.includes(kw) && inc.subject.toLowerCase().includes(kw)
    );
    if (matchingKeywords.length >= 2) {
      score += 10;
      reasons.push(`Template phrasing overlap: "${matchingKeywords.slice(0, 3).join('", "')}"`);
    }

    // Evaluate connection strength
    if (score >= 20 || (sharedIps.length > 0 && sharedUrlDomains.length > 0)) {
      let strength: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
      if (score >= 50) {
        strength = 'HIGH';
      } else if (score >= 30) {
        strength = 'MEDIUM';
      }

      relatedMatches.push({
        incident: inc,
        score,
        strength,
        reasons,
        sharedIps,
        sharedUrlDomains,
        sharedReplyToDomain: sharedReplyTo,
        sharedSenderDomain: sharedSender,
        sharedBrand,
      });
    }
  }

  // Sort by correlation score descending
  relatedMatches.sort((a, b) => b.score - a.score);

  // Group by campaign
  const campaignScores: Record<string, { totalScore: number; count: number; maxScore: number }> = {};

  for (const match of relatedMatches) {
    if (match.incident.campaignId) {
      const campId = match.incident.campaignId;
      if (!campaignScores[campId]) {
        campaignScores[campId] = { totalScore: 0, count: 0, maxScore: 0 };
      }
      campaignScores[campId].totalScore += match.score;
      campaignScores[campId].count += 1;
      campaignScores[campId].maxScore = Math.max(campaignScores[campId].maxScore, match.score);
    }
  }

  let bestCampaignId: string | null = null;
  let highestCampaignMetric = 0;

  for (const [campId, stats] of Object.entries(campaignScores)) {
    // Weighted metric: maximum incident score + bonus for multi-incident confirmation
    const metric = stats.maxScore + (stats.count > 1 ? Math.min(15, stats.count * 4) : 0);
    if (metric > highestCampaignMetric) {
      highestCampaignMetric = metric;
      bestCampaignId = campId;
    }
  }

  if (bestCampaignId && highestCampaignMetric >= 30) {
    const rawMatchPercentage = Math.min(96, Math.max(70, highestCampaignMetric));

    // Aggregate unique match reasons across campaign incidents
    const reasonsSet = new Set<string>();
    const campaignIncidents = relatedMatches.filter((m) => m.incident.campaignId === bestCampaignId);
    campaignIncidents.forEach((m) => {
      m.reasons.forEach((r) => reasonsSet.add(r));
    });

    return {
      matchedCampaign: bestCampaignId,
      campaignName: CAMPAIGN_NAMES[bestCampaignId] || bestCampaignId,
      matchPercentage: rawMatchPercentage,
      relatedIncidents: relatedMatches,
      relatedIncidentsCount: campaignIncidents.length,
      matchReasons: Array.from(reasonsSet),
      attackType: currentAttackType,
      impersonatedBrand: currentBrand,
      statusNote: 'Possible campaign relationship detected based on infrastructure and template heuristics.',
    };
  }

  return {
    matchedCampaign: null,
    campaignName: 'No Correlated Campaign',
    matchPercentage: 0,
    relatedIncidents: [],
    relatedIncidentsCount: 0,
    matchReasons: ['No significant infrastructure or template overlaps found in historical repository.'],
    attackType: currentAttackType,
    impersonatedBrand: currentBrand,
    statusNote: 'No correlated threat campaign detected.',
  };
}
