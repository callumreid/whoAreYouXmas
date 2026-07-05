// Houseboat Studios shared TV-mode detection (Fire TV WebView).
// TV mode is on when the URL has ?tv=1, the user agent looks like Fire TV,
// or a previous page in this session already detected TV mode.
// Persisted in sessionStorage so it survives Next.js client-side navigation
// (the app is loaded from its Vercel URL on Fire TV, not local assets).

export const TV_STORAGE_KEY = "hbs_tv";

export function detectTvMode(): boolean {
  if (typeof window === "undefined") return false;

  try {
    if (window.sessionStorage.getItem(TV_STORAGE_KEY) === "1") {
      return true;
    }
  } catch {
    // sessionStorage unavailable — fall through to live detection
  }

  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get("tv") === "1";
  const ua = window.navigator.userAgent;
  const fromUserAgent = /AFT[A-Z0-9]/i.test(ua) || /Fire ?TV/i.test(ua);
  const isTv = fromQuery || fromUserAgent;

  if (isTv) {
    try {
      window.sessionStorage.setItem(TV_STORAGE_KEY, "1");
    } catch {
      // best effort — query/UA detection still works per-page
    }
  }

  return isTv;
}
