/**
 * Shared magic numbers and constants.
 */

// ── KaTeX CDN ──
export const KATEX_VERSION = "0.16.8";
export const KATEX_CSS_URL = `https://cdn.jsdelivr.net/npm/katex@${KATEX_VERSION}/dist/katex.min.css`;
export const KATEX_JS_URL = `https://cdn.jsdelivr.net/npm/katex@${KATEX_VERSION}/dist/katex.min.js`;
export const KATEX_AUTO_RENDER_URL = `https://cdn.jsdelivr.net/npm/katex@${KATEX_VERSION}/dist/contrib/auto-render.min.js`;

// ── Unsplash ──
export const UNSPLASH_ACCESS_KEY =
  process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY ||
  process.env.UNSPLASH_ACCESS_KEY ||
  "";
export const UNSPLASH_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1416339306562-f3d12fefd36f";
export const EVENT_CARD_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?q=80&w=600";

// ── Sidebar layout ──
export const DEFAULT_SIDEBAR_WIDTH = 380;
export const MIN_SIDEBAR_WIDTH = 320;
export const MAX_SIDEBAR_WIDTH = 720;
export const MIN_MAIN_WIDTH = 520;
