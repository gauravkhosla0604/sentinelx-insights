import {
  ParsedEmailData,
  ThreatAnalysis,
  CampaignDnaResult,
  AiAnalysisResult,
} from '@/types';

export function getDeterministicFallbackAnalysis(
  email: ParsedEmailData,
  threat: ThreatAnalysis,
  campaign: CampaignDnaResult
): AiAnalysisResult {
  const brand =
    threat.impersonatedBrand?.brand ||
    (campaign.impersonatedBrand !== 'NONE' ? campaign.impersonatedBrand : 'Enterprise Cloud');

  const attackType =
    threat.score >= 50
      ? `${brand} Spear-Phishing & Credential Harvest`
      : 'Benign Corporate Transmission';

  const signals: string[] = [];

  const text = `${email.subject} ${email.bodyText}`.toLowerCase();

  if (text.includes('suspension') || text.includes('suspended') || text.includes('lockout')) {
    signals.push('Account suspension coercion (fabricated operational emergency)');
  }
  if (text.includes('immediate') || text.includes('action required') || text.includes('24 hours')) {
    signals.push('Artificial deadline compression designed to induce panic');
  }
  if (text.includes('security alert') || text.includes('operations') || text.includes('unauthorized')) {
    signals.push('Deceptive administrative authority invocation');
  }
  if (email.replyTo && threat.factors.some((f) => f.id === 'reply_to_mismatch')) {
    signals.push('Asymmetric routing diversion (response directed away from sender)');
  }
  if (threat.factors.some((f) => f.id === 'lookalike_domain')) {
    signals.push(`Homoglyph domain typo-squatting mimicking ${brand}`);
  }

  if (signals.length === 0) {
    signals.push('Standard procedural notification without detected high-pressure coercion.');
  }

  const summary =
    threat.score >= 70
      ? `High-confidence spear-phishing attack engineered to siphon enterprise ${brand} single sign-on credentials. The threat actor combines lookalike domain infrastructure with coercive account suspension language to force immediate victim interaction. Correlated with historical cluster ${campaign.matchedCampaign || 'SX-CAMP-001'}.`
      : threat.score >= 30
      ? `Suspicious inbound communication exhibiting anomalous routing or credential harvesting keywords. Elevated analyst caution recommended before employee interaction.`
      : `Standard inbound communication displaying valid domain alignment and legitimate communication markers. Low risk profile.`;

  return {
    attackType,
    impersonatedBrand: brand,
    socialEngineeringSignals: signals,
    summary,
    isAiGenerated: false,
    modelUsed: 'SentinelX Deterministic Semantic Analyzer (Zero-Hallucination Fallback)',
  };
}

export async function analyzeEmailWithAi(
  email: ParsedEmailData,
  threat: ThreatAnalysis,
  campaign: CampaignDnaResult
): Promise<AiAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return getDeterministicFallbackAnalysis(email, threat, campaign);
  }

  try {
    // If Gemini key available
    if (process.env.GEMINI_API_KEY) {
      const prompt = `You are a cybersecurity SOC analyst. Analyze this email content strictly for psychological tone, targeted brand, and attack classification.
CRITICAL CONSTRAINT: Do NOT invent or hallucinate any IP addresses, domain names, SPF/DKIM/DMARC results, or technical indicators. Technical facts are provided by deterministic rules only.

Email Subject: ${email.subject}
Sender: ${email.from.address}
Impersonated Brand Detected: ${threat.impersonatedBrand?.brand || 'None'}
Body Excerpt: ${email.bodyText.substring(0, 500)}

Return strictly a JSON object with this exact shape:
{
  "attackType": "string",
  "impersonatedBrand": "string",
  "socialEngineeringSignals": ["string", "string"],
  "summary": "string"
}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        }
      );

      if (res.ok) {
        const json = await res.json();
        const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText);
          return {
            attackType: parsed.attackType || 'Credential Phishing',
            impersonatedBrand: parsed.impersonatedBrand || 'MICROSOFT',
            socialEngineeringSignals: parsed.socialEngineeringSignals || [],
            summary: parsed.summary || '',
            isAiGenerated: true,
            modelUsed: 'Gemini 1.5 Flash (Semantic Interpretation)',
          };
        }
      }
    }
  } catch (err) {
    console.warn('AI API call failed, falling back to deterministic analyzer:', err);
  }

  return getDeterministicFallbackAnalysis(email, threat, campaign);
}
