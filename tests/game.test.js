'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomMove, decide, MOVES } = require('../public/game.js');

test('randomMove() daima {tas,kagit,makas} kümesinden biridir', () => {
  for (let i = 0; i < 500; i++) {
    const v = randomMove();
    assert.ok(MOVES.includes(v), `randomMove() gecersiz deger: ${v}`);
  }
});

test('randomMove() asla undefined/bos uretmez', () => {
  for (let i = 0; i < 500; i++) {
    const v = randomMove();
    assert.ok(v !== undefined && v !== null && v !== '');
  }
});

test('buyuk orneklemde her hamle ~%33.3 (±%5 mutlak) siklikta cikar (FR-2)', () => {
  const SAMPLE = 6000;
  const counts = { tas: 0, kagit: 0, makas: 0 };
  for (let i = 0; i < SAMPLE; i++) {
    counts[randomMove()]++;
  }
  for (const move of MOVES) {
    const pct = (counts[move] / SAMPLE) * 100;
    assert.ok(
      pct >= 28.33 && pct <= 38.33,
      `Hamle ${move} beklenen aralik disinda: %${pct.toFixed(2)} (beklenen %28.33-%38.33)`
    );
  }
});

test('decide(): 9 olasi kombinasyonun TAMAMI dogru cozulur (FR-3)', () => {
  const cases = [
    ['tas', 'tas', 'tie'],
    ['tas', 'kagit', 'lose'],
    ['tas', 'makas', 'win'],
    ['kagit', 'tas', 'win'],
    ['kagit', 'kagit', 'tie'],
    ['kagit', 'makas', 'lose'],
    ['makas', 'tas', 'lose'],
    ['makas', 'kagit', 'win'],
    ['makas', 'makas', 'tie'],
  ];
  for (const [user, cpu, expected] of cases) {
    assert.equal(decide(user, cpu), expected, `decide(${user}, ${cpu}) beklenen: ${expected}`);
  }
});

test('decide(): gecersiz hamle icin hata firlatir', () => {
  assert.throws(() => decide('tas', 'gecersiz'));
  assert.throws(() => decide('gecersiz', 'tas'));
});
