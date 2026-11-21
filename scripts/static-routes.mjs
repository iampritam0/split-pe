// GitHub Pages has no SPA fallback: a deep link like /privacy-policy is served
// by 404.html with HTTP status 404, which crawlers (Meta, Google Play review)
// treat as a missing page. Copying index.html into a folder per public route
// makes those URLs real files that return 200, and React Router takes over.
// Each copy gets its own title, description and canonical URL so search
// engines and link previews don't see every page as the home page.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SITE = 'https://www.splitpe.xyz';
const ROUTES = {
  'privacy-policy': {
    title: 'Privacy Policy | SplitPe',
    description: 'How SplitPe collects, uses and protects your data. We never sell your personal information.',
  },
  'terms-and-conditions': {
    title: 'Terms and Conditions | SplitPe',
    description: 'The terms for using the SplitPe expense splitting app and website.',
  },
  'delete-account': {
    title: 'Delete Your Account | SplitPe',
    description: 'Request deletion of your SplitPe account and data, from the app or without it.',
  },
  support: {
    title: 'Help & Support | SplitPe',
    description: 'Get help with SplitPe: contact our team at support@splitpe.xyz or read common answers.',
  },
};

const dist = 'dist';
const base = readFileSync(join(dist, 'index.html'), 'utf8');

const escape = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function replaceOrThrow(html, pattern, value, route) {
  if (!pattern.test(html)) throw new Error(`static-routes: ${pattern} not found for /${route}`);
  return html.replace(pattern, value);
}

for (const [route, meta] of Object.entries(ROUTES)) {
  const url = `${SITE}/${route}/`;
  const title = escape(meta.title);
  const desc = escape(meta.description);
  let html = base;
  html = replaceOrThrow(html, /<title>[^<]*<\/title>/, `<title>${title}</title>`, route);
  html = replaceOrThrow(html, /<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${desc}" />`, route);
  html = replaceOrThrow(html, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`, route);
  html = replaceOrThrow(html, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${title}" />`, route);
  html = replaceOrThrow(html, /<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${desc}" />`, route);
  html = replaceOrThrow(html, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${url}" />`, route);
  mkdirSync(join(dist, route), { recursive: true });
  writeFileSync(join(dist, route, 'index.html'), html);
}
