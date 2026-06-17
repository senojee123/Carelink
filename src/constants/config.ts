function sanitizeUrl(url: string | undefined): string {
  if (!url) return '';
  
  // Remove "VITE_API_URL" labels
  let clean = url.replace(/VITE_API_URL/gi, '').trim();
  
  // Split by http or https (case-insensitive)
  const parts = clean.split(/https?/i);
  let lastPart = '';
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i].trim();
    if (p && p !== ':' && p !== '://' && p !== ':/') {
      lastPart = p;
      break;
    }
  }
  
  const PRODUCTION_FALLBACK = 'https://carelink-backend-wenq.onrender.com';
  if (!lastPart) return PRODUCTION_FALLBACK;
  
  // Strip leading colons and slashes from the last part: e.g. ":/carelink..." -> "carelink..."
  lastPart = lastPart.replace(/^[:\/]+/, '');
  
  // Determine if original string had http or https (default to https)
  const isHttp = /http:/i.test(clean) && !/https:/i.test(clean);
  const protocol = isHttp ? 'http' : 'https';
  
  return `${protocol}://${lastPart}`.replace(/\/+$/, '');
}

const PRODUCTION_URL = 'https://carelink-backend-wenq.onrender.com';
const rawUrl = import.meta.env.VITE_API_URL;

export const API_BASE_URL: string = rawUrl ? sanitizeUrl(rawUrl) : PRODUCTION_URL;

console.log('CareLink API Base URL Configuration:', {
  raw: rawUrl,
  resolved: API_BASE_URL
});

