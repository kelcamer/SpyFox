/* Title screen, travel and ending cutscenes, hints, and boot. */
window.SF = window.SF || {};
(function (SF) {
  const A = SF.audio, G = SF.game, K = SF.K, K3 = SF.K3, INK = SF.INK;
  const $ = (s) => document.querySelector(s);
  const M = SF.main = {};

  const bowl = `<g><ellipse cx="0" cy="0" rx="150" ry="40" fill="#fff8e1" ${K}/>
    ${Array.from({ length: 14 }, (_, i) => `<circle cx="${-110 + (i * 37) % 220}" cy="${-6 + (i % 3) * 6}" r="14" fill="${['#ffc93c', '#ff8a65', '#ffe082'][i % 3]}" ${K3}/>`).join('')}
    <path d="M-150,0 Q-140,110 0,120 Q140,110 150,0" fill="#1e63c4" ${K}/><path d="M-120,40 Q0,70 120,40" stroke="#fff" stroke-width="8" fill="none" opacity=".5"/>
    <g transform="rotate(-30)"><rect x="40" y="-170" width="22" height="160" rx="10" fill="#cfd8dc" ${K}/><ellipse cx="51" cy="-180" rx="26" ry="36" fill="#cfd8dc" ${K}/></g></g>`;

  M.title = function () {
    G.scene = null; G.cut = true;
    ['#layer-bg', '#layer-actors', '#layer-fg', '#layer-fx'].forEach((s) => ($(s).innerHTML = ''));
    $('#panel').hidden = true; $('#minigame').hidden = true; $('#choices').hidden = true; $('#subtitle').hidden = true;
    G.setBar(false);
    const save = G.loadSave();
    const scr = $('#screen'); scr.hidden = false;
    scr.innerHTML = `<svg viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice">
      <defs><radialGradient id="tg" cx="50%" cy="40%" r="70%"><stop offset="0" stop-color="#3b2a7a"/><stop offset="1" stop-color="#0c0820"/></radialGradient></defs>
      <rect width="1280" height="720" fill="url(#tg)"/>
      ${Array.from({ length: 30 }, (_, i) => `<circle cx="${(i * 197) % 1280}" cy="${(i * 113) % 420}" r="${1 + (i % 3)}" fill="#fff" class="${i % 3 ? 'pulse' : ''}"/>`).join('')}
      <g opacity=".18"><path d="M640,720 L200,0 L420,0Z" fill="#fff"/><path d="M640,720 L880,0 L1080,0Z" fill="#fff"/></g>
      ${[260, 200, 140, 80].map((r, i) => `<circle cx="1040" cy="430" r="${r}" fill="none" stroke="#ffc93c" stroke-width="${6 - i}" opacity="${0.15 + i * 0.1}"/>`).join('')}
      <g transform="translate(1040,560) scale(.9)">${bowl}</g>
      <g transform="translate(270,690) scale(1.45)"><g class="actor talking-title">${SF.art.fox()}</g></g>
      <g transform="translate(700,170)" text-anchor="middle">
        <text class="logo-text" y="8" font-size="170" fill="${INK}" transform="translate(8,10)">SPY FOX</text>
        <text class="logo-text" y="8" font-size="170" fill="#ffc93c" stroke="${INK}" stroke-width="6" paint-order="stroke">SPY FOX</text>
        <text class="logo-text" y="80" font-size="40" fill="#fff8e7">in</text>
        <text class="logo-text" y="150" font-size="78" fill="#fff8e7" stroke="#e8324a" stroke-width="10" paint-order="stroke">"DRY CEREAL"</text>
      </g></svg>
      <div class="title-ui">
        <button class="btn" id="t-new">${save ? 'New mission' : 'Start mission'}</button>
        ${save ? '<button class="btn alt" id="t-cont">Continue mission</button>' : ''}
      </div>
      <p class="title-foot">A fan-made tribute to Humongous Entertainment's 1997 classic. Not affiliated. All art, music and dialogue are original.</p>`;
    A.music('spy');
    $('#t-new').onclick = () => { A.init(); A.sfx('fanfare'); M.start(G.newState()); };
    if (save) $('#t-cont').onclick = () => { A.init(); A.sfx('click'); M.start(save); };
  };

  M.start = async function (state) {
    G.state = state; G.cut = false; G.busy = 0;
    await G.fade(true);
    $('#screen').hidden = true; $('#screen').innerHTML = '';
    G.setBar(true);
    G.loadScene(state.scene);
    await G.fade(false);
    if (G.scene.enter) { G.busy++; try { await G.scene.enter(G, state.from); } finally { G.busy--; } }
  };

  M.travel = async function () {
    G.cut = true; G.setBar(false);
    await G.fade(true);
    const scr = $('#screen'); scr.hidden = false;
    scr.innerHTML = `<svg viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice">
      <defs><linearGradient id="tvs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9a6b"/><stop offset="1" stop-color="#ffe0b2"/></linearGradient><linearGradient id="tvw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e88e5"/><stop offset="1" stop-color="#0d47a1"/></linearGradient></defs>
      <rect width="1280" height="720" fill="url(#tvs)"/><circle cx="640" cy="380" r="120" fill="#fff59d" opacity=".9"/>
      <path d="M880,400 Q980,250 1100,300 Q1180,240 1280,320 L1280,400Z" fill="#7cb342" ${K3}/>
      <rect x="0" y="400" width="1280" height="320" fill="url(#tvw)"/>
      <g class="wave-anim" opacity=".5">${Array.from({ length: 10 }, (_, i) => `<path d="M${i * 140},${460 + (i % 3) * 70} q20,-10 40,0 t40,0" stroke="#fff" stroke-width="4" fill="none"/>`).join('')}</g>
      <g id="tv-car" transform="translate(-300,560)"><g class="wave-anim" style="animation-duration:.8s">${SF.drawCar(true)}</g>
        <path d="M-170,-6 Q-260,-30 -360,-6" stroke="#fff" stroke-width="10" fill="none" opacity=".7" stroke-linecap="round"/></g>
      <g transform="translate(640,150)" text-anchor="middle"><text class="logo-text" font-size="64" fill="#fff8e7" stroke="${INK}" stroke-width="8" paint-order="stroke">ACIDOPHILUS ISLAND</text>
        <text class="logo-text" y="56" font-size="34" fill="#e8324a" stroke="#fff" stroke-width="6" paint-order="stroke">GREECE · 0600 HOURS</text></g></svg>`;
    await G.fade(false);
    A.sfx('honk');
    const car = $('#tv-car'); const t0 = performance.now(), dur = 4200;
    await new Promise((res) => {
      const step = (ts) => {
        const t = Math.min(1, (ts - t0) / dur);
        car.setAttribute('transform', `translate(${-300 + t * 1800},${560 - Math.sin(t * Math.PI) * 30})`);
        if (t < 1) requestAnimationFrame(step); else res();
      };
      requestAnimationFrame(step);
    });
    await G.fade(true);
    scr.hidden = true; scr.innerHTML = '';
    G.cut = false; G.setBar(true);
    G.set('arrived');
    G.loadScene('docks', 'hq');
    await G.fade(false);
    G.busy++;
    try { await G.talk([['fox', 'Acidophilus Island. Sunshine, blue water and an evil goat. Lovely.'], ['fox', 'My contact should be at the café in town. Up those stairs.']]); } finally { G.busy--; }
  };

  M.ending = async function () {
    G.cut = true; G.setBar(false);
    await G.fade(true);
    ['#layer-bg', '#layer-actors', '#layer-fg', '#layer-fx'].forEach((s) => ($(s).innerHTML = ''));
    G.scene = null;
    A.music('win');
    const scr = $('#screen'); scr.hidden = false;
    const confetti = Array.from({ length: 40 }, (_, i) => `<rect x="${(i * 131) % 1280}" y="${(i * 71) % 400}" width="14" height="8" fill="${['#ffc93c', '#e8324a', '#2fd0bd', '#ff7eb6'][i % 4]}" transform="rotate(${i * 37} ${(i * 131) % 1280} ${(i * 71) % 400})" class="pulse"/>`).join('');
    scr.innerHTML = `<svg viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice">
      <rect width="1280" height="720" fill="#1b2350"/><rect y="500" width="1280" height="220" fill="#2b2160"/>
      ${confetti}
      <g transform="translate(640,110)" text-anchor="middle"><text class="logo-text" font-size="80" fill="#ffc93c" stroke="${INK}" stroke-width="8" paint-order="stroke">MISSION ACCOMPLISHED</text></g>
      <g transform="translate(230,610) scale(.85)"><g class="actor" id="e-penny">${SF.art.penny()}</g></g>
      <g transform="translate(470,620) scale(.95)"><g class="actor" id="e-fox">${SF.art.fox()}</g></g>
      <g transform="translate(760,610) scale(.85) scale(-1,1)"><g class="actor" id="e-udder">${SF.art.udder()}</g></g>
      <g transform="translate(1020,610) scale(.85) scale(-1,1)"><g class="actor" id="e-quack">${SF.art.quack()}</g></g>
      <g transform="translate(470,690) scale(.4)">${bowl}</g></svg>`;
    await G.fade(false);
    const el = (id) => document.getElementById(id);
    await G.say('penny', 'Spy Fox, you did it! William and LeRoach are behind bars, and the world\'s milk is safe!', { talkEl: el('e-penny') });
    await G.say('udder', 'Thanks to you, children everywhere can pour milk on their cereal again. Please accept a lifetime supply of milk!', { talkEl: el('e-udder') });
    await G.say('quack', 'And my gadgets worked! Well... mostly. Quack-tastic!', { talkEl: el('e-quack') });
    await G.say('fox', 'All in a day\'s work. Now, who wants a bowl of cereal? With milk, of course.', { talkEl: el('e-fox') });
    const mins = Math.max(1, Math.round((Date.now() - (G.state.started || Date.now())) / 60000));
    G.clearSave();
    scr.insertAdjacentHTML('beforeend', `<div class="credits" style="background:rgba(12,8,32,.82)">
      <h1>THE END</h1>
      <p>Spy Fox saved the world's breakfast in about ${mins} minute${mins === 1 ? '' : 's'}.</p>
      <p class="stats">Passwords, seats and the cowbell code change every game. Play again for a new mission!</p>
      <p style="font-size:calc(var(--u)*20);opacity:.75">A fan-made tribute to Spy Fox in "Dry Cereal" (Humongous Entertainment, 1997). Original art, music and dialogue made in code.</p>
      <div class="btn-row"><button class="btn" id="e-again">Play again</button><button class="btn alt" id="e-title">Title screen</button></div></div>`);
    $('#e-again').onclick = () => { A.sfx('fanfare'); M.start(G.newState()); };
    $('#e-title').onclick = () => { A.sfx('click'); M.title(); };
  };

  /* ---------- Monkey Penny's hints ---------- */
  SF.hint = function (G) {
    const f = (k) => G.flag(k), pw = G.state.rand.passwords[G.state.rand.pw], sc = G.state.scene;
    if (!f('gadgets')) return 'Professor Quack is waiting at the gadget table, Spy Fox. Tap him to collect your new gadgets.';
    if (!f('arrived')) return 'Your Spy Car is in the garage. Tap the garage door on the left and you\'re off to Acidophilus Island!';
    if (!f('metAgent')) {
      if (sc === 'docks') return 'Your contact is at Café Feta in the town square. Take the stairs on the right.';
      return `Find your contact at Café Feta. They'll be reading the newspaper upside down. The password is: ${pw}`;
    }
    if (!f('casinoOk')) {
      if (G.has('carnation')) return 'You have a red carnation! Give it to Bruno, the doorman at the casino. Tap the carnation, then tap Bruno.';
      if (G.has('cappuccino')) return 'Baa-bara at the flower cart wants a cappuccino. Tap the cappuccino, then tap Baa-bara.';
      if (f('sheepWantsCoffee')) return 'Baa-bara wants a cappuccino. Maybe Walter the Waiter at Café Feta can make one.';
      if (f('metDoorman')) return 'The casino has a dress code: a red carnation. Baa-bara sells flowers in the town square.';
      return 'Napoleon LeRoach plays Go Fish at the casino. Talk to Bruno, the doorman, to get inside.';
    }
    if (!f('wonGame')) {
      if (!f('lostOnce')) return 'Challenge Napoleon LeRoach to a game of Go Fish. Win, and the fortress keycard is yours!';
      if (!f('mirrorGum')) return f('sawMirror') ? 'Cover that mirror so LeRoach can\'t peek! Professor Quack\'s Spy Gum makes a bubble that sticks to anything.' : 'LeRoach always knows your cards. Look around the casino. Is something shiny behind your seat?';
      return 'The mirror is covered. Now beat LeRoach fair and square. You can do it, Spy Fox!';
    }
    if (!f('gateOpen')) return 'Take the road behind the fountain up to the Goat Fortress, then use the keycard on the card reader.';
    if (!f('freedUdder')) {
      if (sc === 'corridor') return f('misted') ? 'Watch a laser blink. The moment it switches off, tap it to dash across!' : 'Invisible lasers! Spritz Professor Quack\'s Spy Mist Cologne in the hallway to see them.';
      if (sc === 'lab') return 'Free Mr. Udder! Laser Lipstick cuts right through rope.';
      return 'Get through the fortress to William\'s lab. Mr. Udder must be inside!';
    }
    return 'Play the cowbell code on the control console. Tap Mr. Udder if you need to hear it again.';
  };

  /* ---------- Boot ---------- */
  function boot(data) {
    G.init();
    G.loadPrefs();
    window.claude?.hot?.snapshot?.(() => ({ state: G.state && G.scene ? G.state : null }));
    if (data && data.state) M.start(data.state);
    else M.title();
    if ('serviceWorker' in navigator && location.protocol === 'https:' && document.documentElement.dataset.pwa === '1') {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }
  const hot = window.claude?.hot;
  if (hot?.ready) hot.ready(boot); else boot(hot?.data ?? {});
})(window.SF);
