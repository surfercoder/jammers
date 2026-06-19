// Intl.NumberFormat is expensive to construct, so cache one formatter per
// currency instead of rebuilding it on every call.
const moneyFormatters = new Map<string, Intl.NumberFormat>();

function moneyFormatter(currency: string): Intl.NumberFormat {
  let formatter = moneyFormatters.get(currency);
  if (!formatter) {
    // Built once per currency and cached above — not rebuilt on every call.
    // react-doctor-disable-next-line react-doctor/js-hoist-intl
    formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });
    moneyFormatters.set(currency, formatter);
  }
  return formatter;
}

/** Compact money formatting, e.g. $12.000 ARS. */
export function formatMoney(amount: number | null | undefined, currency = "ARS") {
  if (amount == null) return "—";
  return moneyFormatter(currency).format(amount);
}

/** Average + count of ratings. */
export function averageRating(ratings: number[]): number | null {
  if (!ratings.length) return null;
  return Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10;
}

/** Turn an arbitrary string into a url-friendly slug. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 60);
}

/**
 * Extract a YouTube embed URL from common watch / share / embed URLs.
 * Returns the original url if it's not recognised as YouTube.
 */
export function youtubeEmbed(url: string): string {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

export function initials(name: string | null | undefined, fallback = "JM") {
  if (!name) return fallback;
  return name
    .split(" ")
    .flatMap((p) => (p[0] ? [p[0]] : []))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
