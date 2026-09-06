export type AuthResultStatus = 
  | 'pass' 
  | 'fail' 
  | 'softfail' 
  | 'neutral' 
  | 'none' 
  | 'temperror' 
  | 'permerror' 
  | 'unknown';

export interface AuthenticationResults {
  raw: string;
  spf: {
    result: AuthResultStatus;
    details?: string;
  };
  dkim: {
    result: AuthResultStatus;
    details?: string;
  };
  dmarc: {
    result: AuthResultStatus;
    details?: string;
  };
}

export interface ReceivedHop {
  hopNumber: number;
  from?: string;
  by?: string;
  with?: string;
  date?: string;
  ip?: string;
}

export interface ExtractedUrl {
  url: string;
  domain: string;
  isSuspicious: boolean;
  flags: string[];
}

export interface EmailAttachment {
  filename: string;
  contentType: string;
  size: number;
}

export interface ParsedEmailData {
  subject: string;
  from: {
    name?: string;
    address?: string;
  };
  to: Array<{
    name?: string;
    address?: string;
  }>;
  replyTo: {
    name?: string;
    address?: string;
  } | null;
  returnPath: string | null;
  date: string | null;
  messageId: string | null;
  authenticationResults: AuthenticationResults;
  receivedHops: ReceivedHop[];
  bodyText: string;
  bodyHtml: string;
  urls: ExtractedUrl[];
  domains: string[];
  ips: string[];
  attachments: EmailAttachment[];
}

export type ThreatSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';

export interface ThreatFactor {
  id: string;
  title: string;
  category: 'authentication' | 'domain' | 'url' | 'content';
  points: number;
  triggered: boolean;
  severity: ThreatSeverity;
  evidence: string;
  explanation: string;
}

export interface ThreatAnalysis {
  score: number; // 0 - 100
  level: 'LOW' | 'SUSPICIOUS' | 'HIGH' | 'CRITICAL';
  factors: ThreatFactor[];
  impersonatedBrand?: {
    brand: string;
    legitimateDomain: string;
    lookalikeDomain: string;
  } | null;
  breakdown: {
    authScore: number;
    domainScore: number;
    urlScore: number;
    contentScore: number;
  };
  indicatorsCount: {
    ips: number;
    domains: number;
    urls: number;
    attachments: number;
  };
}

// Campaign DNA Types
export interface HistoricalIncident {
  caseId: string;
  timestamp: string;
  subject: string;
  sender: string;
  senderDomain: string;
  replyTo: string;
  ips: string[];
  urls: string[];
  urlDomains: string[];
  attackType: string;
  impersonatedBrand: string;
  bodyExcerpt: string;
  campaignId: string | null;
}

export interface RelatedIncidentMatch {
  incident: HistoricalIncident;
  score: number;
  strength: 'HIGH' | 'MEDIUM' | 'LOW';
  reasons: string[];
  sharedIps: string[];
  sharedUrlDomains: string[];
  sharedReplyToDomain: boolean;
  sharedSenderDomain: boolean;
  sharedBrand: boolean;
}

export interface CampaignDnaResult {
  matchedCampaign: string | null;
  campaignName: string;
  matchPercentage: number;
  relatedIncidents: RelatedIncidentMatch[];
  relatedIncidentsCount: number;
  matchReasons: string[];
  attackType: string;
  impersonatedBrand: string;
  statusNote: string;
}

export interface AiAnalysisResult {
  attackType: string;
  impersonatedBrand: string;
  socialEngineeringSignals: string[];
  summary: string;
  isAiGenerated: boolean;
  modelUsed: string;
}

export interface EvidenceMetadata {
  filename: string;
  sizeBytes: number;
  sha256: string;
  evidenceId: string;
  analyzedAt: string;
}
