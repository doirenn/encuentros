const MP_HOST = /(^|\.)mercadopago\.com(\.[a-z]{2})?$/i;

export function sanitizePaymentEmbed(value: string | null | undefined): string | null {
  if (!value) return null;
  const raw = value.trim();
  if (!raw) return null;

  const fromIframe = raw.match(/src=["']([^"']+)["']/i);
  const candidate = fromIframe?.[1] ?? raw;

  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (!MP_HOST.test(url.hostname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function isHttpUrl(value: string | null | undefined) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}
