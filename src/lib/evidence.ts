/**
 * Evidence integrity helpers.
 * The original uploaded artifact is never modified — we only hash its bytes.
 */
export async function sha256Hex(bytes: Uint8Array | ArrayBuffer): Promise<string> {
  const buf = bytes instanceof Uint8Array ? bytes.slice().buffer : bytes;
  const digest = await crypto.subtle.digest("SHA-256", buf as ArrayBuffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function evidenceIdFromHash(hash: string): string {
  return `SX-EVD-${hash.slice(0, 12).toUpperCase()}`;
}

export function incidentIdFromHash(hash: string, analyzedAt: string): string {
  const day = analyzedAt.slice(0, 10).replace(/-/g, "");
  return `SX-INC-${day}-${hash.slice(0, 6).toUpperCase()}`;
}
