/* Mini-games: Go Fish with Napoleon LeRoach, and the cowbell shut-off code. */
window.SF = window.SF || {};
(function (SF) {
  const A = SF.audio, K3 = SF.K3, INK = SF.INK;
  const $ = (s) => document.querySelector(s);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const RANKS = 7;
  const TINT = ['#eceff1', '#fff3e0', '#fffde7', '#e3f2fd', '#f3e5f5', '#ffebee', '#e0f2f1'];

  const cardFace = (r) => `<svg viewBox="0 0 100 140"><rect x="0" y="0" width="100" height="140" fill="${TINT[r]}"/>${SF.cardArt[r].svg}
    <text x="50" y="128" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="15" fill="${INK}">${SF.cardArt[r].name}</text></svg>`;
  const plural = (r, n) => `${n === 1 ? 'a' : n} ${SF.cardArt[r].name}${n === 1 ? '' : (SF.cardArt[r].name.endsWith('sh') ? 'es' : 's')}`;
  const nameOf = (r) => SF.cardArt[r].name.replace(/fish$/, 'fish').toLowerCase();

  SF.gofish = {
    play(G, rigged) {
      return new Promise((resolve) => {
        const root = $('#minigame');
        root.hidden = false; G.setBar(false);
        A.music('casino');
        root.innerHTML = `<div class="felt">
          <div class="gf-row"><div style="width:calc(var(--u)*120);height:calc(var(--u)*140);flex:none"><svg viewBox="-70 -120 160 170" style="width:100%;height:100%"><g class="actor" id="gf-roach">${SF.art.leroachHead()}</g></svg></div><div class="hand theirs gf-row" id="gf-them"></div></div>
          <div class="gf-mid">
            <div class="gf-books" id="gf-mybooks"><span class="gf-label">Your sets: <b id="gf-myn">0</b></span></div>
            <div class="gf-center"><div class="deck" id="gf-deck"></div><div class="gf-msg" id="gf-msg">Shuffling...</div></div>
            <div class="gf-books right" id="gf-theirbooks"><span class="gf-label">LeRoach's sets: <b id="gf-thn">0</b></span></div>
          </div>
          <div class="hand mine gf-row locked" id="gf-me"></div>
          <button class="btn alt gf-quit" id="gf-quit">Leave table</button></div>`;

        let deck = [];
        for (let r = 0; r < RANKS; r++) for (let k = 0; k < 4; k++) deck.push(r);
        deck = G.shuffle(deck);
        const hand = { p: [], c: [] }, books = { p: [], c: [] };
        const memory = new Set();
        let finished = false, myTurn = false;

        const msg = (t) => { $('#gf-msg').textContent = t; };
        const roachSays = (t) => {
          msg(t);
          const el = $('#gf-roach'); if (el) { el.classList.add('talking'); setTimeout(() => el.classList.remove('talking'), 900); }
          A.speak('leroach', t.replace(/^LeRoach: /, ''));
        };
        function render() {
          hand.p.sort((x, y) => x - y);
          $('#gf-me').innerHTML = '';
          hand.p.forEach((r) => {
            const b = document.createElement('button'); b.className = 'card'; b.innerHTML = cardFace(r);
            b.setAttribute('aria-label', `Ask for ${SF.cardArt[r].name}`);
            b.addEventListener('click', () => ask(r));
            $('#gf-me').appendChild(b);
          });
          $('#gf-them').innerHTML = hand.c.map(() => '<div class="card back"></div>').join('');
          $('#gf-deck').innerHTML = deck.length ? `<div class="card back"></div><div class="deck-count">${deck.length}</div>` : '';
          const bk = (list) => list.map((r) => `<div class="card small">${cardFace(r)}</div>`).join('');
          $('#gf-mybooks').innerHTML = `<span class="gf-label">Your sets: ${books.p.length}</span>${bk(books.p)}`;
          $('#gf-theirbooks').innerHTML = `<span class="gf-label">LeRoach's sets: ${books.c.length}</span>${bk(books.c)}`;
          $('#gf-me').classList.toggle('locked', !myTurn);
        }
        function draw(who, bias) {
          if (!deck.length) return null;
          let idx = deck.length - 1;
          if (bias) { const j = deck.findIndex((r) => hand.p.includes(r)); if (j >= 0 && Math.random() < 0.4) idx = j; }
          const r = deck.splice(idx, 1)[0]; hand[who].push(r); A.sfx('card'); return r;
        }
        function checkBooks(who) {
          let made = null;
          for (let r = 0; r < RANKS; r++) {
            if (hand[who].filter((x) => x === r).length === 4) { hand[who] = hand[who].filter((x) => x !== r); books[who].push(r); made = r; A.sfx(who === 'p' ? 'pickup' : 'buzz'); }
          }
          return made;
        }
        const refill = (who) => { if (!hand[who].length && deck.length) draw(who); };
        const over = () => books.p.length + books.c.length === RANKS;

        async function end() {
          finished = true; myTurn = false; render();
          const won = books.p.length > books.c.length;
          msg(won ? `You win, ${books.p.length} sets to ${books.c.length}!` : `LeRoach wins, ${books.c.length} sets to ${books.p.length}.`);
          A.sfx(won ? 'win' : 'lose');
          await wait(1800);
          close(won);
        }
        function close(won) { root.hidden = true; root.innerHTML = ''; G.setBar(true); A.music(G.scene.music); resolve(won); }

        async function playerTurn() {
          if (finished) return;
          if (over()) return end();
          refill('p');
          if (!hand.p.length) { msg('You have no cards. LeRoach\'s turn.'); await wait(1000); return cpuTurn(); }
          myTurn = true; render();
          msg('Your turn! Tap a card to ask LeRoach for that fish.');
        }
        async function ask(r) {
          if (!myTurn || finished) return;
          myTurn = false; render(); A.sfx('click');
          memory.add(r);
          msg(`You: "Got any ${nameOf(r)}${nameOf(r).endsWith('sh') ? 'es' : 's'}?"`);
          await wait(900);
          const n = hand.c.filter((x) => x === r).length;
          if (n) {
            hand.c = hand.c.filter((x) => x !== r); for (let i = 0; i < n; i++) hand.p.push(r);
            A.sfx('card'); roachSays(`Grr! Take ${plural(r, n)}.`);
            const b = checkBooks('p'); render(); await wait(1200);
            if (b !== null) { msg(`You made a set of ${SF.cardArt[b].name}!`); await wait(1000); }
            refill('c');
            return playerTurn();
          }
          roachSays('Go fish!'); await wait(900);
          const d = draw('p', !rigged);
          render();
          if (d === null) { await wait(500); return cpuTurn(); }
          const b = checkBooks('p'); render();
          if (d === r) { msg(`You fished up a ${SF.cardArt[d].name}! Go again!`); A.sfx('coin'); await wait(1300); return playerTurn(); }
          msg(`You drew a ${SF.cardArt[d].name}.${b !== null ? ' And made a set!' : ''}`);
          await wait(1200);
          return cpuTurn();
        }
        async function cpuTurn() {
          if (finished) return;
          if (over()) return end();
          refill('c'); render();
          if (!hand.c.length) { await wait(400); return playerTurn(); }
          let r;
          const counts = {}; hand.c.forEach((x) => (counts[x] = (counts[x] || 0) + 1));
          const mine = Object.keys(counts).map(Number);
          if (rigged) {
            const hits = mine.filter((x) => hand.p.includes(x)).sort((x, y) => counts[y] - counts[x]);
            r = hits.length ? hits[0] : mine[Math.floor(Math.random() * mine.length)];
          } else {
            r = mine[Math.floor(Math.random() * mine.length)];
          }
          roachSays(`LeRoach: "Got any ${nameOf(r)}${nameOf(r).endsWith('sh') ? 'es' : 's'}?"`);
          await wait(1500);
          const n = hand.p.filter((x) => x === r).length;
          if (n) {
            hand.p = hand.p.filter((x) => x !== r); for (let i = 0; i < n; i++) hand.c.push(r);
            A.sfx('card'); msg(`You hand over ${plural(r, n)}. ${rigged ? 'How did he know?!' : ''}`);
            const b = checkBooks('c'); render(); await wait(1300);
            if (b !== null) { roachSays(`Ha! A set of ${SF.cardArt[b].name}!`); await wait(1100); }
            refill('p');
            return cpuTurn();
          }
          msg('You: "Go fish!"'); await wait(900);
          const d = draw('c');
          checkBooks('c'); render();
          if (d !== null && d === r) { roachSays('Ooh la la! I caught what I wanted. Again!'); await wait(1300); return cpuTurn(); }
          await wait(500);
          return playerTurn();
        }

        $('#gf-quit').addEventListener('click', () => { if (!finished) { finished = true; A.sfx('click'); close(false); } });
        for (let i = 0; i < 5; i++) { draw('p'); draw('c'); }
        checkBooks('p'); checkBooks('c');
        render();
        setTimeout(playerTurn, 700);
      });
    },
  };

  /* ---------------- Cowbells ---------------- */
  const BELL_COLORS = ['#e8324a', '#ffc93c', '#2fd0bd', '#7e57c2'];
  const bellSvg = (c) => `<svg viewBox="0 0 100 120"><path d="M38,14 Q50,0 62,14" fill="none" stroke="#5d4037" stroke-width="8"/><path d="M30,20 L70,20 L84,96 L16,96Z" fill="${c}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M36,30 L40,86" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".5"/><circle cx="50" cy="104" r="10" fill="#9e9e9e" stroke="${INK}" stroke-width="4"/></svg>`;
  function bellsUI(title, interactive) {
    const root = $('#minigame'); root.hidden = false;
    root.innerHTML = `<div class="bells"><h2>${title}</h2>
      <div class="bell-row">${BELL_COLORS.map((c, i) => `<button class="bell" data-i="${i}" aria-label="Cowbell ${i + 1}" ${interactive ? '' : 'disabled'}>${bellSvg(c)}</button>`).join('')}</div>
      <div class="bell-dots" id="bell-dots"></div>
      <div class="gf-msg" id="bell-msg"></div>
      <div class="btn-row" id="bell-btns"></div></div>`;
    return root;
  }
  async function light(i, ms = 420) {
    const b = document.querySelector(`.bell[data-i="${i}"]`); if (!b) return;
    b.classList.add('lit'); A.bell(i); await wait(ms); b.classList.remove('lit');
  }
  SF.bells = {
    async playTune(melody) {
      const G = SF.game; G.setBar(false);
      bellsUI('Mr. Udder rings the secret code', false);
      $('#bell-msg').textContent = 'Listen and watch closely...';
      await wait(800);
      for (const i of melody) { await light(i, 450); await wait(180); }
      await wait(600);
      $('#minigame').hidden = true; $('#minigame').innerHTML = ''; G.setBar(true);
    },
    play(G, melody) {
      return new Promise((resolve) => {
        G.setBar(false);
        bellsUI('Cowbell shut-off code', true);
        const dots = () => { $('#bell-dots').innerHTML = melody.map((_, k) => `<i class="${k < pos ? 'on' : ''}"></i>`).join(''); };
        let pos = 0, locked = false;
        dots();
        $('#bell-msg').textContent = 'Tap the cowbells in the same order Mr. Udder played them.';
        $('#bell-btns').innerHTML = '<button class="btn alt" id="bell-hear">Hear it again</button><button class="btn alt" id="bell-leave">Step away</button>';
        const close = (ok) => { $('#minigame').hidden = true; $('#minigame').innerHTML = ''; G.setBar(true); resolve(ok); };
        $('#bell-leave').onclick = () => { A.sfx('click'); close(false); };
        $('#bell-hear').onclick = async () => {
          if (locked) return; locked = true; pos = 0; dots();
          $('#bell-msg').textContent = 'Listen...';
          for (const i of melody) { await light(i, 450); await wait(180); }
          $('#bell-msg').textContent = 'Your turn!'; locked = false;
        };
        document.querySelectorAll('.bell').forEach((b) => b.addEventListener('click', async () => {
          if (locked) return;
          const i = +b.dataset.i;
          light(i, 300);
          if (i === melody[pos]) {
            pos++; dots();
            if (pos === melody.length) {
              locked = true; $('#bell-msg').textContent = 'CODE ACCEPTED!'; await wait(500); A.sfx('win'); await wait(1300); close(true);
            }
          } else {
            locked = true; await wait(300); A.sfx('buzz');
            $('#bell-msg').textContent = 'Wrong bell! The code starts over. Try again!';
            pos = 0; dots(); await wait(900); locked = false;
          }
        }));
      });
    },
  };
})(window.SF);
