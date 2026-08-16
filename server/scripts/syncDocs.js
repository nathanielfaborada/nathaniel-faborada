import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

const distDir = path.join(rootDir, 'dist');
const docsDir = path.join(rootDir, 'docs');
const publicDir = path.join(rootDir, 'public');

// Clean and copy dist to docs for GitHub Pages compatibility
if (fs.existsSync(distDir)) {
  if (fs.existsSync(docsDir)) {
    fs.rmSync(docsDir, { recursive: true, force: true });
  }
  fs.mkdirSync(docsDir, { recursive: true });
  fs.cpSync(distDir, docsDir, { recursive: true });
  console.log('✅ Clean synchronized dist/ to docs/ for GitHub Pages.');
}

// Ensure public/assets are copied to dist and docs
const publicAssetsDir = path.join(publicDir, 'assets');
if (fs.existsSync(publicAssetsDir)) {
  const distAssetsDir = path.join(distDir, 'assets');
  const docsAssetsDir = path.join(docsDir, 'assets');
  if (!fs.existsSync(distAssetsDir)) fs.mkdirSync(distAssetsDir, { recursive: true });
  if (!fs.existsSync(docsAssetsDir)) fs.mkdirSync(docsAssetsDir, { recursive: true });
  fs.cpSync(publicAssetsDir, distAssetsDir, { recursive: true });
  fs.cpSync(publicAssetsDir, docsAssetsDir, { recursive: true });
  console.log('✅ Synchronized public/assets/ to build output directories.');
}

// Ensure _redirects exists in dist and docs for Netlify/SPA routing
const redirectsFile = path.join(publicDir, '_redirects');
if (fs.existsSync(redirectsFile)) {
  if (fs.existsSync(distDir)) {
    fs.copyFileSync(redirectsFile, path.join(distDir, '_redirects'));
  }
  if (fs.existsSync(docsDir)) {
    fs.copyFileSync(redirectsFile, path.join(docsDir, '_redirects'));
  }
  console.log('✅ Copied _redirects to build output directories.');
}
