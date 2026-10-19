// The public address of the site, used for the sitemap and robots.txt.
// Set NEXT_PUBLIC_SITE_URL once the real domain is live; until then Vercel's
// own address is used, and finally localhost for local development.
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}
