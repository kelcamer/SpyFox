/* Point-and-click adventure engine: stage, actors, walking, talking, inventory, saving. */
window.SF = window.SF || {};
(function (SF) {
  const $ = (s) => document.querySelector(s);
  const NS = 'http://www.w3.org/2000/svg';
  const A = SF.audio;
  const SAVE_KEY = 'spyfox-dry-cereal-save';

  SF.chars = {
    fox: { name: 'Spy Fox', color: '#e8324a' },
    penny: { name: 'Monkey Penny', color: '#c2185b' },
    quack: { name: 'Professor Quack', color: '#1565c0' },
    william: { name: 'William the Once-Great', color: '#6a2c91' },
    leroach: { name: 'Napoleon LeRoach', color: '#7a4a26' },
    udder: { name: 'Mr. Udder', color: '#37474f' },
    walrus: { name: 'Walter the Waiter', color: '#5d4037' },
    sheep: { name: 'Baa-bara', color: '#0277bd' },
    pelican: { name: 'Captain Pouch', color: '#ef6c00' },
    bulldog: { name: 'Bruno', color: '#424242' },
    hippo: { name: 'Hippo', color: '#5e35b1' },
    turtle: { name: 'Turtle', color: '#2e7d32' },
    agent: { name: 'Agent Chameleon', color: '#2e7d32' },
    guard: { name: 'Goat Guard', color: '#5d5d4a' },
    gull: { name: 'Seagull', color: '#607d8b' },
    narrator: { name: 'SPY Corp', color: '#e8324a' },
  };

  const G = SF.game = {
    state: null, scene: null, actors: {}, hotspots: [], busy: 0, selected: null,
    skipLine: null, cut: false,
  };

  G.newState = function () {
    const passwords = [
      'The cow jumps over the moon at midnight.',
      'The cheese stands alone in the rain.',
      'The milkman always rings twice.',
      'Breakfast is served on the dark side of the moon.',
    ];
    const pw = Math.floor(Math.random() * passwords.length);
    const seats = shuffle(['hippo', 'turtle', 'agent']);
    const melody = Array.from({ length: 5 }, () => Math.floor(Math.random() * 4));
    return { scene: 'hq', flags: {}, inv: [], rand: { passwords, pw, seats, melody }, started: Date.now() };
  };
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  G.shuffle = shuffle;

  /* ---------- Save / load ---------- */
  G.save = function () { try { localStorage.setItem(SAVE_KEY, JSON.stringify(G.state)); } catch (e) { /* storage unavailable */ } };
  G.loadSave = function () { try { const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); return s && s.flags ? s : null; } catch (e) { return null; } };
  G.clearSave = function () { try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ } };
  G.flag = (k) => !!G.state.flags[k];
  G.set = (k, v = true) => { G.state.flags[k] = v; G.save(); };
  G.has = (id) => G.state.inv.includes(id);

  /* ---------- Stage sizing ---------- */
  let rotateDismissed = false;
  function fit() {
    const vw = window.innerWidth, vh = window.innerHeight;
    let w = vw, h = (vw * 9) / 16;
    if (h > vh) { h = vh; w = (vh * 16) / 9; }
    const st = $('#stage');
    st.style.width = w + 'px'; st.style.height = h + 'px';
    document.documentElement.style.setProperty('--u', w / 1280 + 'px');
    $('#rotate').hidden = !(vh > vw * 1.1 && !rotateDismissed);
  }
  G.fit = fit;

  /* ---------- Helpers ---------- */
  G.wait = (ms) => new Promise((r) => setTimeout(r, ms));
  G.svgPoint = function (cx, cy) {
    const svg = $('#scene'), pt = svg.createSVGPoint();
    pt.x = cx; pt.y = cy;
    const m = svg.getScreenCTM(); if (!m) return { x: 0, y: 0 };
    const p = pt.matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  };
  G.toScreen = function (x, y) {
    const svg = $('#scene'), pt = svg.createSVGPoint(), r = $('#stage').getBoundingClientRect();
    pt.x = x; pt.y = y;
    const p = pt.matrixTransform(svg.getScreenCTM());
    return { x: p.x - r.left, y: p.y - r.top };
  };
  G.fade = function (on) { $('#fade').classList.toggle('on', on); return G.wait(460); };
  G.toast = function (title, small) {
    const t = $('#toast'); t.hidden = false;
    t.innerHTML = `${title}${small ? `<small>${small}</small>` : ''}`;
    t.style.animation = 'none'; void t.offsetWidth; t.style.animation = '';
    clearTimeout(G._toastT); G._toastT = setTimeout(() => (t.hidden = true), 2300);
  };
  G.fx = function (markup, ms = 1200) {
    const g = document.createElementNS(NS, 'g'); g.innerHTML = markup; $('#layer-fx').appendChild(g);
    if (ms) setTimeout(() => g.remove(), ms);
    return g;
  };
  G.setBar = function (show) { $('#bar').classList.toggle('hidden', !show); };

  /* ---------- Actors ---------- */
  G.addActor = function (def) {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'actor actor-' + def.id);
    const art = typeof def.art === 'function' ? def.art() : SF.art[def.art || def.id]();
    g.innerHTML = `<g class="inner">${art}</g>`;
    $('#layer-actors').appendChild(g);
    const a = { id: def.id, el: g, x: def.x, y: def.y, scale: def.scale || 1, flip: def.flip ? -1 : 1, z: def.z, def, hidden: false };
    G.actors[def.id] = a;
    G.place(def.id, def.x, def.y);
    if (def.hidden) G.hide(def.id);
    return a;
  };
  G.removeActor = function (id) { const a = G.actors[id]; if (a) { a.el.remove(); delete G.actors[id]; } };
  G.place = function (id, x, y) {
    const a = G.actors[id]; if (!a) return;
    a.x = x; a.y = y;
    if (a.def.depth || (id === 'fox' && G.scene && G.scene.depth)) a.scale = depthScale(y, a.def.depth || G.scene.depth);
    a.el.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${(a.scale * a.flip).toFixed(3)},${a.scale.toFixed(3)})`);
  };
  function depthScale(y, d) { const [y1, s1, y2, s2] = d; const t = Math.max(0, Math.min(1, (y - y1) / (y2 - y1))); return s1 + (s2 - s1) * t; }
  G.face = function (id, dir) { const a = G.actors[id]; if (!a) return; a.flip = dir < 0 ? -1 : 1; G.place(id, a.x, a.y); };
  G.faceTo = function (id, x) { const a = G.actors[id]; if (a && Math.abs(x - a.x) > 4) G.face(id, x < a.x ? -1 : 1); };
  G.hide = function (id) { const a = G.actors[id]; if (a) { a.hidden = true; a.el.style.display = 'none'; } };
  G.show = function (id) { const a = G.actors[id]; if (a) { a.hidden = false; a.el.style.display = ''; } };
  G.gesture = function (id) { const a = G.actors[id]; if (!a) return; a.el.classList.remove('gesture'); void a.el.getBBox; requestAnimationFrame(() => a.el.classList.add('gesture')); setTimeout(() => a.el.classList.remove('gesture'), 1100); };
  G.hop = function (id) { const a = G.actors[id]; if (!a) return; const inner = a.el.querySelector('.inner'); inner.classList.remove('hop'); void inner.getBBox(); inner.classList.add('hop'); };
  function sortActors() {
    const list = Object.values(G.actors).sort((p, q) => (p.z ?? p.y) - (q.z ?? q.y));
    const layer = $('#layer-actors');
    list.forEach((a) => { if (layer.lastChild !== a.el) layer.appendChild(a.el); });
  }
  G.sortActors = sortActors;

  // Walk an actor to (x,y). Resolves true when it arrives, false if interrupted.
  G.walk = function (id, x, y, speed = 330) {
    const a = G.actors[id]; if (!a) return Promise.resolve(false);
    if (a.walkCancel) a.walkCancel();
    return new Promise((resolve) => {
      const sx = a.x, sy = a.y, dist = Math.hypot(x - sx, y - sy);
      if (dist < 3) { resolve(true); return; }
      G.faceTo(id, x);
      a.el.classList.add('walking');
      const dur = (dist / speed) * 1000; let start = null, raf = 0, sortT = 0;
      const end = (ok) => { cancelAnimationFrame(raf); a.el.classList.remove('walking'); a.walkCancel = null; sortActors(); resolve(ok); };
      a.walkCancel = () => end(false);
      const step = (ts) => {
        if (start === null) start = ts;
        const t = Math.min(1, (ts - start) / dur);
        G.place(id, sx + (x - sx) * t, sy + (y - sy) * t);
        if (ts - sortT > 120) { sortActors(); sortT = ts; }
        if (t < 1) raf = requestAnimationFrame(step); else end(true);
      };
      raf = requestAnimationFrame(step);
    });
  };
  G.clampWalk = function (x, y) {
    const w = G.scene.walk; if (!w) return { x, y };
    return { x: Math.max(w[0], Math.min(w[2], x)), y: Math.max(w[1], Math.min(w[3], y)) };
  };
  G.foxTo = function (x, y) { const p = G.clampWalk(x, y); return G.walk('fox', p.x, p.y); };

  /* ---------- Talking ---------- */
  G.say = function (who, text, opts = {}) {
    return new Promise((resolve) => {
      const c = SF.chars[who] || SF.chars.narrator;
      const sub = $('#subtitle');
      $('#sub-name').textContent = c.name;
      $('#sub-text').textContent = text;
      sub.style.setProperty('--c', c.color);
      sub.hidden = false;
      const actor = G.actors[opts.actor || who];
      if (actor) actor.el.classList.add('talking');
      if (opts.talkEl) opts.talkEl.classList.add('talking');
      const started = performance.now();
      let done = false, timer = 0;
      const finish = () => {
        if (done) return; done = true;
        clearTimeout(timer); A.hush();
        if (actor) actor.el.classList.remove('talking');
        if (opts.talkEl) opts.talkEl.classList.remove('talking');
        sub.hidden = true; G.skipLine = null;
        setTimeout(resolve, 140);
      };
      G.skipLine = () => { if (performance.now() - started > 380) finish(); };
      const readMs = 1300 + text.length * 58;
      if (A.voiceOn && A.canSpeak()) {
        timer = setTimeout(finish, readMs * 1.8 + 2500);
        A.speak(who, text, (spoke) => {
          if (!spoke) { clearTimeout(timer); timer = setTimeout(finish, readMs); return; }
          clearTimeout(timer); timer = setTimeout(finish, 350);
        });
      } else timer = setTimeout(finish, readMs);
    });
  };
  // A quick sequence of lines: [[who, text], ...]
  G.talk = async function (lines) { for (const [who, text, opts] of lines) await G.say(who, text, opts); };

  G.choose = function (options) {
    return new Promise((resolve) => {
      const box = $('#choices'); box.innerHTML = ''; box.hidden = false;
      options.forEach((o, i) => {
        const b = document.createElement('button');
        b.textContent = typeof o === 'string' ? o : o.text;
        if (o.bye) b.className = 'bye';
        b.addEventListener('click', (e) => { e.stopPropagation(); A.sfx('click'); box.hidden = true; box.innerHTML = ''; resolve(i); });
        box.appendChild(b);
      });
    });
  };

  /* ---------- Inventory ---------- */
  SF.items = {
    gum: { name: 'Spy Gum', desc: 'Professor Quack\'s Spy Gum. One chew makes a bubble that sticks to anything and never pops.' },
    lipstick: { name: 'Laser Lipstick', desc: 'Laser Lipstick. Cuts through rope, chains and bad guys\' plans. Not for kissing.' },
    mist: { name: 'Spy Mist Cologne', desc: 'Spy Mist Cologne. One spritz makes invisible things visible. Also smells like victory.' },
    cappuccino: { name: 'Goat-Milk Cappuccino', desc: 'A cappuccino made with goat milk. The only milk left on the island.' },
    carnation: { name: 'Red Carnation', desc: 'A red carnation. Very dapper. Very spy.' },
    membership: { name: 'High Roller Card', desc: 'A gold High Roller Club card. Big shots only.' },
    keycard: { name: 'Goat Fortress Keycard', desc: 'The keycard to William the Once-Great\'s fortress. It smells faintly of cheese.' },
  };
  G.renderInv = function () {
    const inv = $('#inv'); inv.innerHTML = '';
    G.state.inv.forEach((id) => {
      const b = document.createElement('button');
      b.className = 'item' + (G.selected === id ? ' selected' : '') + (G._newItem === id ? ' new' : '');
      b.setAttribute('role', 'listitem');
      b.setAttribute('aria-label', SF.items[id].name);
      b.innerHTML = `<svg viewBox="0 0 100 100">${SF.icons[id]}</svg>`;
      b.addEventListener('click', (e) => { e.stopPropagation(); onItemTap(id); });
      inv.appendChild(b);
    });
    G._newItem = null;
  };
  G.give = function (id, quiet) {
    if (G.has(id)) return;
    G.state.inv.push(id); G._newItem = id; G.renderInv(); G.save();
    A.sfx('pickup');
    if (!quiet) G.toast(SF.items[id].name, 'added to your spy kit');
  };
  G.take = function (id) { G.state.inv = G.state.inv.filter((x) => x !== id); if (G.selected === id) G.selected = null; G.renderInv(); G.save(); };
  function onItemTap(id) {
    if (G.skipLine) { G.skipLine(); return; }
    if (G.busy) return;
    A.sfx('click');
    if (G.selected === id) {
      G.selected = null; G.renderInv(); $('#held').hidden = true;
      G.busy++; G.say('fox', SF.items[id].desc).finally(() => G.busy--);
      return;
    }
    G.selected = id; G.renderInv();
    showLabel(`Use ${SF.items[id].name} on…`, 640, 560, 1800);
  }

  /* ---------- Scenes ---------- */
  G.loadScene = function (id, from) {
    const sc = SF.scenes[id];
    G.scene = sc; G.state.scene = id; G.state.from = from || null;
    $('#layer-actors').innerHTML = ''; $('#layer-fx').innerHTML = '';
    G.actors = {};
    $('#layer-bg').innerHTML = sc.bg(G);
    (sc.actors ? sc.actors(G) : []).forEach((d) => G.addActor(d));
    if (!sc.noFox) {
      const sp = (sc.spawn && (sc.spawn[from] || sc.spawn.default)) || [640, 600, 1];
      G.addActor({ id: 'fox', x: sp[0], y: sp[1], flip: sp[2] < 0, scale: 0.85 });
    }
    $('#layer-fg').innerHTML = (sc.fg ? sc.fg(G) : '') + exitArrows(sc);
    sortActors();
    G.selected = null; G.renderInv();
    A.music(sc.music);
    G.save();
  };
  G.go = async function (id, opts = {}) {
    const from = G.state.scene;
    G.busy++;
    A.sfx('whoosh');
    await G.fade(true);
    G.loadScene(id, from);
    await G.fade(false);
    G.busy--;
    if (G.scene.enter) { G.busy++; try { await G.scene.enter(G, from); } finally { G.busy--; } }
  };
  G.refreshFg = function () { $('#layer-fg').innerHTML = (G.scene.fg ? G.scene.fg(G) : '') + exitArrows(G.scene); };
  G.refreshBg = function () { $('#layer-bg').innerHTML = G.scene.bg(G); };

  function activeHotspots() { return (G.scene.hotspots ? G.scene.hotspots(G) : []).filter((h) => !h.when || h.when(G)); }
  function hsRect(h) {
    if (h.rect) return h.rect;
    const a = G.actors[h.actor]; if (!a || a.hidden) return null;
    const [w, hh] = a.def.hit || [150, 300];
    return [a.x - (w * a.scale) / 2, a.y - hh * a.scale, w * a.scale, hh * a.scale];
  }
  function exitArrows(sc) {
    if (!sc.hotspots) return '';
    return sc.hotspots(G).filter((h) => h.exit && h.arrow && (!h.when || h.when(G))).map((h) => {
      const [x, y, w, hh] = h.rect; const cx = x + w / 2, cy = y + hh / 2;
      const rot = { right: 0, down: 90, left: 180, up: 270 }[h.arrow] || 0;
      return `<g class="exit-arrow" transform="translate(${cx},${cy}) rotate(${rot})"><path d="M-22,-16 L6,-16 L6,-32 L34,0 L6,32 L6,16 L-22,16Z" fill="#ffc93c" stroke="#20152b" stroke-width="5" stroke-linejoin="round" opacity=".9"/></g>`;
    }).join('');
  }
  function hitTest(p) {
    const list = activeHotspots();
    for (let i = list.length - 1; i >= 0; i--) {
      const r = hsRect(list[i]); if (!r) continue;
      if (p.x >= r[0] && p.x <= r[0] + r[2] && p.y >= r[1] && p.y <= r[1] + r[3]) return list[i];
    }
    return null;
  }
  function showLabel(text, x, y, ms = 1100) {
    const l = $('#hotlabel'), s = G.toScreen(x, y);
    l.textContent = text; l.hidden = false;
    l.style.left = Math.max(80, Math.min($('#stage').clientWidth - 80, s.x)) + 'px';
    l.style.top = Math.max(60, s.y) + 'px';
    clearTimeout(G._labelT); G._labelT = setTimeout(() => (l.hidden = true), ms);
  }

  G.spyVision = function () {
    if (!G.scene || G.cut) return;
    A.sfx('pop');
    const marks = activeHotspots().map((h) => { const r = hsRect(h); return r ? `<rect class="hs-glow" x="${r[0]}" y="${r[1]}" width="${r[2]}" height="${r[3]}" rx="18"/>` : ''; }).join('');
    G.fx(marks, 1800);
  };

  const DEFAULT_USE = [
    "Hmm. I don't think that will help here.",
    'A good spy knows when a gadget is not the right gadget.',
    "That's not going to work. Not even for Spy Fox.",
    "Nope. Let's try something else.",
  ];
  G.defaultUse = function () { return G.say('fox', DEFAULT_USE[Math.floor(Math.random() * DEFAULT_USE.length)]); };

  async function interact(h, p) {
    const item = G.selected;
    G.selected = null; G.renderInv(); $('#held').hidden = true;
    const r = hsRect(h);
    showLabel(h.name || '', r ? r[0] + r[2] / 2 : p.x, r ? r[1] : p.y);
    if (G.actors.fox && h.walk !== false) {
      const wk = G.scene.walk || [0, 560, 1280, 620];
      const w = h.walk || [r ? r[0] + r[2] / 2 : p.x, (wk[1] + wk[3]) / 2];
      const ok = await G.foxTo(w[0], w[1]);
      if (!ok) return;
      if (r) G.faceTo('fox', h.face ?? r[0] + r[2] / 2);
    }
    if (item) {
      const res = h.use ? await h.use(G, item) : false;
      if (res === false) await G.defaultUse(item);
    } else if (h.exit) {
      await G.go(h.exit);
    } else if (h.tap) {
      await h.tap(G);
    }
    G.save();
  }

  function onStageTap(e) {
    if (G.skipLine) { G.skipLine(); return; }
    if (G.busy || G.cut || !G.scene) return;
    A.init();
    const p = G.svgPoint(e.clientX, e.clientY);
    G.fx(`<circle class="tap-ring" cx="${p.x}" cy="${p.y}" r="6"/>`, 500);
    const h = hitTest(p);
    if (h) {
      G.busy++;
      interact(h, p).catch((err) => console.error(err)).finally(() => { G.busy--; });
      return;
    }
    if (G.selected) { G.selected = null; G.renderInv(); $('#held').hidden = true; return; }
    if (G.actors.fox && G.scene.walk) { const q = G.clampWalk(p.x, p.y); G.walk('fox', q.x, q.y); }
  }

  /* ---------- Spy Watch ---------- */
  G.openWatch = async function (opts = {}) {
    if (G.busy && !opts.force) { if (G.skipLine) G.skipLine(); return; }
    A.init(); A.sfx('beep');
    $('#watch-btn').classList.remove('ringing');
    const panel = $('#panel');
    const hint = opts.text || (SF.hint ? SF.hint(G) : 'Keep up the good work, Spy Fox!');
    panel.innerHTML = `<div class="watch" role="dialog" aria-label="Spy Watch">
      <div class="watch-face"><svg viewBox="-110 -130 220 220"><g class="actor" id="watch-penny">${SF.art.pennyHead()}</g></svg></div>
      <div class="watch-body">
        <p class="watch-title">Spy Watch: Monkey Penny</p>
        <p class="watch-text" id="watch-text"></p>
        <div class="btn-row">
          <button class="btn" id="w-close">${opts.closeText || 'Back to the mission'}</button>
          <button class="btn alt" id="w-music">Music: ${A.musicOn ? 'on' : 'off'}</button>
          <button class="btn alt" id="w-voice">Voices: ${A.voiceOn ? 'on' : 'off'}</button>
          <button class="btn alt" id="w-sfx">Sounds: ${A.sfxOn ? 'on' : 'off'}</button>
          <button class="btn red" id="w-menu">Save &amp; quit</button>
        </div>
      </div></div>`;
    panel.hidden = false;
    const face = $('#watch-penny');
    $('#watch-text').textContent = hint;
    face.classList.add('talking');
    A.speak('penny', hint, () => face.classList.remove('talking'));
    setTimeout(() => face.classList.remove('talking'), 1200 + hint.length * 55);
    const close = () => { A.hush(); panel.hidden = true; panel.innerHTML = ''; };
    $('#w-close').onclick = () => { A.sfx('click'); close(); };
    $('#w-music').onclick = (e) => { A.setMusic(!A.musicOn); e.target.textContent = `Music: ${A.musicOn ? 'on' : 'off'}`; savePrefs(); };
    $('#w-voice').onclick = (e) => { A.voiceOn = !A.voiceOn; if (!A.voiceOn) A.hush(); e.target.textContent = `Voices: ${A.voiceOn ? 'on' : 'off'}`; savePrefs(); };
    $('#w-sfx').onclick = (e) => { A.sfxOn = !A.sfxOn; e.target.textContent = `Sounds: ${A.sfxOn ? 'on' : 'off'}`; savePrefs(); };
    $('#w-menu').onclick = () => { close(); G.save(); SF.main.title(); };
    if (opts.wait) return new Promise((r) => { $('#w-close').onclick = () => { close(); r(); }; });
  };
  function savePrefs() { try { localStorage.setItem('spyfox-prefs', JSON.stringify({ m: A.musicOn, v: A.voiceOn, s: A.sfxOn })); } catch (e) { /* ignore */ } }
  G.loadPrefs = function () { try { const p = JSON.parse(localStorage.getItem('spyfox-prefs') || 'null'); if (p) { A.musicOn = p.m; A.voiceOn = p.v; A.sfxOn = p.s; } } catch (e) { /* ignore */ } };

  /* ---------- Boot wiring ---------- */
  G.init = function () {
    fit();
    window.addEventListener('resize', fit);
    window.addEventListener('orientationchange', () => setTimeout(fit, 250));
    $('#rotate-ok').addEventListener('click', () => { rotateDismissed = true; fit(); });
    const svg = $('#scene');
    let down = null;
    svg.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY }; });
    svg.addEventListener('pointerup', (e) => {
      if (!down) return; const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y); down = null;
      if (moved < 24) onStageTap(e);
    });
    $('#subtitle').addEventListener('click', () => G.skipLine && G.skipLine());
    $('#screen').addEventListener('click', () => G.skipLine && G.skipLine());
    $('#watch-btn').addEventListener('click', (e) => { e.stopPropagation(); G.openWatch(); });
    $('#vision-btn').addEventListener('click', (e) => { e.stopPropagation(); if (G.skipLine) G.skipLine(); else if (!G.busy) G.spyVision(); });
    document.addEventListener('pointermove', (e) => {
      const h = $('#held');
      if (!G.selected || e.pointerType !== 'mouse') { h.hidden = true; return; }
      const r = $('#stage').getBoundingClientRect();
      h.hidden = false; h.innerHTML = `<svg viewBox="0 0 100 100">${SF.icons[G.selected]}</svg>`;
      h.style.left = e.clientX - r.left + 'px'; h.style.top = e.clientY - r.top + 'px';
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden) { A.hush(); if (A.ctx) A.ctx.suspend(); } else if (A.ctx) A.ctx.resume(); });
  };
})(window.SF);
