import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractDomainFromEmail(email?: string): string {
  if (!email) return '';
  const parts = email.split('@');
  return parts.length > 1 ? parts[1].replace(/[<>]/g, '').trim().toLowerCase() : '';
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
