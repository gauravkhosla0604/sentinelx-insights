import {
  ParsedEmailData,
  ThreatAnalysis,
  CampaignDnaResult,
  HistoricalIncident,
} from '@/types';
import { extractDomainFromEmail } from './utils';

export type NodeType = 'campaign' | 'email' | 'domain' | 'url' | 'ip';

export interface GraphNodeData {
  id: string;
  label: string;
  type: NodeType;
  subType?: string;
  details: Record<string, any>;
  isCurrent?: boolean;
}

export interface GraphEdgeData {
  id: string;
  source: string;
  target: string;
  label: string;
  relationship: string;
  strength: 'HIGH' | 'MEDIUM' | 'LOW';
  evidence: string[];
  explanation: string;
}

export interface GraphElements {
  nodes: { data: GraphNodeData }[];
  edges: { data: GraphEdgeData }[];
}

export function buildEvidenceGraph(
  email: ParsedEmailData,
  threat: ThreatAnalysis,
  campaign: CampaignDnaResult
): GraphElements {
  const nodesMap = new Map<string, GraphNodeData>();
  const edgesMap = new Map<string, GraphEdgeData>();

  // 1. Current Email Node
  const currentEmailId = 'node-current-email';
  nodesMap.set(currentEmailId, {
    id: currentEmailId,
    label: 'Current Incident\n(Analyzed .EML)',
    type: 'email',
    isCurrent: true,
    details: {
      Subject: email.subject,
      From: email.from.address,
      Date: email.date ? new Date(email.date).toUTCString() : 'N/A',
      'Threat Score': `${threat.score}/100 [${threat.level}]`,
      'SPF / DKIM / DMARC': `${email.authenticationResults.spf.result} / ${email.authenticationResults.dkim.result} / ${email.authenticationResults.dmarc.result}`,
    },
  });

  // 2. Campaign Node (if correlated)
  const campaignId = campaign.matchedCampaign || 'SX-CAMP-UNKNOWN';
  const campaignNodeId = `node-camp-${campaignId}`;
  if (campaign.matchedCampaign) {
    nodesMap.set(campaignNodeId, {
      id: campaignNodeId,
      label: `${campaign.matchedCampaign}\n${campaign.impersonatedBrand} Phishing Cluster`,
      type: 'campaign',
      details: {
        'Campaign Identifier': campaign.matchedCampaign,
        'Campaign Name': campaign.campaignName,
        'Impersonated Brand': campaign.impersonatedBrand,
        'Target Attack Type': campaign.attackType,
        'DNA Match Confidence': `${campaign.matchPercentage}%`,
        'Related Case Count': `${campaign.relatedIncidentsCount} cases`,
      },
    });

    // Edge: Current Email -> Campaign
    edgesMap.set(`edge-${currentEmailId}-${campaignNodeId}`, {
      id: `edge-${currentEmailId}-${campaignNodeId}`,
      source: currentEmailId,
      target: campaignNodeId,
      label: 'CAMPAIGN_DNA',
      relationship: 'Heuristic Cluster Membership',
      strength: campaign.matchPercentage >= 80 ? 'HIGH' : 'MEDIUM',
      evidence: campaign.matchReasons,
      explanation: `Correlated with ${campaign.matchedCampaign} via ${campaign.matchPercentage}% DNA indicator overlap.`,
    });
  }

  // 3. Sender & Reply-To Domain Nodes
  const senderDomain = extractDomainFromEmail(email.from.address);
  if (senderDomain) {
    const senderDomId = `node-dom-${senderDomain}`;
    nodesMap.set(senderDomId, {
      id: senderDomId,
      label: `Domain:\n${senderDomain}`,
      type: 'domain',
      details: {
        Domain: senderDomain,
        Role: 'From (Envelope Sender) Domain',
        'Protected Lookalike': threat.impersonatedBrand
          ? `Mimics ${threat.impersonatedBrand.legitimateDomain}`
          : 'None detected',
      },
    });

    edgesMap.set(`edge-${currentEmailId}-${senderDomId}`, {
      id: `edge-${currentEmailId}-${senderDomId}`,
      source: currentEmailId,
      target: senderDomId,
      label: 'SENDER_DOMAIN',
      relationship: 'Originating Sender Header',
      strength: 'HIGH',
      evidence: [`Email header "From" originates from ${senderDomain}`],
      explanation: `The sender claimed transmission authority under domain ${senderDomain}.`,
    });
  }

  // 4. IP Nodes from Current Email
  email.ips.forEach((ip) => {
    const ipNodeId = `node-ip-${ip}`;
    nodesMap.set(ipNodeId, {
      id: ipNodeId,
      label: `IP:\n${ip}`,
      type: 'ip',
      details: {
        'IP Address': ip,
        Type: 'Mail Relay / Hosting Infrastructure',
        'Extracted From': 'RFC 822 Received Headers',
      },
    });

    edgesMap.set(`edge-${currentEmailId}-${ipNodeId}`, {
      id: `edge-${currentEmailId}-${ipNodeId}`,
      source: currentEmailId,
      target: ipNodeId,
      label: 'RELAY_IP',
      relationship: 'Network Infrastructure Hop',
      strength: 'HIGH',
      evidence: [`Hop recorded originating/relaying through ${ip}`],
      explanation: `Mail transfer agent hop verified IP ${ip} as relay infrastructure.`,
    });
  });

  // 5. URL Nodes and URL Domain Nodes
  email.urls.forEach((u, idx) => {
    const urlNodeId = `node-url-${idx}`;
    const truncatedUrl = u.url.length > 32 ? `${u.url.substring(0, 30)}...` : u.url;
    nodesMap.set(urlNodeId, {
      id: urlNodeId,
      label: `URL:\n${truncatedUrl}`,
      type: 'url',
      details: {
        'Full Destination URL': u.url,
        Domain: u.domain,
        Suspicious: u.isSuspicious ? 'YES (Credential Harvesting)' : 'NO',
        Flags: u.flags.join(', ') || 'None',
      },
    });

    edgesMap.set(`edge-${currentEmailId}-${urlNodeId}`, {
      id: `edge-${currentEmailId}-${urlNodeId}`,
      source: currentEmailId,
      target: urlNodeId,
      label: 'EMBEDDED_LINK',
      relationship: 'Hyperlink in Message Body',
      strength: u.isSuspicious ? 'HIGH' : 'MEDIUM',
      evidence: [`Body contains anchor targeting ${u.url}`],
      explanation: 'User is coerced to click this link to access external landing page.',
    });

    // Link URL to its Domain
    if (u.domain) {
      const urlDomId = `node-dom-${u.domain}`;
      if (!nodesMap.has(urlDomId)) {
        nodesMap.set(urlDomId, {
          id: urlDomId,
          label: `Domain:\n${u.domain}`,
          type: 'domain',
          details: {
            Domain: u.domain,
            Role: 'Phishing Landing Host / Redirector',
          },
        });
      }

      edgesMap.set(`edge-${urlNodeId}-${urlDomId}`, {
        id: `edge-${urlNodeId}-${urlDomId}`,
        source: urlNodeId,
        target: urlDomId,
        label: 'HOSTED_ON',
        relationship: 'DNS Host Domain',
        strength: 'HIGH',
        evidence: [`URL resolved under domain authority of ${u.domain}`],
        explanation: `Hyperlink resolves to host infrastructure governed by ${u.domain}.`,
      });
    }
  });

  // 6. Historical Incident Nodes & Edges
  campaign.relatedIncidents.forEach((match) => {
    const inc = match.incident;
    const incNodeId = `node-inc-${inc.caseId}`;

    nodesMap.set(incNodeId, {
      id: incNodeId,
      label: `Incident:\n${inc.caseId}`,
      type: 'email',
      isCurrent: false,
      details: {
        'Case ID': inc.caseId,
        Subject: inc.subject,
        Timestamp: new Date(inc.timestamp).toUTCString(),
        Sender: inc.sender,
        'Sender Domain': inc.senderDomain,
        'Correlation Score': `${match.score} pts (${match.strength})`,
        'Shared Indicators': match.reasons.join('; '),
      },
    });

    // Edge: Historical Incident <-> Current Email (explainable connection)
    edgesMap.set(`edge-${currentEmailId}-${incNodeId}`, {
      id: `edge-${currentEmailId}-${incNodeId}`,
      source: currentEmailId,
      target: incNodeId,
      label: 'RELATED_CASE',
      relationship: 'Forensic Indicator Overlap',
      strength: match.strength,
      evidence: match.reasons,
      explanation: `${inc.caseId} exhibits ${match.reasons.length} direct forensic matches with the analyzed email (${match.strength} correlation).`,
    });

    // If incident is part of campaign, link it to Campaign node
    if (inc.campaignId && campaign.matchedCampaign === inc.campaignId) {
      edgesMap.set(`edge-${incNodeId}-${campaignNodeId}`, {
        id: `edge-${incNodeId}-${campaignNodeId}`,
        source: incNodeId,
        target: campaignNodeId,
        label: 'MEMBER_OF',
        relationship: 'Historical Campaign Member',
        strength: 'HIGH',
        evidence: [`Logged under historical cluster ${inc.campaignId}`],
        explanation: `Incident ${inc.caseId} was previously cataloged as an active vector of ${inc.campaignId}.`,
      });
    }

    // Connect Historical Incident to shared IPs
    match.sharedIps.forEach((ip) => {
      const ipNodeId = `node-ip-${ip}`;
      if (nodesMap.has(ipNodeId)) {
        edgesMap.set(`edge-${incNodeId}-${ipNodeId}`, {
          id: `edge-${incNodeId}-${ipNodeId}`,
          source: incNodeId,
          target: ipNodeId,
          label: 'SHARED_IP',
          relationship: 'Shared Relay Infrastructure',
          strength: 'HIGH',
          evidence: [`Both cases routed through identical IP ${ip}`],
          explanation: `Infrastructure IP ${ip} was shared across multiple attack transmissions.`,
        });
      }
    });

    // Connect Historical Incident to shared URL domains
    match.sharedUrlDomains.forEach((dom) => {
      const domNodeId = `node-dom-${dom}`;
      if (nodesMap.has(domNodeId)) {
        edgesMap.set(`edge-${incNodeId}-${domNodeId}`, {
          id: `edge-${incNodeId}-${domNodeId}`,
          source: incNodeId,
          target: domNodeId,
          label: 'SHARED_DOMAIN',
          relationship: 'Shared Credential Host',
          strength: 'HIGH',
          evidence: [`Both cases leverage credential domain ${dom}`],
          explanation: `Phishing host domain ${dom} was leveraged in both campaign waves.`,
        });
      }
    });
  });

  return {
    nodes: Array.from(nodesMap.values()).map((data) => ({ data })),
    edges: Array.from(edgesMap.values()).map((data) => ({ data })),
  };
}
