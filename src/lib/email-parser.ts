import { simpleParser, ParsedMail, HeaderValue } from 'mailparser';
import {
  ParsedEmailData,
  AuthenticationResults,
  AuthResultStatus,
  ReceivedHop,
  ExtractedUrl,
  EmailAttachment,
} from '@/types';

// Regex helpers
const URL_REGEX = /https?:\/\/[^\s<>"'{}|\\^`\[\]]+/gi;
const IP_REGEX = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;

function parseHeaderString(header: HeaderValue | undefined): string {
  if (!header) return '';
  if (typeof header === 'string') return header;
  if (Array.isArray(header)) return header.map((h) => String(h)).join('; ');
  if (typeof header === 'object') {
    if ('value' in header && typeof (header as any).value === 'string') {
      return (header as any).value;
    }
    if ('text' in header && typeof (header as any).text === 'string') {
      return (header as any).text;
    }
  }
  return String(header);
}

export function parseAuthResults(authHeader: string): AuthenticationResults {
  const result: AuthenticationResults = {
    raw: authHeader || 'No Authentication-Results header present',
    spf: { result: 'none', details: 'No SPF result found' },
    dkim: { result: 'none', details: 'No DKIM result found' },
    dmarc: { result: 'none', details: 'No DMARC result found' },
  };

  if (!authHeader) return result;

  const headerLower = authHeader.toLowerCase();

  // Helper to extract status for spf, dkim, dmarc
  const extractStatus = (protocol: 'spf' | 'dkim' | 'dmarc'): { status: AuthResultStatus; details: string } => {
    // Matches e.g. "spf=fail", "spf=pass", "dkim=softfail"
    const regex = new RegExp(`${protocol}\\s*=\\s*([a-z]+)(?:\\s*\\(([^)]*)\\))?`, 'i');
    const match = headerLower.match(regex);
    if (!match) return { status: 'none', details: `No ${protocol.toUpperCase()} evaluation found` };

    const val = match[1].toLowerCase();
    const details = match[2] ? match[2].trim() : `${protocol.toUpperCase()}=${val}`;

    const validStatuses: AuthResultStatus[] = [
      'pass',
      'fail',
      'softfail',
      'neutral',
      'none',
      'temperror',
      'permerror',
    ];

    if (validStatuses.includes(val as AuthResultStatus)) {
      return { status: val as AuthResultStatus, details };
    }
    return { status: 'unknown', details: `Unrecognized status: ${val}` };
  };

  const spf = extractStatus('spf');
  result.spf = { result: spf.status, details: spf.details };

  const dkim = extractStatus('dkim');
  result.dkim = { result: dkim.status, details: dkim.details };

  const dmarc = extractStatus('dmarc');
  result.dmarc = { result: dmarc.status, details: dmarc.details };

  return result;
}

function parseReceivedHeaders(received: HeaderValue | undefined): ReceivedHop[] {
  if (!received) return [];
  const list: string[] = [];
  if (Array.isArray(received)) {
    received.forEach((r) => list.push(parseHeaderString(r)));
  } else {
    list.push(parseHeaderString(received));
  }

  return list.map((hopStr, idx) => {
    // Extract IP if present in [x.x.x.x]
    const ipMatch = hopStr.match(/\[(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\]/);
    const ip = ipMatch ? ipMatch[1] : undefined;

    const fromMatch = hopStr.match(/from\s+([^\s;()]+)/i);
    const byMatch = hopStr.match(/by\s+([^\s;()]+)/i);
    const withMatch = hopStr.match(/with\s+([^\s;()]+)/i);
    const dateMatch = hopStr.match(/;\s*([^;]+)$/);

    return {
      hopNumber: idx + 1,
      from: fromMatch ? fromMatch[1] : undefined,
      by: byMatch ? byMatch[1] : undefined,
      with: withMatch ? withMatch[1] : undefined,
      date: dateMatch ? dateMatch[1].trim() : undefined,
      ip,
    };
  });
}

export function extractDomainFromUrl(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    return parsed.hostname.toLowerCase();
  } catch {
    const match = urlStr.match(/https?:\/\/([^\/\s:]+)/i);
    return match ? match[1].toLowerCase() : '';
  }
}

export function extractDomainFromEmail(email?: string): string {
  if (!email) return '';
  const parts = email.split('@');
  return parts.length > 1 ? parts[1].replace(/[<>]/g, '').trim().toLowerCase() : '';
}

export async function parseEmlBuffer(buffer: Buffer | string): Promise<ParsedEmailData> {
  const parsed: ParsedMail = await simpleParser(buffer);

  // Authentication results header extraction
  const authHeader = parseHeaderString(
    parsed.headers.get('authentication-results') ||
      parsed.headers.get('x-authentication-results')
  );
  const authenticationResults = parseAuthResults(authHeader);

  // Received hops
  const receivedHops = parseReceivedHeaders(parsed.headers.get('received'));

  // Body text & HTML
  const bodyText = parsed.text || '';
  const bodyHtml = (parsed.html as string) || '';

  // Return-Path
  const returnPathHeader = parseHeaderString(parsed.headers.get('return-path'));
  const returnPathMatch = returnPathHeader.match(/<([^>]+)>/) || [null, returnPathHeader.trim()];
  const returnPath = returnPathMatch[1] ? returnPathMatch[1].trim() : null;

  // From
  const fromFirst = parsed.from?.value?.[0];
  const from = {
    name: fromFirst?.name || '',
    address: fromFirst?.address || '',
  };

  // To
  const toList = Array.isArray(parsed.to)
    ? parsed.to
    : parsed.to
    ? [parsed.to]
    : [];
  const to = toList.flatMap((addr) =>
    (addr.value || []).map((item) => ({
      name: item.name || '',
      address: item.address || '',
    }))
  );

  // Reply-To
  const replyToFirst = parsed.replyTo?.value?.[0];
  const replyTo = replyToFirst
    ? {
        name: replyToFirst.name || '',
        address: replyToFirst.address || '',
      }
    : null;

  // Extract URLs
  const contentToSearch = `${bodyText} ${bodyHtml}`;
  const rawUrls = contentToSearch.match(URL_REGEX) || [];
  const uniqueUrls = Array.from(new Set(rawUrls.map((u) => u.replace(/[.,;)]+$/, ''))));

  const urls: ExtractedUrl[] = uniqueUrls.map((url) => {
    const domain = extractDomainFromUrl(url);
    const flags: string[] = [];
    const lowerUrl = url.toLowerCase();

    if (
      lowerUrl.includes('login') ||
      lowerUrl.includes('signin') ||
      lowerUrl.includes('verify') ||
      lowerUrl.includes('auth') ||
      lowerUrl.includes('credential') ||
      lowerUrl.includes('account-update') ||
      lowerUrl.includes('security')
    ) {
      flags.push('credential_harvesting_keyword');
    }

    if (IP_REGEX.test(domain)) {
      flags.push('raw_ip_host');
    }

    return {
      url,
      domain,
      isSuspicious: flags.length > 0,
      flags,
    };
  });

  // Collect Domains
  const domainsSet = new Set<string>();
  if (from.address) {
    const d = extractDomainFromEmail(from.address);
    if (d) domainsSet.add(d);
  }
  if (replyTo?.address) {
    const d = extractDomainFromEmail(replyTo.address);
    if (d) domainsSet.add(d);
  }
  if (returnPath) {
    const d = extractDomainFromEmail(returnPath);
    if (d) domainsSet.add(d);
  }
  urls.forEach((u) => {
    if (u.domain) domainsSet.add(u.domain);
  });

  // Extract IPs
  const ipsSet = new Set<string>();
  receivedHops.forEach((hop) => {
    if (hop.ip) ipsSet.add(hop.ip);
  });
  const allTextIps = contentToSearch.match(IP_REGEX) || [];
  allTextIps.forEach((ip) => {
    if (ip !== '127.0.0.1' && ip !== '0.0.0.0') {
      ipsSet.add(ip);
    }
  });

  // Attachments
  const attachments: EmailAttachment[] = (parsed.attachments || []).map((att) => ({
    filename: att.filename || 'unnamed_attachment',
    contentType: att.contentType || 'application/octet-stream',
    size: att.size || 0,
  }));

  return {
    subject: parsed.subject || '(No Subject)',
    from,
    to,
    replyTo,
    returnPath,
    date: parsed.date ? parsed.date.toISOString() : null,
    messageId: parsed.messageId || null,
    authenticationResults,
    receivedHops,
    bodyText,
    bodyHtml,
    urls,
    domains: Array.from(domainsSet),
    ips: Array.from(ipsSet),
    attachments,
  };
}
