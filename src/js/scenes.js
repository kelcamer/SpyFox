/* Scenes: backgrounds, characters, hotspots and puzzle scripts. */
window.SF = window.SF || {};
(function (SF) {
  const K = SF.K, K3 = SF.K3, INK = SF.INK;
  const A = SF.audio;
  const S = SF.scenes = {};

  /* ---------- Shared drawing helpers ---------- */
  const grad = (id, stops, vertical = true) => `<linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}">${stops.map((c, i) => `<stop offset="${i / (stops.length - 1)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
  const cloud = (x, y, s) => `<g transform="translate(${x},${y}) scale(${s})" opacity=".95"><ellipse cx="0" cy="0" rx="60" ry="26" fill="#fff"/><ellipse cx="-40" cy="8" rx="40" ry="20" fill="#fff"/><ellipse cx="44" cy="8" rx="44" ry="20" fill="#fff"/><ellipse cx="6" cy="-18" rx="36" ry="24" fill="#fff"/></g>`;
  const clouds = () => `<g class="drift">${cloud(100, 90, 1)}${cloud(520, 60, 0.7)}</g><g class="drift" style="animation-duration:60s;animation-delay:-30s">${cloud(300, 130, 0.8)}${cloud(900, 80, 1.1)}</g>`;
  const fortress = (x, y, s) => `<g transform="translate(${x},${y}) scale(${s})">
    <path d="M-120,0 L-120,-80 L-90,-80 L-90,-100 L-60,-100 L-60,-80 L60,-80 L60,-100 L90,-100 L90,-80 L120,-80 L120,0Z" fill="#5b4a6e"/>
    <path d="M-50,-80 C-60,-150 -10,-170 0,-170 C10,-170 60,-150 50,-80Z" fill="#6f5c85"/>
    <path d="M-40,-150 C-90,-200 -120,-160 -100,-130 M40,-150 C90,-200 120,-160 100,-130" fill="none" stroke="#6f5c85" stroke-width="16" stroke-linecap="round"/>
    <circle cx="-18" cy="-120" r="8" fill="#ffd54f" class="flicker"/><circle cx="18" cy="-120" r="8" fill="#ffd54f" class="flicker"/></g>`;
  const greek = (x, y, w, h, dome) => `<g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#f8f5ee" ${K}/>
    ${dome ? `<path d="M${x + w * 0.2},${y} A${w * 0.3},${w * 0.3} 0 0 1 ${x + w * 0.8},${y}Z" fill="#1e63c4" ${K}/><path d="M${x + w / 2},${y - w * 0.3} L${x + w / 2},${y - w * 0.3 - 30} M${x + w / 2 - 10},${y - w * 0.3 - 20} L${x + w / 2 + 10},${y - w * 0.3 - 20}" ${K}/>` : ''}
    <rect x="${x + w * 0.15}" y="${y + h * 0.18}" width="${w * 0.22}" height="${h * 0.22}" rx="${w * 0.11}" fill="#1e63c4" ${K3}/>
    <rect x="${x + w * 0.62}" y="${y + h * 0.18}" width="${w * 0.22}" height="${h * 0.22}" rx="${w * 0.11}" fill="#1e63c4" ${K3}/></g>`;
  const cobbles = (y0, y1, c1, c2) => { let s = `<rect x="0" y="${y0}" width="1280" height="${720 - y0}" fill="${c1}"/>`; for (let r = 0, y = y0 + 10; y < y1; r++, y += 26 + r * 3) for (let x = (r % 2) * 40 - 20; x < 1300; x += 80 + r * 6) s += `<ellipse cx="${x}" cy="${y}" rx="${30 + r * 2}" ry="${8 + r}" fill="${c2}"/>`; return s; };
  const car = (glow) => `<g>
    <path d="M-150,-20 Q-160,-60 -120,-66 L-60,-70 Q-30,-112 30,-110 Q80,-108 100,-70 L150,-62 Q170,-58 168,-30 L164,-12 L-146,-12Z" fill="#e8324a" ${K}/>
    <path d="M-40,-72 Q-20,-100 26,-100 Q66,-98 82,-72Z" fill="#9be7ff" ${K3}/><path d="M18,-100 L18,-72" ${K3}/>
    <path d="M-150,-40 L-170,-80 L-120,-60Z" fill="#b0233a" ${K3}/>
    <circle cx="-90" cy="-14" r="24" fill="#222" ${K}/><circle cx="-90" cy="-14" r="10" fill="#bbb"/>
    <circle cx="100" cy="-14" r="24" fill="#222" ${K}/><circle cx="100" cy="-14" r="10" fill="#bbb"/>
    <path d="M150,-50 L166,-48" stroke="#ffeb3b" stroke-width="8" stroke-linecap="round"/>
    <text x="-30" y="-30" font-family="Luckiest Guy, Impact, sans-serif" font-size="26" fill="#fff" stroke="${INK}" stroke-width="1.5">SF</text>
    ${glow ? '<ellipse cx="0" cy="-4" rx="180" ry="14" fill="#fff" opacity=".35" class="wave-anim"/>' : ''}</g>`;
  SF.drawCar = car;
  const sea = (y) => `<rect x="0" y="${y}" width="1280" height="${720 - y}" fill="url(#seaG)"/>
    <g class="wave-anim" opacity=".6">${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 150 - 40},${y + 30 + (i % 3) * 40} q20,-10 40,0 t40,0" stroke="#fff" stroke-width="4" fill="none"/>`).join('')}</g>`;

  // A prop actor (table, cart) so that characters sort in front of / behind it.
  const prop = (id, x, y, art, z) => ({ id, x, y, art, z: z ?? y, scale: 1 });

  /* ======================================================================
     SPY Corp HQ
     ====================================================================== */
  S.hq = {
    name: 'SPY Corp Headquarters', music: 'spy',
    walk: [150, 560, 1180, 640], depth: [560, 0.8, 640, 0.9],
    spawn: { default: [640, 600, 1] },
    bg: (G) => {
      const william = G.state.flags.screen === 'william';
      return `<defs>${grad('hqW', ['#25336b', '#141a40'])}${grad('hqF', ['#3a2f6b', '#221a45'])}</defs>
      <rect width="1280" height="720" fill="url(#hqW)"/>
      ${Array.from({ length: 9 }, (_, i) => `<rect x="${i * 150 - 20}" y="0" width="12" height="480" fill="#2f3f80"/>`).join('')}
      <rect x="0" y="480" width="1280" height="240" fill="url(#hqF)"/>
      ${Array.from({ length: 12 }, (_, i) => `<path d="M${640 + (i - 6) * 40},480 L${640 + (i - 6) * 230},720" stroke="#4a3d85" stroke-width="3"/>`).join('')}
      <path d="M0,560 L1280,560 M0,630 L1280,630" stroke="#4a3d85" stroke-width="3"/>
      <rect x="430" y="50" width="420" height="270" rx="20" fill="#0e1230" ${K}/>
      <rect x="450" y="70" width="380" height="230" rx="10" fill="${william ? '#2a0f3a' : '#0d4f4a'}"/>
      ${william ? `<g transform="translate(640,210) scale(1.15)"><g class="actor talking-screen">${SF.art.williamHead()}</g></g><text x="640" y="292" text-anchor="middle" font-family="Luckiest Guy, Impact, sans-serif" font-size="22" fill="#ffc93c">WANTED: WILLIAM THE ONCE-GREAT</text>`
          : `<g transform="translate(640,185)"><circle r="70" fill="none" stroke="#2fd0bd" stroke-width="6"/><path d="M-70,0 L70,0 M0,-70 L0,70" stroke="#2fd0bd" stroke-width="3"/><text y="18" text-anchor="middle" font-family="Luckiest Guy, Impact, sans-serif" font-size="56" fill="#ffc93c" stroke="${INK}" stroke-width="2">SPY</text></g><text x="640" y="290" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="20" fill="#2fd0bd" class="pulse">SECURE CHANNEL</text>`}
      <rect x="40" y="250" width="110" height="260" rx="10" fill="#0e1230" ${K}/><rect x="56" y="270" width="78" height="220" fill="#3b3550"/>
      <path d="M56,300 L134,300 M56,340 L134,340 M56,380 L134,380 M56,420 L134,420 M56,460 L134,460" stroke="#2a2440" stroke-width="5"/>
      <text x="95" y="242" text-anchor="middle" font-family="Luckiest Guy, Impact, sans-serif" font-size="22" fill="#ffc93c">GARAGE</text>
      <rect x="170" y="380" width="230" height="110" rx="10" fill="#3b3550" ${K}/>
      <rect x="186" y="396" width="90" height="56" rx="6" fill="#0d4f4a"/>
      ${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${300 + (i % 3) * 30}" cy="${410 + Math.floor(i / 3) * 30}" r="9" fill="${['#ff3d5a', '#ffc93c', '#2fd0bd'][i % 3]}" class="${i % 2 ? 'flicker' : 'pulse'}"/>`).join('')}
      <path d="M196,436 l14,-20 l14,12 l14,-24 l14,30" fill="none" stroke="#2fd0bd" stroke-width="4"/>
      <rect x="900" y="80" width="150" height="190" fill="#f8f5ee" ${K}/><text x="975" y="130" text-anchor="middle" font-family="Luckiest Guy, Impact, sans-serif" font-size="26" fill="#e8324a">LOOSE</text><text x="975" y="165" text-anchor="middle" font-family="Luckiest Guy, Impact, sans-serif" font-size="26" fill="#e8324a">LIPS</text><text x="975" y="200" text-anchor="middle" font-family="Luckiest Guy, Impact, sans-serif" font-size="26" fill="#e8324a">SINK</text><text x="975" y="235" text-anchor="middle" font-family="Luckiest Guy, Impact, sans-serif" font-size="26" fill="#e8324a">SPIES</text>
      <g transform="translate(1210,420)"><path d="M-6,0 L-6,90 M-30,96 L30,96" ${K}/><g class="${G.state.flags.globeSpin ? 'spin' : ''}" style="animation-duration:1.2s"><circle r="48" fill="#4fc3f7" ${K}/><path d="M-30,-20 Q-10,-40 10,-20 Q20,0 0,10 Q-20,20 -30,-20Z M10,20 Q30,10 36,30 Q20,40 10,20Z" fill="#66bb6a"/></g><path d="M-52,0 A52,52 0 0 0 52,0" fill="none" stroke="#ffc93c" stroke-width="6"/></g>`;
    },
    actors: (G) => [
      { id: 'penny', x: 300, y: 540, scale: 0.85, hit: [150, 260] },
      { id: 'quack', x: 1020, y: 520, scale: 0.85, hit: [150, 260], flip: true },
      prop('gtable', 1000, 548, () => `<rect x="-150" y="-70" width="300" height="24" rx="8" fill="#5c6bc0" ${K}/><rect x="-140" y="-46" width="280" height="46" fill="#3949ab" ${K}/>
        <g transform="translate(-100,-120) scale(.5)">${SF.icons.gum}</g><g transform="translate(-25,-120) scale(.5)">${SF.icons.lipstick}</g><g transform="translate(50,-120) scale(.5)">${SF.icons.mist}</g>`, 560),
    ].map((a) => (a.id === 'gtable' && G.flag('gadgets') ? { ...a, art: () => `<rect x="-150" y="-70" width="300" height="24" rx="8" fill="#5c6bc0" ${K}/><rect x="-140" y="-46" width="280" height="46" fill="#3949ab" ${K}/>` } : a)),
    hotspots: (G) => [
      { id: 'garage', name: 'To the Spy Car', rect: [30, 230, 130, 290], walk: [180, 600], arrow: 'left',
        tap: async (G) => {
          if (!G.flag('gadgets')) return G.say('fox', 'A spy never leaves without his gadgets. I should see Professor Quack first.');
          await G.say('fox', 'Acidophilus Island, here I come.');
          await SF.main.travel();
        } },
      { id: 'screen', name: 'Big screen', rect: [430, 50, 420, 270], walk: false,
        tap: async (G) => G.flag('briefed') ? G.say('penny', `Remember, Spy Fox: your contact reads the newspaper upside down. The password is: ${G.state.rand.passwords[G.state.rand.pw]}`) : null },
      { id: 'poster', name: 'Poster', rect: [900, 80, 150, 190], walk: false, tap: (G) => G.say('fox', 'Loose lips sink spies. Good thing my lips are always tight. And dashing.') },
      { id: 'globe', name: 'Globe', rect: [1150, 360, 120, 160], walk: [1110, 600], tap: async (G) => { A.sfx('whoosh'); G.state.flags.globeSpin = true; G.refreshBg(); await G.say('fox', 'Spin the globe, pick a villain. Somebody always needs stopping.'); G.state.flags.globeSpin = false; G.refreshBg(); } },
      { id: 'console', name: 'Spy computer', rect: [170, 380, 230, 110], walk: [330, 600], tap: (G) => { A.sfx('beep'); return G.say('fox', 'The SPY Corp supercomputer. It knows everything. Except where I left my sunglasses.'); } },
      { id: 'penny', name: 'Monkey Penny', actor: 'penny', walk: [400, 600],
        tap: async (G) => {
          if (!G.flag('gadgets')) return G.say('penny', 'Go see Professor Quack at the gadget table, Spy Fox. He has some new toys for you.');
          await G.say('penny', `Your Spy Car is in the garage. And don't forget the password: ${G.state.rand.passwords[G.state.rand.pw]}`);
          await G.say('penny', 'If you get stuck, tap your Spy Watch and I\'ll help. Good luck, Spy Fox!');
        } },
      { id: 'quack', name: 'Professor Quack', actor: 'quack', walk: [820, 600], face: 1100,
        tap: async (G) => {
          if (G.flag('gadgets')) return G.say('quack', 'Remember: gum for sticking, lipstick for cutting, cologne for seeing! Quack-tastic!');
          await G.talk([
            ['quack', 'Ah, Spy Fox! Just in time. I\'ve whipped up three brand-new gadgets for you.'],
            ['quack', 'First: Spy Gum! Chew it and blow a super-sticky bubble that covers anything. It never pops.'],
          ]);
          G.give('gum', true);
          await G.say('quack', 'Second: Laser Lipstick! It looks like lipstick, but it cuts through rope like butter.');
          G.give('lipstick', true);
          await G.say('quack', 'And third: Spy Mist Cologne. One spritz makes invisible things visible!');
          G.give('mist', true);
          G.toast('New gadgets!', 'Tap an item, then tap where to use it');
          G.set('gadgets'); G.removeActor('gtable'); G.addActor(S.hq.actors(G).find((a) => a.id === 'gtable')); G.sortActors();
          G.refreshFg();
          await G.talk([
            ['fox', 'Gum, lipstick and cologne. I\'m either a spy or going to a very fancy party.'],
            ['quack', 'Ha! Now off to the garage. Your Spy Car is gassed up and ready to swim!'],
          ]);
        } },
    ],
    enter: async (G) => {
      if (G.flag('briefed')) return;
      G.cut = true; G.setBar(false);
      const pw = G.state.rand.passwords[G.state.rand.pw];
      await G.wait(400);
      await G.talk([
        ['penny', 'Spy Fox! Thank goodness you\'re here. We have a dairy emergency!'],
      ]);
      G.state.flags.screen = 'william'; G.refreshBg(); A.sfx('beep');
      const scr = () => document.querySelector('.talking-screen');
      await G.talk([
        ['penny', 'This is William the Once-Great. He used to be the greatest goat-cheese maker in the world. Now he\'s just... once.'],
        ['penny', 'Last night he kidnapped Mr. Udder, president of the Udder Milk Company.'],
        ['william', 'Soon every drop of cow\'s milk on Earth will be gone! And the world will have to buy MY goat milk! Ha ha ha!', { talkEl: scr() }],
        ['fox', 'No milk? But that means kids everywhere would have to eat their cereal... dry!'],
        ['penny', 'Exactly. William is hiding in his fortress on the Greek island of Acidophilus.'],
        ['penny', 'Your contact on the island is a secret agent. You\'ll find them at the café, reading the newspaper upside down.'],
        ['penny', `Give them the password: ${pw}`],
        ['fox', `${pw} Got it.`],
        ['penny', 'Professor Quack has new gadgets for you. And remember: tap your Spy Watch if you ever need me.'],
      ]);
      G.state.flags.screen = 'logo'; G.refreshBg();
      G.set('briefed');
      G.cut = false; G.setBar(true);
      document.querySelector('#watch-btn').classList.add('ringing');
      setTimeout(() => document.querySelector('#watch-btn').classList.remove('ringing'), 2500);
    },
  };

  /* ======================================================================
     Acidophilus docks
     ====================================================================== */
  S.docks = {
    name: 'Acidophilus Harbor', music: 'island',
    walk: [380, 500, 1180, 610], depth: [500, 0.72, 610, 0.86],
    spawn: { default: [420, 560, 1], square: [1100, 540, -1] },
    bg: (G) => `<defs>${grad('skyD', ['#4fb3ff', '#bfe8ff'])}${grad('seaG', ['#1e88e5', '#0d47a1'])}${grad('woodG', ['#a1683a', '#7a4a26'])}</defs>
      <rect width="1280" height="720" fill="url(#skyD)"/>
      <circle cx="1120" cy="100" r="56" fill="#fff59d"/><circle cx="1120" cy="100" r="76" fill="#fff59d" opacity=".3"/>
      ${clouds()}
      <path d="M700,330 Q860,180 1000,230 Q1100,150 1280,240 L1280,330Z" fill="#7cb342" ${K3}/>
      ${fortress(1010, 230, 0.55)}
      <path d="M0,330 Q120,280 260,320 L260,330Z" fill="#9ccc65"/>
      ${greek(30, 250, 90, 80, true)}${greek(140, 270, 70, 60, false)}
      ${sea(330)}
      <g class="wave-anim" style="animation-duration:2.2s"><g transform="translate(200,470)">${car(true)}</g></g>
      <g transform="translate(560,420)"><path d="M0,0 L80,0 L66,30 L14,30Z" fill="#fff" ${K3}/><path d="M40,0 L40,-60 L70,-10Z" fill="#ffc93c" ${K3}/></g>
      <path d="M340,470 L1280,450 L1280,720 L340,720Z" fill="url(#woodG)" ${K}/>
      ${Array.from({ length: 16 }, (_, i) => `<path d="M${360 + i * 60},${470 - i * 1.2} L${340 + i * 64},720" stroke="#5d3a1c" stroke-width="3"/>`).join('')}
      ${[360, 600, 860, 1120].map((x) => `<rect x="${x - 12}" y="${430}" width="24" height="70" rx="6" fill="#6d4c41" ${K3}/>`).join('')}
      <path d="M1140,450 L1180,330 L1280,330 L1280,450Z" fill="#cfd8dc" ${K3}/>
      ${[0, 1, 2, 3, 4].map((i) => `<path d="M${1150 + i * 8},${430 - i * 22} L${1280},${430 - i * 22}" stroke="#90a4ae" stroke-width="4"/>`).join('')}
      <g transform="translate(960,470)"><rect x="-60" y="-70" width="120" height="70" fill="#a1887f" ${K}/><path d="M-60,-35 L60,-35 M-20,-70 L-20,0 M20,-70 L20,0" stroke="#6d4c41" stroke-width="4"/><text x="0" y="-42" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="15" fill="${INK}">GOAT MILK</text></g>
      <g id="jumpfish"></g>`,
    actors: (G) => [
      { id: 'pelican', x: 700, y: 520, scale: 0.8, flip: true, hit: [160, 260] },
      { id: 'gull', x: 860, y: 432, scale: 0.9, z: 300, hit: [80, 80], flip: true },
      prop('rod', 700, 520, () => `<path d="M-50,-140 Q-180,-260 -300,-180" fill="none" stroke="#5d4037" stroke-width="5"/><path d="M-300,-180 L-300,-40" stroke="#eee" stroke-width="2"/><circle cx="-300" cy="-40" r="7" fill="#e8324a" class="pulse"/>`, 521),
    ],
    hotspots: (G) => [
      { id: 'square', name: 'To the town square', rect: [1160, 330, 120, 130], exit: 'square', arrow: 'up', walk: [1150, 520] },
      { id: 'car', name: 'Spy Car', rect: [40, 380, 330, 110], walk: [420, 540], face: 0,
        tap: (G) => G.say('fox', 'My Spy Car. It drives, it swims, and it has cupholders. But I\'m not leaving until the mission is done.') },
      { id: 'crate', name: 'Crate', rect: [900, 400, 120, 70], walk: [960, 540],
        tap: (G) => G.say('fox', 'Goat milk. Crates and crates of it. Somebody really wants the world to switch.') },
      { id: 'water', name: 'Sea', rect: [0, 500, 330, 150], walk: [420, 580], face: 0,
        tap: async (G) => { A.sfx('splash'); G.fx(`<g transform="translate(160,560)"><path d="M-20,0 Q0,-60 20,0" fill="none" stroke="#fff" stroke-width="6" class="pulse"/><g transform="rotate(-30)"><path d="M-30,0 Q-6,-20 24,-4 L40,-16 L36,0 L40,16 L24,4 Q-6,20 -30,0Z" fill="#ff9800" ${K3}/></g></g>`, 900); await G.say('fox', 'A fish! At least somebody\'s having a good swim.'); } },
      { id: 'gull', name: 'Seagull', actor: 'gull', walk: [840, 540],
        tap: async (G) => { A.sfx('squawk'); G.hop('gull'); await G.say('gull', 'SQUAWK! Mine! Mine! Mine!'); await G.say('fox', 'Easy, pal. I don\'t want your french fries.'); } },
      { id: 'pelican', name: 'Captain Pouch', actor: 'pelican', walk: [820, 560], face: 700,
        tap: async (G) => {
          if (!G.flag('metPelican')) {
            G.set('metPelican');
            await G.talk([['pelican', 'Ahoy there, fancy fox! Captain Pouch is the name. Fishing is my game.'], ['fox', 'The name\'s Fox. Spy Fox.']]);
          } else await G.say('pelican', 'Back again, matey?');
          for (;;) {
            const c = await G.choose(['Caught anything today?', 'What\'s up on that hill?', 'Know a roach named LeRoach?', { text: 'See you later, Captain.', bye: true }]);
            if (c === 0) await G.talk([['pelican', 'Only an old boot, a tin can and a rubber duck. The fish don\'t bite since that goat moved in.'], ['pelican', 'He pumps something nasty out of his fortress. Smells like old cheese.']]);
            if (c === 1) await G.talk([['pelican', 'That\'s the Goat Fortress. William the Once-Great lives there. Nobody gets in without a keycard.'], ['pelican', 'And they say the halls are full of invisible lasers. Invisible! You\'d need magic eyes to see \'em.']]);
            if (c === 2) await G.talk([['pelican', 'Napoleon LeRoach? The goat\'s little helper. He plays Go Fish at the casino every night.'], ['pelican', 'Never loses, that one. Not once. Fishy, if you ask me. And I know fishy.']]);
            if (c === 3) { await G.say('pelican', 'Fair winds, Spy Fox!'); break; }
          }
        } },
    ],
  };

  /* ======================================================================
     Town square
     ====================================================================== */
  S.square = {
    name: 'Acidophilus Square', music: 'island',
    walk: [140, 500, 1160, 610], depth: [500, 0.7, 610, 0.85],
    spawn: { default: [640, 590, 1], docks: [640, 600, 1], cafe: [200, 560, 1], casino: [1040, 560, -1], gate: [800, 520, 1] },
    bg: (G) => `<defs>${grad('skyS', ['#4fb3ff', '#d6f1ff'])}${grad('plaza', ['#e9d8b4', '#cdb88e'])}</defs>
      <rect width="1280" height="720" fill="url(#skyS)"/>${clouds()}
      <path d="M380,420 Q520,170 700,200 Q880,150 960,420Z" fill="#8bc34a" ${K3}/>
      ${fortress(690, 200, 0.6)}
      <path d="M810,440 Q760,380 830,330 Q900,280 740,240 Q700,226 712,206" fill="none" stroke="#d7c49e" stroke-width="30" stroke-linecap="round"/>
      ${greek(250, 300, 130, 140, true)}${greek(940, 290, 110, 150, false)}
      <rect x="0" y="180" width="260" height="300" fill="#f8f5ee" ${K}/>
      <path d="M-10,250 L270,250 L250,300 L10,300Z" fill="#e8324a" ${K}/>${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${10 + i * 44},300 l22,0 l-11,16Z" fill="${i % 2 ? '#fff' : '#e8324a'}" ${K3}/>`).join('')}
      <text x="130" y="236" text-anchor="middle" font-family="Luckiest Guy, Impact, sans-serif" font-size="40" fill="#1e63c4" stroke="${INK}" stroke-width="1.5">CAFÉ FETA</text>
      <rect x="70" y="330" width="100" height="150" rx="50" fill="#1e63c4" ${K}/><circle cx="150" cy="410" r="6" fill="#ffc93c"/>
      <rect x="1010" y="170" width="270" height="310" fill="#5b2a86" ${K}/>
      <rect x="1030" y="190" width="230" height="60" rx="12" fill="${INK}"/>
      <text x="1145" y="236" text-anchor="middle" font-family="Luckiest Guy, Impact, sans-serif" font-size="40" fill="#ffc93c" class="flicker">CASINO</text>
      ${Array.from({ length: 10 }, (_, i) => `<circle cx="${1030 + i * 25.5}" cy="262" r="6" fill="#ffc93c" class="${i % 2 ? 'pulse' : 'flicker'}"/>`).join('')}
      <rect x="1080" y="300" width="130" height="180" rx="10" fill="#c62828" ${K}/><path d="M1145,300 L1145,480" ${K3}/><circle cx="1130" cy="400" r="6" fill="#ffc93c"/><circle cx="1160" cy="400" r="6" fill="#ffc93c"/>
      <path d="M1050,480 L1240,480 L1250,500 L1040,500Z" fill="#b71c1c" ${K3}/>
      ${cobbles(440, 720, 'url(#plaza)', '#d9c49c')}
      <g transform="translate(560,470)"><ellipse cx="0" cy="0" rx="120" ry="34" fill="#90a4ae" ${K}/><ellipse cx="0" cy="-6" rx="100" ry="24" fill="#4fc3f7"/>
        <rect x="-16" y="-100" width="32" height="94" fill="#b0bec5" ${K3}/>
        <g transform="translate(0,-100) scale(.55)"><g>${SF.art.williamHead(true)}</g></g>
        <path d="M30,-98 Q70,-120 80,-20" fill="none" stroke="#e1f5fe" stroke-width="6" stroke-dasharray="10 8" class="pulse"/></g>
      <g transform="translate(250,560)"><rect x="-90" y="-60" width="180" height="60" fill="#8d6e63" ${K}/><circle cx="-60" cy="4" r="18" fill="#5d4037" ${K}/><circle cx="60" cy="4" r="18" fill="#5d4037" ${K}/>
        <path d="M-96,-120 L96,-120 L80,-150 L-80,-150Z" fill="#ff7eb6" ${K3}/><path d="M-80,-120 L-80,-60 M80,-120 L80,-60" ${K3}/>
        ${[-60, -30, 0, 30, 60].map((x, i) => `<g transform="translate(${x},-70)"><path d="M0,0 L0,-20" stroke="#43a047" stroke-width="4"/><circle cy="-24" r="10" fill="${['#e8324a', '#ffc93c', '#ff7eb6', '#e8324a', '#fff'][i]}" ${K3}/></g>`).join('')}</g>`,
    actors: (G) => [
      { id: 'sheep', x: 380, y: 545, scale: 0.78, hit: [140, 250], flip: true },
      { id: 'bulldog', x: 990, y: 520, scale: 0.78, hit: [170, 300], flip: true },
    ],
    hotspots: (G) => [
      { id: 'cafe', name: 'Café Feta', rect: [60, 320, 120, 170], exit: 'cafe', arrow: 'left', walk: [170, 520] },
      { id: 'road', name: 'Road to the Goat Fortress', rect: [740, 300, 120, 140], exit: 'gate', arrow: 'up', walk: [800, 505] },
      { id: 'docks', name: 'To the harbor', rect: [520, 620, 240, 100], exit: 'docks', arrow: 'down', walk: [640, 610] },
      { id: 'casino', name: 'Casino', rect: [1070, 290, 150, 200], walk: [1060, 530], face: 1145,
        tap: async (G) => {
          if (G.flag('casinoOk')) return G.go('casino');
          A.sfx('honk');
          await G.say('bulldog', 'Whoa, whoa, whoa. Not so fast, pal. You gotta talk to Bruno first.', { actor: 'bulldog' });
        } },
      { id: 'statue', name: 'Goat statue', rect: [470, 330, 180, 160], walk: [560, 520],
        tap: (G) => G.say('fox', 'A statue of William the Once-Great. Spitting water. Classy.') },
      { id: 'cart', name: 'Flower cart', rect: [150, 400, 200, 170], walk: [330, 570], face: 250,
        tap: (G) => G.say('fox', 'Carnations, roses, daisies. And not a single milkweed.') },
      { id: 'sheep', name: 'Baa-bara', actor: 'sheep', walk: [470, 570], face: 380,
        use: async (G, item) => {
          if (item !== 'cappuccino') return false;
          G.take('cappuccino');
          await G.talk([['sheep', 'A cappuccino! For me? Oh, you lovely, lovely fox!'], ['sheep', 'Here, take my very best carnation. On the house!']]);
          G.give('carnation'); G.set('gotCarnation');
          await G.say('fox', 'Now I\'m dressed to impress.');
        },
        tap: async (G) => {
          if (!G.flag('metSheep')) { G.set('metSheep'); await G.say('sheep', 'Flowers! Fresh flowers! Oh, hello there, handsome. I\'m Baa-bara.'); }
          for (;;) {
            const c = await G.choose([G.flag('gotCarnation') ? 'Thanks again for the carnation.' : 'May I have a carnation, please?', 'Seen anything suspicious?', { text: 'Goodbye.', bye: true }]);
            if (c === 0) {
              if (G.flag('gotCarnation')) await G.say('sheep', 'It looks baa-utiful on you!');
              else { G.set('sheepWantsCoffee'); await G.talk([['sheep', 'A carnation? Hmm. I don\'t need money, dear.'], ['sheep', 'I\'ve been stuck at this cart since sunrise. What I really need is a cappuccino! Bring me one and the flower is yours.']]); }
            }
            if (c === 1) await G.talk([['sheep', 'Goats! Goats everywhere! They bought every last drop of cow\'s milk on the island.'], ['sheep', 'Now the café only has goat milk. Baa-humbug!']]);
            if (c === 2) { await G.say('sheep', 'Bye-bye! Come back soon!'); break; }
          }
        } },
      { id: 'bulldog', name: 'Bruno the doorman', actor: 'bulldog', walk: [880, 560], face: 990,
        use: async (G, item) => {
          if (item !== 'carnation') return false;
          G.take('carnation'); G.set('casinoOk');
          await G.talk([['bulldog', 'A red carnation. Now THAT\'S class.'], ['bulldog', 'Go on in, Mr. Fox. Good luck at the tables.']]);
          A.sfx('door');
        },
        tap: async (G) => {
          if (G.flag('casinoOk')) return G.say('bulldog', 'Lookin\' sharp, Mr. Fox. Go right in.');
          G.set('metDoorman');
          await G.talk([['bulldog', 'Halt. This is the Casino Acidophilus. We got a dress code.'], ['fox', 'I\'m wearing a tuxedo.'], ['bulldog', 'Everybody\'s wearin\' a tuxedo. No red carnation in the lapel, no entry. Capisce?']]);
        } },
    ],
  };

  /* ======================================================================
     Café Feta
     ====================================================================== */
  const seatX = [430, 690, 950];
  S.cafe = {
    name: 'Café Feta', music: 'island',
    walk: [120, 570, 1200, 620], depth: [570, 0.85, 620, 0.9],
    spawn: { default: [1140, 600, -1] },
    bg: (G) => `<defs>${grad('cafW', ['#fff3d6', '#f7dfae'])}${grad('cafF', ['#c2593a', '#9c3f26'])}</defs>
      <rect width="1280" height="720" fill="url(#cafW)"/>
      ${Array.from({ length: 14 }, (_, i) => `<rect x="${i * 96}" y="0" width="48" height="470" fill="#f9e7c0"/>`).join('')}
      <rect x="0" y="470" width="1280" height="250" fill="url(#cafF)"/>
      ${Array.from({ length: 10 }, (_, i) => `<path d="M0,${490 + i * 26} L1280,${490 + i * 26}" stroke="#8a3520" stroke-width="2"/>`).join('')}
      <rect x="500" y="80" width="280" height="160" rx="12" fill="#4fc3f7" ${K}/><path d="M640,80 L640,240 M500,160 L780,160" ${K3}/>
      <path d="M520,220 Q600,150 680,200 Q730,170 760,220Z" fill="#fff" opacity=".7"/>
      <rect x="20" y="300" width="320" height="180" fill="#8d6e63" ${K}/><rect x="10" y="290" width="340" height="24" rx="6" fill="#6d4c41" ${K}/>
      <rect x="60" y="160" width="230" height="110" fill="#5d4037" ${K}/><text x="175" y="200" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="22" fill="#fff">MENU</text>
      <text x="175" y="230" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="16" fill="#ffe082">Feta ... 2 · Olives ... 1</text><text x="175" y="254" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="16" fill="#ffe082">Cow's milk ... SOLD OUT</text>
      <g transform="translate(240,262)"><rect x="-20" y="-40" width="40" height="40" fill="#bdbdbd" ${K3}/><path d="M-20,-30 L-34,-30 L-34,-10" ${K3}/></g>
      <g transform="translate(1150,300)"><rect x="-70" y="0" width="140" height="190" rx="60" fill="#e8324a" ${K}/><rect x="-50" y="30" width="100" height="70" rx="30" fill="#ffc93c" ${K3} class="pulse"/>${[0, 1, 2, 3].map((i) => `<circle cx="${-36 + i * 24}" cy="130" r="8" fill="#4fc3f7" ${K3}/>`).join('')}<rect x="-50" y="150" width="100" height="20" fill="#5d4037"/></g>
      ${seatX.map((x) => `<g transform="translate(${x},560)"><ellipse cx="0" cy="-60" rx="90" ry="20" fill="#fff" ${K}/><path d="M0,-40 L0,-4 M-30,0 L30,0" ${K}/><path d="M-70,-60 L-70,-140 M70,-60 L70,-140" stroke="#5d4037" stroke-width="6"/></g>`).join('')}`,
    actors: (G) => [
      { id: 'walrus', x: 200, y: 470, scale: 0.9, hit: [180, 300], z: 300 },
      ...G.state.rand.seats.map((who, i) => ({ id: who, x: seatX[i], y: 510, scale: 0.85, hit: [190, 260], z: 400 })),
      prop('tables', 0, 0, () => seatX.map((x) => `<g transform="translate(${x},560)"><ellipse cx="0" cy="-60" rx="90" ry="20" fill="#fff" ${K}/><ellipse cx="0" cy="-62" rx="70" ry="12" fill="#e8324a" opacity=".25"/><path d="M0,-40 L0,-4 M-30,0 L30,0" ${K}/><g transform="translate(30,-74)"><path d="M-10,0 L10,0 L8,-16 L-8,-16Z" fill="#fff" ${K3}/></g></g>`).join(''), 450),
    ],
    hotspots: (G) => {
      const readers = G.state.rand.seats.map((who) => ({
        id: who, name: who === 'agent' ? 'Newspaper reader' : 'Newspaper reader', actor: who,
        walk: [G.actors[who] ? G.actors[who].x - 110 : 600, 595], face: 2000,
        tap: async (G) => {
          if (who === 'agent' && G.flag('metAgent')) {
            return G.talk([['agent', 'Psst. Keep your voice down, Spy Fox. Remember: LeRoach never loses at Go Fish.'], ['agent', 'Nobody is that lucky. Find out how he does it.']]);
          }
          await G.say('fox', 'Excuse me...');
          const opts = G.shuffle(G.state.rand.passwords.map((p, i) => ({ text: p, i })));
          opts.push({ text: 'Never mind.', bye: true, i: -1 });
          const c = opts[await G.choose(opts)];
          if (c.i === -1) return G.say('fox', 'Enjoy your paper.');
          await G.say('fox', c.text);
          if (who === 'hippo') return G.talk([['hippo', 'Huh? I\'m just reading the sports page, buddy. Go Acidophilus Olives!']]);
          if (who === 'turtle') return G.talk([['turtle', 'Young man... I am ninety-seven years old... and I have no idea... what you are talking about.']]);
          if (c.i !== G.state.rand.pw) return G.talk([['agent', 'Hmm. I don\'t know anything about that. Try a different... newspaper.'], ['fox', 'Wrong password. Monkey Penny told me the right one at headquarters.']]);
          G.set('metAgent');
          await G.talk([
            ['agent', 'Spy Fox! Agent Chameleon, at your service. Sorry, I tend to blend in.'],
            ['agent', 'Listen carefully. The only keycard to the Goat Fortress belongs to William\'s sidekick, Napoleon LeRoach.'],
            ['agent', 'He spends every night at the casino playing Go Fish. But he only plays with High Rollers.'],
            ['agent', 'So take this gold High Roller Card. Win the keycard from him!'],
          ]);
          G.give('membership');
          await G.talk([
            ['agent', 'One more thing. LeRoach never loses. Ever. Keep your eyes open.'],
            ['fox', 'A spy\'s eyes are always open. Even behind sunglasses.'],
          ]);
        },
      }));
      return [
        { id: 'out', name: 'To the square', rect: [1210, 470, 70, 150], exit: 'square', arrow: 'right', walk: [1180, 600] },
        { id: 'jukebox', name: 'Jukebox', rect: [1080, 300, 140, 190], walk: [1080, 600], face: 1150,
          tap: async (G) => { A.sfx('jukebox'); await G.say('fox', 'A little bouzouki music. Very relaxing. For other people.'); } },
        { id: 'menu', name: 'Menu', rect: [60, 160, 230, 110], walk: false, tap: (G) => G.say('fox', 'Cow\'s milk: sold out. That old goat works fast.') },
        { id: 'window', name: 'Window', rect: [500, 80, 280, 160], walk: false, tap: (G) => G.say('fox', 'A lovely view of the Aegean Sea. I\'d enjoy it more if the world\'s milk wasn\'t in danger.') },
        ...readers,
        { id: 'walrus', name: 'Walter the Waiter', actor: 'walrus', walk: [400, 600], face: 200,
          tap: async (G) => {
            await G.say('walrus', 'Welcome to Café Feta! What can I get for you, sir?', { actor: 'walrus' });
            for (;;) {
              const c = await G.choose(['A glass of milk. Shaken, not stirred.', 'A cappuccino to go, please.', 'Anything strange going on?', { text: 'Nothing, thanks.', bye: true }]);
              if (c === 0) await G.talk([['walrus', 'Milk? Ha! William the Once-Great bought every drop of cow\'s milk on the island.'], ['walrus', 'All we have is goat milk now. Everybody hates it.']]);
              if (c === 1) {
                if (G.has('cappuccino') || G.flag('gotCarnation')) await G.say('walrus', 'Another one? Sir, you will not sleep for a week!');
                else { await G.say('walrus', 'One goat-milk cappuccino, coming right up. For a gentleman in a tuxedo, it\'s on the house!'); A.sfx('pop'); G.give('cappuccino'); }
              }
              if (c === 2) await G.talk([['walrus', 'A truck full of milk drives up to the Goat Fortress every morning. Then... nothing comes back.'], ['walrus', 'And a little roach in a fancy hat spends all his money at the casino.']]);
              if (c === 3) { await G.say('walrus', 'Enjoy your day, sir!'); break; }
            }
          } },
      ];
    },
  };

  /* ======================================================================
     Casino
     ====================================================================== */
  S.casino = {
    name: 'Casino Acidophilus', music: 'casino',
    walk: [140, 560, 1180, 620], depth: [560, 0.82, 620, 0.9],
    spawn: { default: [200, 590, 1] },
    bg: (G) => `<defs>${grad('casW', ['#5b1a2e', '#2e0b18'])}${grad('casF', ['#8e1b2c', '#5a0f1b'])}</defs>
      <rect width="1280" height="720" fill="url(#casW)"/>
      ${Array.from({ length: 8 }, (_, i) => `<path d="M${i * 170 + 40},0 L${i * 170 + 40},470" stroke="#ffc93c" stroke-width="3" opacity=".4"/>`).join('')}
      <rect x="0" y="470" width="1280" height="250" fill="url(#casF)"/>
      ${Array.from({ length: 6 }, (_, i) => `<path d="M0,${500 + i * 40} Q640,${480 + i * 40} 1280,${500 + i * 40}" stroke="#ffc93c" stroke-width="2" fill="none" opacity=".25"/>`).join('')}
      <g transform="translate(640,0)"><path d="M0,0 L0,60" ${K3}/><path d="M-90,80 Q0,40 90,80 L70,110 L-70,110Z" fill="#ffc93c" ${K}/>${[-60, -30, 0, 30, 60].map((x) => `<circle cx="${x}" cy="118" r="9" fill="#fff59d" class="pulse"/>`).join('')}</g>
      <g transform="translate(420,250)"><rect x="-80" y="-110" width="160" height="200" rx="80" fill="#ffc93c" ${K}/><rect x="-64" y="-94" width="128" height="168" rx="64" fill="#b3e5fc"/>
        ${G.flag('mirrorGum') ? `<ellipse cx="0" cy="-10" rx="76" ry="96" fill="#ff7eb6" ${K}/><ellipse cx="-24" cy="-50" rx="16" ry="24" fill="#fff" opacity=".6"/>` : `<path d="M-40,-60 L-10,-80 M-44,-30 L10,-70" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".7"/>`}</g>
      ${[100, 230].map((x, i) => `<g transform="translate(${x},470)"><rect x="-50" y="-210" width="100" height="210" rx="14" fill="#c62828" ${K}/><rect x="-36" y="-180" width="72" height="50" rx="6" fill="#fff" ${K3}/>
        ${[-22, 0, 22].map((dx, k) => (i + k) % 2 ? `<ellipse cx="${dx}" cy="-155" rx="9" ry="7" fill="#ffeb3b" ${K3}/>` : `<circle cx="${dx - 3}" cy="-151" r="5" fill="#e8324a"/><circle cx="${dx + 4}" cy="-153" r="5" fill="#e8324a"/><path d="M${dx - 3},-156 L${dx + 2},-166 L${dx + 4},-158" fill="none" stroke="#43a047" stroke-width="2"/>`).join('')}
        <rect x="-36" y="-110" width="72" height="20" rx="6" fill="#ffc93c" ${K3}/><path d="M50,-150 L72,-170" stroke="#9e9e9e" stroke-width="6"/><circle cx="74" cy="-172" r="10" fill="#e8324a" ${K3}/></g>`).join('')}
      <g transform="translate(700,505)"><path d="M-40,0 L-40,-90 Q0,-110 40,-90 L40,0" fill="#4e342e" ${K}/><path d="M-40,-30 L40,-30" ${K3}/></g>`,
    actors: (G) => [
      { id: 'leroach', x: 960, y: 470, scale: 0.85, hit: [130, 240], flip: true, z: 470, hidden: G.flag('wonGame') },
      prop('cardtable', 830, 560, () => `<ellipse cx="0" cy="-60" rx="230" ry="46" fill="#1f8a4c" ${K}/><ellipse cx="0" cy="-60" rx="200" ry="34" fill="none" stroke="#ffc93c" stroke-width="3"/>
        <path d="M-200,-50 L-180,0 M200,-50 L180,0" stroke="#4e342e" stroke-width="10"/>
        <g transform="translate(-40,-70) rotate(-10)"><rect x="-14" y="-20" width="28" height="40" rx="4" fill="#fff" ${K3}/></g><g transform="translate(-10,-72) rotate(8)"><rect x="-14" y="-20" width="28" height="40" rx="4" fill="#c93a50" ${K3}/></g>
        ${[0, 1, 2].map((i) => `<ellipse cx="${80 + i * 4}" cy="${-66 - i * 6}" rx="16" ry="6" fill="${['#e8324a', '#1e63c4', '#ffc93c'][i]}" ${K3}/>`).join('')}`, 540),
    ],
    hotspots: (G) => [
      { id: 'out', name: 'To the square', rect: [0, 470, 80, 150], exit: 'square', arrow: 'left', walk: [150, 600] },
      { id: 'slots', name: 'Slot machines', rect: [40, 250, 270, 220], walk: [180, 600], face: 160,
        tap: async (G) => {
          A.sfx('slot'); await G.wait(1100);
          const r = Math.random();
          if (r < 0.3) { A.sfx('coin'); await G.say('fox', 'Three cherries! I win... a coupon for a free glass of goat milk. Hooray.'); }
          else await G.say('fox', ['Spies don\'t gamble. Much.', 'Nothing. The house always wins. But not against Spy Fox.', 'Two lemons and a bell. Story of my life.'][Math.floor(Math.random() * 3)]);
        } },
      { id: 'chandelier', name: 'Chandelier', rect: [550, 30, 180, 110], walk: false, tap: (G) => G.say('fox', 'A fancy chandelier. In the movies, the hero always swings on one. I\'ll pass.') },
      { id: 'mirror', name: 'Big mirror', rect: [340, 140, 160, 200], walk: [430, 590], face: 420,
        use: async (G, item) => {
          if (item !== 'gum') return false;
          if (G.flag('mirrorGum')) return G.say('fox', 'That mirror is already gummed up.');
          A.sfx('gum'); G.set('mirrorGum'); G.take('gum'); G.refreshBg();
          await G.say('fox', 'One giant bubble of Spy Gum. Now nobody\'s peeking at my cards.');
          await G.say('leroach', 'Hey! What happened to my... er... the casino\'s lovely mirror?', { actor: 'leroach' });
        },
        tap: async (G) => {
          if (G.flag('mirrorGum')) return G.say('fox', 'Pink is a good look for a mirror.');
          if (G.flag('lostOnce')) { G.set('sawMirror'); return G.talk([['fox', 'Wait a minute. This mirror is right behind my seat at the card table...'], ['fox', 'LeRoach can see every card in my hand! That sneaky roach. I need to cover it up.']]); }
          return G.say('fox', 'A mirror. Looking good, Spy Fox. Looking very good.');
        } },
      { id: 'leroach', name: 'Napoleon LeRoach', actor: 'leroach', walk: [700, 590], face: 960, when: (G) => !G.flag('wonGame'),
        use: async (G, item) => { if (item === 'membership') return challenge(G); return false; },
        tap: async (G) => {
          if (!G.has('membership')) return G.talk([['leroach', 'Bonjour. I am Napoleon LeRoach, champion of Go Fish!'], ['leroach', 'But I only play with High Rollers. Show me a High Roller Card, or scram!']]);
          return challenge(G);
        } },
      { id: 'table', name: 'Card table', rect: [620, 450, 420, 110], walk: [700, 590], when: (G) => G.flag('wonGame'),
        tap: (G) => G.say('fox', 'LeRoach left in such a hurry he forgot his chips. I\'ll leave them for the casino.') },
    ],
  };
  async function challenge(G) {
    if (!G.flag('metLeRoach')) {
      G.set('metLeRoach');
      await G.talk([
        ['leroach', 'A High Roller Card! Magnifique! Sit, sit. We play Go Fish.'],
        ['fox', 'What are we playing for?'],
        ['leroach', 'If you win, I give you... this! The keycard to the Goat Fortress. Ha! As if.'],
        ['leroach', 'If I win, you leave Acidophilus forever. Deal?'],
        ['fox', 'Deal. Let\'s go fishing.'],
      ]);
    } else await G.say('leroach', G.flag('lostOnce') ? 'Back for more? Napoleon LeRoach never loses!' : 'Ready to play?');
    if (!G.flag('lostOnce') && !G.flag('gfTip')) { G.set('gfTip'); await G.say('narrator', 'Go Fish: tap one of your cards to ask LeRoach for that fish. Collect all four of a kind to make a set. Whoever makes the most sets wins!'); }
    const won = await SF.gofish.play(G, !G.flag('mirrorGum'));
    if (won) {
      G.set('wonGame');
      A.sfx('fanfare');
      await G.talk([
        ['leroach', 'Impossible! Sacré bleu! I have never lost a game in my life!'],
        ['fox', 'First time for everything. The keycard, please.'],
        ['leroach', 'Fine! Take it! But William will hear about this!'],
      ]);
      G.give('keycard');
      if (G.has('membership')) G.take('membership');
      G.face('leroach', 1); await G.walk('leroach', 1350, 520, 420); G.hide('leroach');
      await G.say('fox', 'Next stop: the Goat Fortress.');
    } else {
      A.sfx('lose');
      if (!G.flag('lostOnce')) {
        G.set('lostOnce');
        await G.talk([
          ['leroach', 'Ha ha! I win! Napoleon LeRoach never loses! Never, never, never!'],
          ['fox', 'Hmm. He asked for exactly the cards I was holding. Every single time.'],
          ['fox', 'Nobody is that lucky. He must be peeking somehow. I should look around.'],
        ]);
      } else if (G.flag('mirrorGum')) {
        await G.talk([['leroach', 'Ha! Lucky me!'], ['fox', 'He won fair and square this time. Let\'s try again.']]);
      } else {
        await G.talk([['leroach', 'Ha ha! I win again!'], ['fox', 'He knows my cards again. There has to be a way he\'s seeing them.']]);
      }
    }
  }

  /* ======================================================================
     Goat Fortress gate
     ====================================================================== */
  S.gate = {
    name: 'The Goat Fortress', music: 'lair',
    walk: [120, 520, 1150, 610], depth: [520, 0.75, 610, 0.86],
    spawn: { default: [200, 580, 1], corridor: [640, 560, 1] },
    bg: (G) => {
      const open = G.flag('gateOpen');
      return `<defs>${grad('skyG', ['#2a1b55', '#c2577a', '#ffb36b'])}${grad('rockG', ['#6d5f80', '#3e3450'])}</defs>
      <rect width="1280" height="720" fill="url(#skyG)"/>
      <circle cx="200" cy="120" r="40" fill="#fff8e1" opacity=".9"/>
      ${[[90, 60], [380, 40], [1000, 70], [1180, 30], [700, 50]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#fff" class="pulse"/>`).join('')}
      <rect x="300" y="120" width="680" height="380" fill="url(#rockG)" ${K}/>
      ${Array.from({ length: 9 }, (_, i) => `<rect x="${300 + i * 80}" y="90" width="50" height="40" fill="#5b4a6e" ${K3}/>`).join('')}
      ${Array.from({ length: 5 }, (_, r) => Array.from({ length: 8 }, (_, c) => `<rect x="${305 + c * 85 + (r % 2) * 40}" y="${140 + r * 70}" width="80" height="64" fill="none" stroke="#2e2640" stroke-width="3"/>`).join('')).join('')}
      <path d="M520,160 C430,40 330,90 380,170 M760,160 C850,40 950,90 900,170" fill="none" stroke="#c9b28a" stroke-width="34" stroke-linecap="round"/>
      <path d="M520,160 C430,40 330,90 380,170 M760,160 C850,40 950,90 900,170" fill="none" ${K}/>
      <path d="M500,500 L500,260 Q640,140 780,260 L780,500Z" fill="#2a2236" ${K}/>
      ${open ? `<path d="M520,500 L520,270 Q640,170 760,270 L760,500Z" fill="#7cf0ff" opacity=".35"/><path d="M500,500 L470,500 L470,250 L500,260Z M780,500 L810,500 L810,250 L780,260Z" fill="#8d6e63" ${K}/>`
               : `<path d="M510,500 L510,265 Q640,160 770,265 L770,500Z" fill="#8d6e63" ${K}/><path d="M640,190 L640,500" ${K}/>${[300, 360, 420].map((y) => `<path d="M510,${y} L770,${y}" stroke="#5d4037" stroke-width="10"/>`).join('')}<circle cx="640" cy="320" r="34" fill="#ffc93c" ${K}/><text x="640" y="332" text-anchor="middle" font-family="Luckiest Guy, Impact, sans-serif" font-size="30" fill="${INK}">W</text>`}
      <circle cx="560" cy="230" r="12" fill="#ff3d5a" class="flicker"/><circle cx="720" cy="230" r="12" fill="#ff3d5a" class="flicker"/>
      <path d="M0,500 L1280,500 L1280,720 L0,720Z" fill="#5d5470"/>
      <path d="M0,500 Q300,480 640,500 Q980,520 1280,500" fill="none" stroke="#3e3450" stroke-width="6"/>
      <g transform="translate(880,500)"><rect x="-8" y="-150" width="16" height="150" fill="#9e9e9e" ${K3}/><rect x="-36" y="-200" width="72" height="80" rx="10" fill="#37474f" ${K}/><rect x="-24" y="-188" width="48" height="24" rx="4" fill="${open ? '#69f0ae' : '#ff5252'}" class="pulse"/><rect x="-26" y="-152" width="52" height="8" rx="4" fill="#111"/></g>
      <g transform="translate(150,420)"><path d="M0,0 L0,-160" stroke="#5d4037" stroke-width="8"/><path d="M0,-160 L90,-140 L0,-110Z" fill="#6a2c91" ${K3}/><text x="30" y="-128" font-family="Luckiest Guy, Impact, sans-serif" font-size="22" fill="#ffc93c">W</text></g>`;
    },
    actors: (G) => [{ id: 'guard', x: 360, y: 540, scale: 0.85, hit: [150, 170] }],
    hotspots: (G) => [
      { id: 'back', name: 'Back to town', rect: [0, 440, 80, 160], exit: 'square', arrow: 'left', walk: [130, 580] },
      { id: 'reader', name: 'Card reader', rect: [840, 290, 90, 150], walk: [840, 560], face: 880,
        use: async (G, item) => {
          if (item !== 'keycard') return false;
          if (G.flag('gateOpen')) return G.say('fox', 'The gate is already open.');
          A.sfx('beep'); await G.wait(500); A.sfx('rumble');
          G.set('gateOpen'); G.refreshBg(); G.refreshFg();
          await G.say('fox', 'Open sesame. Or should I say, open... goat-ame.');
        },
        tap: (G) => G.flag('gateOpen') ? G.say('fox', 'The light is green. Time to go in.') : G.say('fox', 'A keycard reader. No card, no entry. I need that keycard.') },
      { id: 'gatedoor', name: G.flag('gateOpen') ? 'Into the fortress' : 'Fortress gate', rect: [500, 200, 280, 300], walk: [640, 530], arrow: G.flag('gateOpen') ? 'up' : null,
        exit: G.flag('gateOpen') ? 'corridor' : undefined,
        tap: (G) => G.say('fox', 'Locked tight. There\'s a card reader next to it.') },
      { id: 'guard', name: 'Goat guard', actor: 'guard', walk: [500, 580], face: 360,
        tap: async (G) => { A.sfx('snore'); G.fx('<g class="pulse"><text x="400" y="380" font-family="Luckiest Guy, Impact, sans-serif" font-size="40" fill="#fff">Z z z</text></g>', 1600); await G.say('guard', 'Zzzz... mmm... goat cheese... zzzz...'); await G.say('fox', 'Better let sleeping goats lie.'); } },
      { id: 'horns', name: 'Giant horns', rect: [340, 40, 600, 130], walk: false, tap: (G) => G.say('fox', 'Giant goat horns on the front gate. Subtle, William. Very subtle.') },
    ],
  };

  /* ======================================================================
     Laser corridor
     ====================================================================== */
  const BEAMS = [430, 660, 890];
  const BEAM_TIMING = [[1600, 0.5], [1250, 0.45], [950, 0.5]]; // period ms, fraction "off"
  function beamOn(i) { const [p, off] = BEAM_TIMING[i]; return (performance.now() % p) / p > off; }
  S.corridor = {
    name: 'Laser Hallway', music: 'lair',
    walk: [140, 560, BEAMS[0] - 95, 610], depth: [560, 0.82, 610, 0.88],
    spawn: { default: [170, 590, 1], lab: [1100, 590, -1] },
    bg: (G) => `<defs>${grad('corW', ['#1d3b45', '#0f2027'])}${grad('corF', ['#26414d', '#132a33'])}</defs>
      <rect width="1280" height="720" fill="url(#corW)"/>
      ${Array.from({ length: 10 }, (_, i) => `<rect x="${i * 132 + 6}" y="60" width="120" height="400" rx="10" fill="#21454f" stroke="#0c1a20" stroke-width="4"/>`).join('')}
      <rect x="0" y="0" width="1280" height="60" fill="#0c1a20"/><rect x="0" y="470" width="1280" height="250" fill="url(#corF)"/>
      ${Array.from({ length: 14 }, (_, i) => `<path d="M${i * 100},470 L${i * 100 - 80},720" stroke="#0c1a20" stroke-width="3"/>`).join('')}
      ${BEAMS.map((x) => `<rect x="${x - 22}" y="60" width="44" height="30" rx="6" fill="#455a64" ${K3}/><circle cx="${x}" cy="90" r="8" fill="#ff1744"/><rect x="${x - 22}" y="630" width="44" height="22" rx="6" fill="#455a64" ${K3}/>`).join('')}
      <rect x="1120" y="170" width="150" height="320" rx="12" fill="#6a2c91" ${K}/><circle cx="1195" cy="320" r="40" fill="#ffc93c" ${K}/><text x="1195" y="334" text-anchor="middle" font-family="Luckiest Guy, Impact, sans-serif" font-size="38" fill="${INK}">W</text>
      <text x="1195" y="160" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="20" fill="#ff5252" class="flicker">LAB</text>`,
    fg: (G) => G.flag('misted') ? `<g opacity=".25">${BEAMS.map((x) => `<rect x="${x - 70}" y="80" width="140" height="560" fill="#b2ebf2"/>`).join('')}</g>
      ${BEAMS.map((x, i) => `<g id="beam${i}"><path d="M${x},92 L${x},632" stroke="#ff1744" stroke-width="12" opacity=".5"/><path d="M${x},92 L${x},632" stroke="#ffcdd2" stroke-width="4"/></g>`).join('')}` : '',
    hotspots: (G) => {
      const sc = S.corridor;
      const i = sc.next || 0;
      const list = [
        { id: 'back', name: 'Back outside', rect: [0, 430, 80, 180], exit: 'gate', arrow: 'left', walk: [150, 590], when: () => (S.corridor.next || 0) === 0 },
        { id: 'door', name: 'Lab door', rect: [1110, 160, 170, 340], exit: 'lab', arrow: 'right', walk: [1100, 590], when: () => (S.corridor.next || 0) >= BEAMS.length },
      ];
      if (i < BEAMS.length) list.push({
        id: 'beam', name: G.flag('misted') ? 'Laser beam' : 'Hallway', rect: [BEAMS[i] - 90, 80, 180 + (i < BEAMS.length - 1 ? 0 : 0), 560], walk: false,
        use: async (G, item) => {
          if (item !== 'mist') return false;
          if (G.flag('misted')) return G.say('fox', 'I can already see the lasers. Smells nice in here, though.');
          await G.foxTo(BEAMS[i] - 70, 590);
          A.sfx('spray'); G.fx(`<g opacity=".5" class="pulse">${[0, 1, 2, 3, 4].map((k) => `<circle cx="${BEAMS[i] - 40 + k * 50}" cy="${360 + (k % 2) * 60}" r="${60 + k * 10}" fill="#e0f7fa"/>`).join('')}</g>`, 1200);
          await G.wait(700);
          G.set('misted'); G.refreshFg(); sc.startBeams(G);
          await G.say('fox', 'Spy Mist Cologne. Now I can see the lasers. They blink on and off...');
          await G.say('fox', 'If I time it right, I can slip through when each one switches off.');
        },
        tap: (G) => crossBeam(G, i),
      });
      return list;
    },
    enter: async (G, from) => {
      const sc = S.corridor;
      if (from === 'lab') { sc.next = BEAMS.length; sc.walk = [BEAMS[2] + 60, 560, 1150, 610]; }
      else { sc.next = 0; sc.walk = [140, 560, BEAMS[0] - 95, 610]; }
      G.refreshFg();
      if (G.flag('misted')) sc.startBeams(G);
      if (!G.flag('corridorIntro')) { G.set('corridorIntro'); await G.say('fox', 'A long, empty hallway. Too empty. Something tells me it isn\'t as empty as it looks.'); }
    },
    startBeams(G) {
      clearInterval(this.timer);
      this.timer = setInterval(() => {
        if (G.scene !== S.corridor) { clearInterval(this.timer); return; }
        BEAMS.forEach((_, i) => { const el = document.getElementById('beam' + i); if (el) el.style.opacity = beamOn(i) ? 1 : 0.05; });
      }, 50);
    },
  };
  async function crossBeam(G, i) {
    const sc = S.corridor, fox = G.actors.fox, standX = BEAMS[i] - 95;
    if (Math.abs(fox.x - standX) > 14) { await G.foxTo(standX, fox.y); G.face('fox', 1); if (G.flag('misted')) return; }
    if (G.flag('misted') && !beamOn(i)) {
      A.sfx('whoosh');
      sc.walk = [140, 560, 1150, 610];
      await G.walk('fox', BEAMS[i] + 60, fox.y, 700);
      sc.next = i + 1;
      sc.walk = [BEAMS[i] + 60, 560, i + 1 < BEAMS.length ? BEAMS[i + 1] - 95 : 1150, 610];
      G.refreshFg(); if (G.flag('misted')) sc.startBeams(G);
      if (sc.next >= BEAMS.length) { A.sfx('pickup'); await G.say('fox', 'Made it! Spy Fox: one. Lasers: zero.'); }
      return;
    }
    // Zapped!
    sc.walk = [140, 560, 1150, 610];
    await G.walk('fox', BEAMS[i] - 10, fox.y, 500);
    A.sfx('zap'); A.sfx('alarm');
    G.fx('<rect width="1280" height="720" fill="#ff1744" opacity=".35" class="pulse"/>', 700);
    G.hop('fox');
    await G.say('fox', G.flag('misted') ? ['Yowch! Too early!', 'Ouch! Timing, Fox. Timing.', 'Zap! That one\'s still on!'][Math.floor(Math.random() * 3)] : 'YOWCH! Invisible lasers! I need some way to see them.');
    await G.walk('fox', 170, 590, 700);
    sc.next = 0; sc.walk = [140, 560, BEAMS[0] - 95, 610];
    G.refreshFg(); if (G.flag('misted')) sc.startBeams(G);
  }

  /* ======================================================================
     William's laboratory
     ====================================================================== */
  S.lab = {
    name: 'William\'s Laboratory', music: 'lair',
    walk: [140, 570, 1150, 615], depth: [570, 0.82, 615, 0.88],
    spawn: { default: [160, 595, 1] },
    bg: (G) => {
      const done = G.flag('savedMilk');
      return `<defs>${grad('labW', ['#2a1840', '#120a22'])}${grad('labF', ['#3b2a55', '#1d1330'])}${grad('tank', ['#f5f5f5', '#bdbdbd'], false)}</defs>
      <rect width="1280" height="720" fill="url(#labW)"/>
      <path d="M560,0 L720,0 L700,40 L580,40Z" fill="#7cf0ff" opacity=".25"/>
      ${Array.from({ length: 7 }, (_, i) => `<path d="M${i * 200},0 L${i * 200 + 40},480" stroke="#3a2a55" stroke-width="10"/>`).join('')}
      <rect x="0" y="480" width="1280" height="240" fill="url(#labF)"/>
      ${Array.from({ length: 8 }, (_, i) => `<path d="M0,${500 + i * 30} L1280,${500 + i * 30}" stroke="#2a1d40" stroke-width="3"/>`).join('')}
      <g transform="translate(640,500)">
        <rect x="-130" y="-60" width="260" height="60" fill="#455a64" ${K}/>
        <rect x="-100" y="-330" width="200" height="270" rx="30" fill="url(#tank)" ${K}/>
        <path d="M-100,-250 L100,-250 M-100,-160 L100,-160" stroke="#9e9e9e" stroke-width="6"/>
        <path d="M-60,-330 L-110,-440 L110,-440 L60,-330Z" fill="#78909c" ${K}/>
        <ellipse cx="0" cy="-440" rx="110" ry="24" fill="#90a4ae" ${K}/>
        <path d="M0,-464 L0,-500" ${K}/><circle cx="0" cy="-500" r="10" fill="${done ? '#69f0ae' : '#ff1744'}" class="pulse"/>
        <rect x="-80" y="-230" width="160" height="56" rx="8" fill="#111" ${K3}/>
        <text id="countdown" x="0" y="-189" text-anchor="middle" font-family="Courier New, monospace" font-weight="700" font-size="40" fill="${done ? '#69f0ae' : '#ff1744'}">${done ? 'OFF' : '--:--'}</text>
        <text x="0" y="-270" text-anchor="middle" font-family="Luckiest Guy, Impact, sans-serif" font-size="26" fill="${INK}">DRY-O-MATIC</text>
        <path d="M-130,-30 Q-260,-60 -300,-200 M130,-30 Q260,-60 300,-200" fill="none" stroke="#607d8b" stroke-width="18"/>
        <path d="M-130,-30 Q-260,-60 -300,-200 M130,-30 Q260,-60 300,-200" fill="none" ${K}/></g>
      <g transform="translate(1180,500)"><rect x="-60" y="-420" width="120" height="420" rx="20" fill="#7cf0ff" opacity=".25" ${K}/><text x="0" y="-430" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="18" fill="#ffc93c">ESCAPE POD</text></g>
      <g transform="translate(960,520)"><path d="M-110,0 L-90,-90 L90,-90 L110,0Z" fill="#37474f" ${K}/><path d="M-80,-90 L-70,-130 L70,-130 L80,-90Z" fill="#263238" ${K}/>
        ${[0, 1, 2, 3].map((i) => `<g transform="translate(${-54 + i * 36},-60)"><path d="M-12,8 L-8,-12 L8,-12 L12,8Z" fill="${['#e8324a', '#ffc93c', '#2fd0bd', '#7e57c2'][i]}" ${K3}/></g>`).join('')}
        <rect x="-50" y="-124" width="100" height="26" rx="4" fill="#0d4f4a"/><text x="0" y="-104" text-anchor="middle" font-family="Courier New, monospace" font-size="16" fill="#69f0ae">COWBELL</text></g>`;
    },
    actors: (G) => [
      { id: 'udder', x: 280, y: 560, scale: 0.82, hit: [150, 280], art: () => (G.flag('freedUdder') ? SF.art.udder() : SF.art.udderTied()) },
      { id: 'william', x: 640, y: 540, scale: 0.85, hit: [150, 300], hidden: G.flag('williamGone') || G.flag('savedMilk'), z: 560 },
    ],
    hotspots: (G) => [
      { id: 'udder', name: 'Mr. Udder', actor: 'udder', walk: [420, 600], face: 280,
        use: async (G, item) => {
          if (item !== 'lipstick') return false;
          if (G.flag('freedUdder')) return G.say('fox', 'He\'s already free.');
          A.sfx('laser');
          G.fx(`<path d="M380,470 L300,420" stroke="#ff1744" stroke-width="6" class="flicker"/>`, 900);
          await G.wait(900);
          G.set('freedUdder'); G.removeActor('udder'); G.addActor(S.lab.actors(G)[0]); G.sortActors();
          A.sfx('moo');
          await G.talk([
            ['udder', 'Free! Thank you, Spy Fox! That old goat kept me tied up for days.'],
            ['udder', 'Listen. William stole my invention to build that Dry-O-Matic. Only the secret cowbell code can shut it down.'],
            ['udder', 'I\'ll play it for you. Listen carefully!'],
          ]);
          await SF.bells.playTune(G.state.rand.melody);
          await G.say('udder', 'Now play the same tune on the cowbells at the control console. Hurry!');
        },
        tap: async (G) => {
          if (!G.flag('freedUdder')) return G.talk([['udder', 'Spy Fox! Over here! Get me out of these ropes!'], ['fox', 'Hold still, Mr. Udder. These knots are tight. I need something sharp. Or something laser-y.']]);
          await G.say('udder', 'Want to hear the cowbell code again? Here it is!');
          await SF.bells.playTune(G.state.rand.melody);
        } },
      { id: 'console', name: 'Control console', rect: [850, 380, 220, 150], walk: [940, 600], face: 960,
        tap: async (G) => {
          if (G.flag('savedMilk')) return G.say('fox', 'Off. Permanently.');
          if (!G.flag('freedUdder')) return G.say('fox', 'Four cowbells and a lot of buttons. I\'d better find someone who knows how this thing works.');
          const ok = await SF.bells.play(G, G.state.rand.melody);
          if (ok) await finale(G);
        } },
      { id: 'machine', name: 'Dry-O-Matic', rect: [500, 60, 280, 380], walk: [640, 600],
        tap: (G) => G.flag('savedMilk') ? G.say('fox', 'That machine won\'t be drying anything ever again.') : G.say('fox', 'The Dry-O-Matic. If this thing goes off, every glass of milk on Earth turns to dust.') },
      { id: 'pod', name: 'Escape pod', rect: [1110, 80, 140, 420], walk: [1100, 600], tap: (G) => G.say('fox', 'William\'s escape pod tube. He went up, up and away.') },
      { id: 'out', name: 'Back to the hallway', rect: [0, 420, 80, 190], exit: 'corridor', arrow: 'left', walk: [150, 595] },
    ],
    enter: async (G) => {
      startCountdown(G);
      if (G.flag('williamGone') || G.flag('savedMilk')) return;
      G.cut = true; G.setBar(false);
      await G.walk('fox', 440, 600);
      G.face('william', -1);
      A.sfx('bleat');
      await G.talk([
        ['william', 'Well, well, well. Spy Fox! LeRoach told me you were coming.'],
        ['fox', 'William the Once-Great. Let Mr. Udder go and turn off that machine.'],
        ['william', 'Turn it off? Ha! In ten minutes my Dry-O-Matic will turn every drop of cow\'s milk on Earth into dust!'],
        ['william', 'Then the whole world will beg for my goat milk. Once I was great. Soon I will be William the GREATER!'],
        ['fox', 'And kids everywhere would have to eat their cereal dry. You monster.'],
        ['william', 'Exactly! Ha ha ha! Farewell, Spy Fox. I\'ll watch the fun from my yacht!'],
      ]);
      G.face('william', 1);
      await G.walk('william', 1180, 560, 380);
      A.sfx('whoosh');
      G.hide('william'); G.set('williamGone');
      G.fx('<rect x="1120" y="80" width="120" height="420" fill="#fff" opacity=".6" class="pulse"/>', 700);
      await G.say('fox', 'He got away. But first things first: I have to stop that machine.');
      G.cut = false; G.setBar(true);
    },
  };
  function startCountdown(G) {
    clearInterval(S.lab.timer);
    if (G.flag('savedMilk')) return;
    if (!G.state.countdownEnd) { G.state.countdownEnd = Date.now() + 10 * 60 * 1000; G.save(); }
    S.lab.timer = setInterval(() => {
      if (G.scene !== S.lab || G.flag('savedMilk')) { clearInterval(S.lab.timer); return; }
      // The clock is dramatic, not deadly: it never runs out.
      const left = Math.max(60, Math.round((G.state.countdownEnd - Date.now()) / 1000));
      const el = document.getElementById('countdown');
      if (el) el.textContent = `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`;
    }, 250);
  }
  async function finale(G) {
    G.cut = true; G.setBar(false);
    G.set('savedMilk'); clearInterval(S.lab.timer);
    A.sfx('rumble');
    G.refreshBg();
    await G.say('fox', 'Code accepted! The Dry-O-Matic is shutting down!');
    // Milk geyser!
    A.sfx('splash');
    G.fx(`<g><path d="M640,40 Q600,-20 560,60 Q520,140 470,200 M640,40 Q690,-30 740,60 Q780,140 820,220" stroke="#fff" stroke-width="40" fill="none" stroke-linecap="round" class="pulse"/>
      ${Array.from({ length: 24 }, (_, k) => `<circle cx="${380 + (k * 53) % 520}" cy="${60 + (k * 37) % 300}" r="${8 + (k % 4) * 5}" fill="#fff"/>`).join('')}</g>`, 2600);
    await G.wait(1200);
    G.show('william'); G.place('william', 1180, 300); G.face('william', -1);
    A.sfx('boing');
    await G.walk('william', 820, 560, 600);
    G.fx(`<g transform="translate(820,560)">${Array.from({ length: 10 }, (_, k) => `<circle cx="${-60 + k * 13}" cy="${-150 - (k % 3) * 40}" r="7" fill="#ffc93c" ${K3}/>`).join('')}<ellipse cx="0" cy="-40" rx="80" ry="18" fill="#fff" opacity=".9"/></g>`, 0);
    await G.talk([
      ['william', 'Blech! What happened? My escape pod is full of milk! And... cereal?!'],
      ['udder', 'Your machine backfired, William. All the milk you stole came gushing back out!'],
      ['fox', 'Looks like your plan went sour, William. Just like your goat milk.'],
      ['william', 'Curses! I was ONCE great! Once!'],
    ]);
    await G.openWatch({ force: true, wait: true, text: 'Spy Fox, you did it! The world\'s milk is safe. SPY Corp agents are on their way to pick up William and LeRoach. Come home, hero!', closeText: 'Head home' });
    G.cut = false;
    await SF.main.ending();
  }
})(window.SF);
