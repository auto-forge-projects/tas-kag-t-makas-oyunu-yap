'use strict';
// app.js — UI orkestrasyonu. Depolama (localStorage/sessionStorage/çerez) KULLANILMAZ (FR-4).
// DOM'a yazım yalnız textContent ile yapılır (SEC-4) — innerHTML string ataması yoktur.
// randomMove()/decide() global scope'tan gelir (game.js önce <script> ile yüklenir).

(function () {
  var DISABLE_MS = 300; // NFR-1: ≤1sn toplam; prefers-reduced-motion'da atlanır

  var LABEL = { tas: '✊ Taş', kagit: '✋ Kağıt', makas: '✌️ Makas' };
  // Kazanan hamle tipi -> kullandığı fiil (tas ezer, kagit sarar, makas keser).
  var VERB = { tas: 'ezer', kagit: 'sarar', makas: 'keser' };

  var buttons = Array.prototype.slice.call(document.querySelectorAll('button[data-move]'));
  var roundEl = document.getElementById('round');
  var resultEl = document.getElementById('result');
  var scoreEl = document.getElementById('score');
  var isProcessing = false;
  var score = { win: 0, lose: 0, tie: 0 };

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function setText(el, text) {
    el.textContent = text; // SEC-4: yalnız textContent, innerHTML yok
  }

  function renderScore() {
    setText(scoreEl, 'Kazanma: ' + score.win + ' · Kaybetme: ' + score.lose + ' · Berabere: ' + score.tie);
  }

  function resultText(user, cpu, result) {
    if (result === 'tie') {
      return 'Berabere! İkiniz de ' + LABEL[user] + ' seçti.';
    }
    var winnerMove = result === 'win' ? user : cpu;
    var loserMove = result === 'win' ? cpu : user;
    var verb = VERB[winnerMove];
    if (result === 'win') {
      return 'Kazandın! ' + LABEL[winnerMove] + ', ' + LABEL[loserMove] + '\'ı ' + verb + '.';
    }
    return 'Kaybettin! ' + LABEL[winnerMove] + ', ' + LABEL[loserMove] + '\'ı ' + verb + '.';
  }

  function setButtonsDisabled(disabled) {
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].disabled = disabled;
    }
  }

  function playRound(userMove) {
    if (isProcessing) return; // FR-1: tur işlenirken yeni tur tetiklenmez
    isProcessing = true;
    setButtonsDisabled(true);

    var cpuMove = randomMove(); // game.js — istemci Math.random() (FR-2)
    var result = decide(userMove, cpuMove); // game.js (FR-3)

    score[result === 'win' ? 'win' : result === 'lose' ? 'lose' : 'tie']++;

    setText(roundEl, LABEL[userMove] + ' vs ' + LABEL[cpuMove]);
    setText(resultEl, resultText(userMove, cpuMove, result));
    renderScore();

    var delay = prefersReducedMotion() ? 0 : DISABLE_MS;
    window.setTimeout(function () {
      setButtonsDisabled(false);
      isProcessing = false;
    }, delay);
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      playRound(btn.getAttribute('data-move'));
    });
    // Not: <button> Space/Enter'ı native olarak 'click' event'ine çevirir (NFR-5).
  });

  renderScore();
})();
