'use strict';
// game.js — taş/kağıt/makas saf oyun mantığı (FR-2, FR-3, FR-6). Sunucu tarafında
// rastgelelik/kural değerlendirme YOK; bu dosya hem tarayıcıda (script tag) hem
// Node testinde (require) çalışır.

var MOVES = ['tas', 'kagit', 'makas'];

// Açık kazanç haritası: her hamle hangi hamleyi yener (DL-04-001).
var BEATS = { tas: 'makas', kagit: 'tas', makas: 'kagit' };

/**
 * Adil rastgele bilgisayar hamlesi üretir (FR-2).
 * @returns {'tas'|'kagit'|'makas'}
 */
function randomMove() {
  return MOVES[Math.floor(Math.random() * MOVES.length)];
}

/**
 * 9 olası kombinasyonun tamamını doğru çözer (FR-3).
 * @param {'tas'|'kagit'|'makas'} user
 * @param {'tas'|'kagit'|'makas'} cpu
 * @returns {'win'|'lose'|'tie'}
 */
function decide(user, cpu) {
  if (!MOVES.includes(user) || !MOVES.includes(cpu)) {
    throw new Error('Geçersiz hamle: ' + user + ', ' + cpu);
  }
  if (user === cpu) return 'tie';
  return BEATS[user] === cpu ? 'win' : 'lose';
}

// Çift-ortam export: tarayıcıda `module` tanımsızdır (script tag ile yüklenince
// `MOVES`/`randomMove`/`decide` global scope'ta kalır); Node'da (node:test) require
// edilebilir olması gerekir.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MOVES: MOVES, BEATS: BEATS, randomMove: randomMove, decide: decide };
}
