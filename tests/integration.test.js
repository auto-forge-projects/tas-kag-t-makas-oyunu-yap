'use strict';
// Faz 11 (Test) — entegrasyon testleri: birim testlerinin (game.test.js, health.test.js)
// KAPSAMADIĞI FR/NFR'ler. Bkz. docs/11-test/test-plan.md.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const request = require('supertest');
const app = require('../src/server.js');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const ASSETS = ['index.html', 'styles.css', 'app.js', 'game.js'];

test('NFR-2: toplam sayfa boyutu (html+css+js) ≤ 200KB', () => {
  const totalBytes = ASSETS.reduce(
    (sum, f) => sum + fs.statSync(path.join(PUBLIC_DIR, f)).size,
    0
  );
  assert.ok(totalBytes <= 200 * 1024, `toplam ${totalBytes} byte, bütçe 200KB`);
});

test('FR-4/NFR-3: sunucu oturum/cookie oluşturmaz (ardışık 2 istek)', async () => {
  const r1 = await request(app).get('/');
  const r2 = await request(app).get('/');
  assert.equal(r1.headers['set-cookie'], undefined);
  assert.equal(r2.headers['set-cookie'], undefined);
});

test('FR-4: istemci kodu localStorage/sessionStorage/cookie KULLANMAZ (statik denetim)', () => {
  // Yorum satırlarında bu API adları geçebilir (ör. "KULLANILMAZ" açıklaması) —
  // yalnız GERÇEK erişim kalıbını (üye erişimi) ara, çıplak kelimeyi değil.
  const clientSrc = ['app.js', 'game.js']
    .map((f) => fs.readFileSync(path.join(PUBLIC_DIR, f), 'utf8'))
    .join('\n');
  assert.doesNotMatch(clientSrc, /\blocalStorage\s*[.[]|\bsessionStorage\s*[.[]|document\.cookie/);
});

test('SEC-4: app.js DOM yazımı yalnız textContent (innerHTML ataması yok)', () => {
  const appJs = fs.readFileSync(path.join(PUBLIC_DIR, 'app.js'), 'utf8');
  assert.doesNotMatch(appJs, /\.innerHTML\s*=/);
});

test('NFR-5: aria-live sonuç bölgesi + 3 hamle gerçek <button> elemanı', () => {
  const html = fs.readFileSync(path.join(PUBLIC_DIR, 'index.html'), 'utf8');
  assert.match(html, /aria-live="polite"/);
  const buttonCount = (html.match(/<button[^>]*data-move=/g) || []).length;
  assert.equal(buttonCount, 3);
});
