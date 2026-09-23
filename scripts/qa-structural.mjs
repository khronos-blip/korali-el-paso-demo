import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8');
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const html = read('public/index.html');
const js = read('public/assets/app.js');
const css = read('public/assets/styles.css');
const wrangler = read('wrangler.jsonc');

execFileSync(process.execPath, ['--check', path.join(root, 'public/assets/app.js')], { stdio: 'inherit' });
execFileSync(process.execPath, ['--check', path.join(root, 'worker.js')], { stdio: 'inherit' });

assert(/<html\s+lang="es"/.test(html), 'Falta lang="es".');
assert(/Página web demo no oficial; compra simulada/.test(html), 'Falta el disclosure visible exacto.');
assert(/name="viewport"/.test(html), 'Falta viewport móvil.');
assert(!/https?:\/\//.test(css), 'CSS contiene dependencia remota.');
assert(!/fetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon/.test(js), 'La app contiene una llamada de red.');
assert(!/<script[^>]+src="https?:|<link[^>]+href="https?:/i.test(html), 'HTML contiene dependencia remota.');
assert((js.match(/\{id:'/g) || []).length === 6, 'El catálogo debe contener exactamente 6 productos.');
assert(!/(?:\$\s*\d|\bUSD\b|\bUS\$\s*\d|\bBs\.?\s*\d|\d+[.,]\d{2}\s*(?:USD|Bs\.?))/i.test(`${html}\n${js}`), 'No deben introducirse precios numéricos o divisas.');
assert((html.match(/Por confirmar/g) || []).length >= 2 && (js.match(/Por confirmar/g) || []).length >= 4, 'Precios y totales deben mostrarse como Por confirmar.');
assert(/addressField/.test(html) && /method === 'delivery' && !address/.test(js), 'Falta validación de dirección para entrega.');
assert(/localStorage/.test(js), 'Falta persistencia local.');
assert(/koralidigital\.com\/demos\/el-paso\/\*/.test(wrangler), 'Falta ruta apex.');
assert(/www\.koralidigital\.com\/demos\/el-paso\/\*/.test(wrangler), 'Falta ruta www.');

const assetRefs = [...new Set([
  ...[...html.matchAll(/\/demos\/el-paso\/(assets\/[^"')\s]+)/g)].map(match => match[1]),
  ...[...js.matchAll(/image:'([^']+)'/g)].map(match => `assets/images/${match[1]}`)
])];
for (const relative of assetRefs) assert(fs.existsSync(path.join(root, 'public', relative)), `Activo ausente: ${relative}`);

const sourceImages = fs.readdirSync(path.join(root, 'assets/images')).filter(name => /^elpaso-\d\d\.jpg$/.test(name)).sort();
const publicImages = fs.readdirSync(path.join(root, 'public/assets/images')).filter(name => /^elpaso-\d\d\.jpg$/.test(name)).sort();
assert(sourceImages.length === 8, `Se esperaban 8 activos fuente; hay ${sourceImages.length}.`);
assert(JSON.stringify(sourceImages) === JSON.stringify(publicImages), 'La copia pública de imágenes está incompleta.');
for (const name of sourceImages) {
  const source = fs.readFileSync(path.join(root, 'assets/images', name));
  const published = fs.readFileSync(path.join(root, 'public/assets/images', name));
  assert(source.equals(published), `El activo público difiere del original: ${name}`);
}

console.log(JSON.stringify({
  status: 'PASS',
  javascriptSyntax: 'PASS',
  catalogProducts: 6,
  sourceImages: sourceImages.length,
  missingAssets: 0,
  remoteDependencies: 0,
  networkAPIs: 0,
  prefix: '/demos/el-paso/'
}, null, 2));
