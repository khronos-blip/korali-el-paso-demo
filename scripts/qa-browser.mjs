import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const prefix = '/demos/el-paso';
const screenshotDir = path.join(root, 'qa/screenshots');
fs.mkdirSync(screenshotDir, { recursive: true });

const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml'};
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  if (url.pathname !== prefix && !url.pathname.startsWith(`${prefix}/`)) {
    res.writeHead(404, {'content-type':'text/plain'}).end('Not found'); return;
  }
  let relative = decodeURIComponent(url.pathname.slice(prefix.length)).replace(/^\/+/, '');
  if (!relative) relative = 'index.html';
  const file = path.resolve(publicDir, relative);
  if (!file.startsWith(`${publicDir}${path.sep}`) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404, {'content-type':'text/plain'}).end('Not found'); return;
  }
  res.writeHead(200, {'content-type':types[path.extname(file)] || 'application/octet-stream','cache-control':'no-store'});
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();
const baseURL = `http://127.0.0.1:${port}${prefix}/`;

const executableCandidates = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'
];
const executablePath = executableCandidates.find(fs.existsSync);
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const report = {status:'RUNNING', baseURL, desktop:{}, mobile:{}, consoleErrors:[], pageErrors:[], failedRequests:[], offOriginRequests:[]};
let browser;

function observe(page) {
  page.on('console', msg => { if (msg.type() === 'error') report.consoleErrors.push(msg.text()); });
  page.on('pageerror', error => report.pageErrors.push(error.message));
  page.on('requestfailed', request => report.failedRequests.push(`${request.method()} ${request.url()} :: ${request.failure()?.errorText || 'failed'}`));
  page.on('request', request => {
    const url = new URL(request.url());
    if (!['127.0.0.1', 'localhost'].includes(url.hostname) && url.protocol !== 'data:') report.offOriginRequests.push(request.url());
  });
}

async function bodyOverflow(page) {
  return page.evaluate(() => ({scrollWidth:document.documentElement.scrollWidth, clientWidth:document.documentElement.clientWidth, overflow:document.documentElement.scrollWidth > document.documentElement.clientWidth + 1}));
}

try {
  browser = await chromium.launch({headless:true, ...(executablePath ? {executablePath} : {})});

  const desktopContext = await browser.newContext({viewport:{width:1440,height:1000}, deviceScaleFactor:1});
  const page = await desktopContext.newPage();
  observe(page);
  await page.goto(baseURL, {waitUntil:'networkidle'});
  assert(await page.locator('.demo-bar').isVisible(), 'Disclosure no visible en escritorio.');
  assert(await page.locator('.product-card').count() === 6, 'Catálogo de escritorio no muestra 6 productos.');
  assert((await page.locator('body').innerText()).includes('Por confirmar'), 'Falta Por confirmar en la interfaz.');
  await page.evaluate(async () => {
    const images = [...document.images];
    images.forEach(image => { image.loading = 'eager'; });
    await Promise.all(images.map(image => image.complete ? image.decode().catch(() => {}) : new Promise(resolve => image.addEventListener('load', resolve, {once:true}))));
  });
  await page.screenshot({path:path.join(screenshotDir,'desktop-catalog.png'), fullPage:true});

  await page.locator('#searchToggle').click();
  await page.locator('#searchInput').fill('skincare');
  assert(await page.locator('.product-card').count() === 1, 'La búsqueda skincare no devuelve 1 resultado.');
  await page.locator('#searchInput').fill('');
  await page.locator('#searchClose').click();
  await page.locator('[data-category="moda"]').click();
  assert(await page.locator('.product-card').count() === 3, 'El filtro Moda no devuelve 3 productos.');
  await page.locator('[data-category="all"]').click();

  await page.locator('.product-card').nth(0).locator('[data-detail]').click();
  assert(await page.locator('#productDialog').isVisible(), 'No abre el detalle de producto.');
  await page.screenshot({path:path.join(screenshotDir,'desktop-detail.png')});
  await page.locator('#productDialog [data-add-detail]').click();
  await page.locator('#productDialog [data-close]').click();

  await page.locator('.product-card').nth(1).locator('[data-detail]').click();
  await page.locator('#productDialog [data-add-detail]').click();
  await page.locator('#productDialog [data-close]').click();
  await page.locator('.product-card').nth(0).locator('[data-wish]').click();
  assert(await page.locator('#cartCount').innerText() === '2', 'La bolsa no registra dos artículos.');
  assert(await page.locator('#wishlistCount').innerText() === '1', 'Favoritos no registra un artículo.');

  await page.reload({waitUntil:'networkidle'});
  assert(await page.locator('#cartCount').innerText() === '2', 'La bolsa no persiste tras recarga.');
  assert(await page.locator('#wishlistCount').innerText() === '1', 'Favoritos no persiste tras recarga.');
  await page.locator('#cartToggle').click();
  assert(await page.locator('#cartDrawer .line-item').count() === 2, 'El drawer no contiene dos líneas de producto.');
  await page.locator('#cartDrawer .line-item').first().locator('[data-change="1"]').click();
  assert(await page.locator('#cartCount').innerText() === '3', 'El control de cantidad no incrementa.');
  assert((await page.locator('#cartDrawer').innerText()).includes('Total') && (await page.locator('#cartDrawer').innerText()).includes('Por confirmar'), 'El total no aparece como Por confirmar.');
  await page.screenshot({path:path.join(screenshotDir,'desktop-cart.png')});

  await page.locator('#checkoutButton').click();
  await page.locator('input[value="delivery"]').check();
  await page.locator('#terms').check();
  await page.locator('#checkoutForm button[type="submit"]').click();
  assert(await page.locator('#addressError').innerText() !== '', 'Entrega permite continuar sin dirección.');
  await page.locator('#address').fill('Dirección de prueba local');
  await page.locator('#checkoutForm button[type="submit"]').click();
  assert(await page.locator('#confirmation').isVisible(), 'No aparece la confirmación simulada.');
  assert((await page.locator('#confirmation').innerText()).includes('No se enviaron datos'), 'La confirmación no declara que no hubo envío.');
  await page.screenshot({path:path.join(screenshotDir,'desktop-confirmation.png')});

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('el-paso-demo-v1')));
  assert(saved?.lastConfirmation?.method === 'delivery', 'La confirmación no persiste localmente.');
  report.desktop = {catalogProducts:6, search:'PASS', categoryFilter:'PASS', detail:'PASS', wishlist:'PASS', cartDistinctItems:2, quantityTotal:3, persistence:'PASS', deliveryAddressRequired:'PASS', confirmation:'PASS', overflow:await bodyOverflow(page)};
  assert(!report.desktop.overflow.overflow, 'Existe overflow horizontal en escritorio.');
  await desktopContext.close();

  const mobileContext = await browser.newContext({viewport:{width:390,height:844}, deviceScaleFactor:2, isMobile:true, hasTouch:true});
  const mobile = await mobileContext.newPage();
  observe(mobile);
  await mobile.goto(baseURL, {waitUntil:'networkidle'});
  await mobile.evaluate(() => localStorage.clear());
  await mobile.reload({waitUntil:'networkidle'});
  assert(await mobile.locator('.demo-bar').isVisible(), 'Disclosure no visible en móvil.');
  assert(await mobile.locator('.product-card').count() === 6, 'Catálogo móvil no muestra 6 productos.');
  await mobile.screenshot({path:path.join(screenshotDir,'mobile-first-view.png')});
  await mobile.locator('.product-card').first().locator('[data-detail]').click();
  assert(await mobile.locator('#productDialog').isVisible(), 'Detalle no abre en móvil.');
  await mobile.screenshot({path:path.join(screenshotDir,'mobile-detail.png')});
  const mobileOverflow = await bodyOverflow(mobile);
  assert(!mobileOverflow.overflow, `Existe overflow horizontal móvil: ${JSON.stringify(mobileOverflow)}`);
  report.mobile = {viewport:'390x844@2x', catalogProducts:6, detail:'PASS', overflow:mobileOverflow};
  await mobileContext.close();

  assert(report.consoleErrors.length === 0, `Errores de consola: ${report.consoleErrors.join(' | ')}`);
  assert(report.pageErrors.length === 0, `Errores de página: ${report.pageErrors.join(' | ')}`);
  assert(report.failedRequests.length === 0, `Solicitudes fallidas: ${report.failedRequests.join(' | ')}`);
  assert(report.offOriginRequests.length === 0, `Solicitudes externas: ${report.offOriginRequests.join(' | ')}`);
  report.status = 'PASS';
} catch (error) {
  report.status = 'FAIL';
  report.error = error.stack || String(error);
  throw error;
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
  fs.writeFileSync(path.join(root, 'qa/report.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
}
