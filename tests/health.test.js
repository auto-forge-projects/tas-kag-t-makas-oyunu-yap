'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const request = require('supertest');
const app = require('../src/server.js');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

test('GET /health → 200 {"status":"ok"} yalnız (SEC-6, FR-5, NFR-8)', async () => {
  const res = await request(app).get('/health');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { status: 'ok' });
  // SEC-6: versiyon/env/uptime/host detayı sızdırmaz — yanıt tek alan.
  assert.deepEqual(Object.keys(res.body), ['status']);
});

test('GET / → 200 statik HTML servis edilir (FR-5)', async () => {
  const res = await request(app).get('/');
  assert.equal(res.status, 200);
  assert.match(res.headers['content-type'], /html/);
});

test('SEC-1: güvenlik başlıkları set edilir', async () => {
  const res = await request(app).get('/');
  assert.match(res.headers['content-security-policy'], /default-src 'self'/);
  assert.equal(res.headers['x-content-type-options'], 'nosniff');
  assert.equal(res.headers['x-frame-options'], 'DENY');
  assert.equal(res.headers['referrer-policy'], 'no-referrer');
});

test('SEC-2: dotfile servis edilmez → 404 (gerçek dosya var olsa bile)', async () => {
  const fixture = path.join(PUBLIC_DIR, '.dotfile-fixture');
  fs.writeFileSync(fixture, 'should-not-be-served');
  try {
    const res = await request(app).get('/.dotfile-fixture');
    assert.equal(res.status, 404);
  } finally {
    fs.unlinkSync(fixture);
  }
});

test('SEC-3: bilinmeyen route için sade 404, stack trace sızmaz', async () => {
  const res = await request(app).get('/nope-route-xyz');
  assert.equal(res.status, 404);
  assert.ok(!/at\s+\S+\s+\(/.test(res.text || ''), 'gövdede stack trace izi olmamalı');
});
