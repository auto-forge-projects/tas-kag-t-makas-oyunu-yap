'use strict';
// tas-kag-t-makas-oyunu-yap — Express statik sunucu + /health. TÜM oyun mantığı
// istemcide (public/game.js); bu dosya rastgelelik/kural üretmez, yalnız statik
// dosya servisi + sağlık kontrolü yapar (FR-5).
const path = require('node:path');
const express = require('express');

const app = express();

// SEC-1: güvenlik başlıkları (Helmet kullanmadan elle — DL-09-001, dice-game kalıbı).
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; base-uri 'self'; form-action 'self'"
  );
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});

// SEC-2: yalnız public/ kökü servis edilir; dotfile'lar (.git, .env vb.) asla servis edilmez.
app.use(
  express.static(path.join(__dirname, '..', 'public'), {
    dotfiles: 'ignore',
    index: 'index.html',
  })
);

// FR-5 / NFR-8 / SEC-6: sabit, tek alanlı yanıt — versiyon/env/uptime sızdırmaz.
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// SEC-3: bilinmeyen route için sade 404, dizin listeleme/stack trace yok.
app.use((req, res) => {
  res.status(404).send('Not Found');
});

// SEC-3: prod'da hata detayı/stack trace sızmaz.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(500).send('Internal Server Error');
});

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => console.log(`tas-kag-t-makas-oyunu-yap on :${port}`));
}

module.exports = app;
