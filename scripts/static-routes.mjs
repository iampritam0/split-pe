// GitHub Pages has no SPA fallback: a deep link like /privacy-policy is served
// by 404.html with HTTP status 404, which crawlers (Meta, Google Play review)
// treat as a missing page. Copying index.html into a folder per public route
// makes those URLs real files that return 200, and React Router takes over.
import { copyFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const ROUTES = ['privacy-policy', 'terms-and-conditions', 'delete-account', 'support'];
const dist = 'dist';

for (const route of ROUTES) {
  mkdirSync(join(dist, route), { recursive: true });
  copyFileSync(join(dist, 'index.html'), join(dist, route, 'index.html'));
}
