// Bundles src/ into single-file builds:
//   dist/index.html            full page for GitHub Pages (installable PWA)
//   dist/spyfox-artifact.html  body fragment for a claude.ai Artifact
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = (p) => readFileSync(join(root, 'src', p), 'utf8');
const JS = ['audio', 'art', 'engine', 'scenes', 'minigames', 'main'];

const css = src('style.css');
const js = JS.map((n) => `/* ---- ${n}.js ---- */\n${src(`js/${n}.js`)}`).join('\n');
const fragment = src('index.html')
  .replace('/*CSS*/', () => css)
  .replace('/*JS*/', () => js.replace(/<\/script/gi, '<\\/script'));

const full = `<!doctype html>
<html lang="en" data-pwa="1">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">
<meta name="description" content="Spy Fox in Dry Cereal: a fan-made mobile tribute adventure.">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="icon.svg">
</head>
<body>
${fragment}
</body>
</html>
`;

const out = join(root, 'dist');
mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'index.html'), full);
writeFileSync(join(out, 'spyfox-artifact.html'), fragment);
for (const f of readdirSync(join(root, 'public'))) copyFileSync(join(root, 'public', f), join(out, f));
console.log(`Built dist/index.html (${(full.length / 1024).toFixed(1)} KB) and dist/spyfox-artifact.html`);
