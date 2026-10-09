/* Character art. Every character is an SVG group with its feet at (0,0), facing right. */
window.SF = window.SF || {};
(function (SF) {
  const INK = '#20152b';
  const K = `stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
  const K3 = `stroke="${INK}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"`;
  SF.K = K; SF.K3 = K3; SF.INK = INK;

  const legs = (h, w, gap, pants, shoe, shoeLen = 1) => `
    <g class="leg leg-b"><rect x="${gap}" y="${-h}" width="${w}" height="${h - 6}" rx="${w / 3}" fill="${pants}" ${K}/>
      <ellipse cx="${gap + w / 2 + 6}" cy="-7" rx="${w * 0.85 * shoeLen}" ry="9" fill="${shoe}" ${K}/></g>
    <g class="leg leg-a"><rect x="${-gap - w}" y="${-h}" width="${w}" height="${h - 6}" rx="${w / 3}" fill="${pants}" ${K}/>
      <ellipse cx="${-gap - w / 2 + 6}" cy="-7" rx="${w * 0.85 * shoeLen}" ry="9" fill="${shoe}" ${K}/></g>`;

  const torso = (top, bot, wt, wb, fill) =>
    `<path d="M${-wt},${top} Q${-wb - 8},${(top + bot) / 2} ${-wb},${bot} L${wb},${bot} Q${wb + 8},${(top + bot) / 2} ${wt},${top} Q0,${top - 14} ${-wt},${top}Z" fill="${fill}" ${K}/>`;

  // An arm hanging from (x,y). `wave` makes it the gesturing arm.
  const arm = (x, y, len, sleeve, hand, wave = false, rot = 8) => `
    <g transform="translate(${x},${y}) rotate(${rot})"><g class="${wave ? 'wave' : ''}">
      <path d="M-10,0 L10,0 L12,${len} L-12,${len}Z" fill="${sleeve}" ${K}/>
      <circle cx="0" cy="${len + 9}" r="11" fill="${hand}" ${K}/></g></g>`;

  const mouth = (closed, open, openFill = '#7a1a2a') =>
    `<g class="mouth"><path class="m-closed" d="${closed}" fill="none" ${K}/><path class="m-open" d="${open}" fill="${openFill}" ${K}/></g>`;

  const eye = (cx, cy, rx, ry, px, py, pr = 5) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" ${K3}/><circle cx="${px}" cy="${py}" r="${pr}" fill="${INK}"/><circle cx="${px + 1.5}" cy="${py - 2}" r="1.6" fill="#fff"/>`;

  const ART = SF.art = {};

  /* ---------------- Spy Fox ---------------- */
  const FOX = '#f08a24', FOX_D = '#b95a10', CREAM = '#fff1dc', SUIT = '#232036';
  ART.foxHead = () => `
    <path d="M-34,-18 L-46,-80 L-6,-38 Z" fill="${FOX}" ${K}/><path d="M-31,-30 L-38,-64 L-17,-38Z" fill="${FOX_D}"/>
    <path d="M4,-40 L22,-88 L40,-26 Z" fill="${FOX}" ${K}/><path d="M12,-42 L22,-72 L31,-33Z" fill="${FOX_D}"/>
    <path d="M-46,0 C-48,-36 -20,-48 6,-46 C34,-44 52,-26 52,-4 C52,22 30,36 0,36 C-28,36 -44,22 -46,0Z" fill="${FOX}" ${K}/>
    <path d="M-44,8 L-58,16 L-44,20 L-52,30 L-30,30 Z" fill="${CREAM}" ${K3}/>
    <path d="M18,-6 C44,-14 76,-8 88,2 C82,18 56,28 30,28 C16,26 10,8 18,-6Z" fill="${CREAM}" ${K}/>
    <ellipse cx="88" cy="1" rx="10" ry="8" fill="${INK}"/><ellipse cx="85" cy="-2" rx="3" ry="2" fill="#fff" opacity=".7"/>
    <g class="blink">${eye(8, -14, 10, 13, 13, -11)}${eye(36, -14, 9, 12, 41, -11)}</g>
    <path d="M-3,-15 Q8,-31 19,-15 Z" fill="${FOX}" ${K3}/><path d="M26,-15 Q36,-30 46,-15 Z" fill="${FOX}" ${K3}/>
    <path d="M-4,-34 Q8,-40 20,-33" fill="none" ${K}/><path d="M28,-32 Q40,-38 50,-28" fill="none" ${K}/>
    ${mouth('M42,18 Q58,24 72,15', 'M42,16 Q58,40 74,13 Q58,22 42,16Z')}`;

  ART.fox = () => `<g class="bob">
    <g class="tailwag"><path d="M-22,-100 C-84,-96 -124,-140 -108,-198 C-98,-166 -72,-138 -18,-128Z" fill="${FOX}" ${K}/>
      <path d="M-108,-198 C-118,-176 -112,-160 -100,-152 L-92,-170 C-98,-178 -103,-188 -108,-198Z" fill="${CREAM}" ${K3}/></g>
    ${arm(-26, -168, 62, SUIT, FOX, false, 14)}
    ${legs(96, 22, 3, SUIT, '#111')}
    ${torso(-180, -86, 34, 40, SUIT)}
    <path d="M-14,-182 L0,-128 L14,-182Z" fill="#fff" ${K3}/>
    <path d="M-14,-182 L-2,-140 M14,-182 L2,-140" stroke="#4a4566" stroke-width="4" fill="none"/>
    <circle cx="0" cy="-116" r="3.5" fill="#4a4566"/><circle cx="0" cy="-102" r="3.5" fill="#4a4566"/>
    <path d="M22,-150 L34,-150 L32,-142 L22,-142Z" fill="#fff"/>
    <path d="M0,-178 L-17,-189 L-17,-167Z M0,-178 L17,-189 L17,-167Z" fill="#e8324a" ${K3}/><circle cx="0" cy="-178" r="5" fill="#b0233a" ${K3}/>
    ${arm(28, -168, 62, SUIT, FOX, true, -10)}
    <g transform="translate(0,-224)">${ART.foxHead()}</g>
  </g>`;

  /* ---------------- Monkey Penny ---------------- */
  const MONK = '#8a5a3c', PEACH = '#f6c9a0';
  ART.pennyHead = () => `
    <path d="M-40,-30 C-60,-70 0,-80 30,-56 C50,-40 54,-10 46,10 C60,-30 40,-80 -40,-30Z" fill="#5a3a26" ${K3}/>
    <circle cx="-44" cy="-2" r="17" fill="${MONK}" ${K}/><circle cx="-44" cy="-2" r="9" fill="${PEACH}"/>
    <circle cx="0" cy="-4" r="44" fill="${MONK}" ${K}/>
    <path d="M-16,-26 C-6,-40 14,-40 20,-26 C30,-38 46,-30 44,-14 C46,10 30,32 8,32 C-14,32 -28,14 -26,-6 C-28,-18 -24,-26 -16,-26Z" fill="${PEACH}" ${K3}/>
    <g class="blink">${eye(0, -12, 9, 12, 4, -10)}${eye(26, -12, 9, 12, 30, -10)}</g>
    <path d="M-8,-24 L-12,-30 M2,-26 L0,-33 M20,-24 L20,-31 M32,-24 L36,-30" ${K3}/>
    <ellipse cx="18" cy="6" rx="3" ry="2.5" fill="${INK}"/><ellipse cx="26" cy="6" rx="3" ry="2.5" fill="${INK}"/>
    ${mouth('M6,18 Q20,26 34,16', 'M6,16 Q20,36 34,14 Q20,22 6,16Z', '#c2185b')}
    <path d="M-30,-40 Q0,-60 34,-42" fill="none" stroke="#3b3550" stroke-width="7"/>
    <rect x="-40" y="-24" width="14" height="24" rx="5" fill="#3b3550" ${K3}/>
    <path d="M-30,-4 Q-20,26 4,24" fill="none" stroke="#3b3550" stroke-width="4"/><circle cx="6" cy="24" r="5" fill="#e8324a" ${K3}/>
    <path d="M30,-46 L40,-58 L44,-44 Z" fill="#ff7eb6" ${K3}/>`;
  ART.penny = () => `<g class="bob">
    <path d="M-10,-90 C-60,-80 -70,-30 -50,-10 C-44,-30 -40,-60 -10,-80" fill="none" stroke="${MONK}" stroke-width="9" stroke-linecap="round"/>
    ${legs(70, 16, 6, MONK, '#e8324a')}
    ${arm(-24, -150, 52, '#ff7eb6', MONK, false, 14)}
    <path d="M-30,-156 Q-44,-100 -52,-66 L52,-66 Q44,-100 30,-156 Q0,-168 -30,-156Z" fill="#ff7eb6" ${K}/>
    <path d="M-20,-150 L0,-130 L20,-150" fill="none" stroke="#fff" stroke-width="5"/>
    ${arm(26, -150, 52, '#ff7eb6', MONK, true, -10)}
    <g transform="translate(0,-196)">${ART.pennyHead()}</g></g>`;

  /* ---------------- Professor Quack ---------------- */
  ART.quackHead = () => `
    <path d="M-20,-38 L-28,-62 L-10,-44 L-6,-70 L4,-44 L16,-64 L12,-38Z" fill="#fff" ${K3}/>
    <circle cx="0" cy="-4" r="40" fill="#fff" ${K}/>
    <path d="M26,-8 Q70,-16 84,-2 Q66,10 28,8Z" fill="#ffa726" ${K}/>
    <g class="mouth"><path class="m-closed" d="M28,8 Q60,14 74,8 Q58,22 28,18Z" fill="#fb8c00" ${K}/><path class="m-open" d="M28,8 Q60,22 72,24 Q54,40 26,24Z" fill="#fb8c00" ${K}/></g>
    <g class="blink">${eye(4, -14, 8, 10, 8, -12, 4)}${eye(26, -14, 8, 10, 30, -12, 4)}</g>
    <circle cx="4" cy="-14" r="14" fill="none" stroke="${INK}" stroke-width="4"/><circle cx="28" cy="-14" r="14" fill="none" stroke="${INK}" stroke-width="4"/>
    <path d="M18,-14 L14,-14 M-10,-14 L-34,-20" stroke="${INK}" stroke-width="4"/>`;
  ART.quack = () => `<g class="bob">
    <g class="leg leg-b"><path d="M8,-80 L8,-12" stroke="#ffa726" stroke-width="8" stroke-linecap="round"/><path d="M-2,-6 L30,-10 L24,0 L0,0Z" fill="#ffa726" ${K3}/></g>
    <g class="leg leg-a"><path d="M-8,-80 L-8,-12" stroke="#ffa726" stroke-width="8" stroke-linecap="round"/><path d="M-18,-6 L14,-10 L8,0 L-16,0Z" fill="#ffa726" ${K3}/></g>
    ${arm(-26, -152, 56, '#f4f7ff', '#fff', false, 14)}
    <path d="M-32,-160 Q-46,-100 -46,-60 L46,-60 Q46,-100 32,-160 Q0,-172 -32,-160Z" fill="#f4f7ff" ${K}/>
    <path d="M0,-158 L0,-62" stroke="#c9cfe0" stroke-width="4"/><path d="M-16,-160 L0,-136 L16,-160" fill="#7fb3ff" ${K3}/>
    <rect x="12" y="-120" width="18" height="14" fill="none" stroke="#c9cfe0" stroke-width="4"/><path d="M18,-126 L18,-112" stroke="#e8324a" stroke-width="4"/>
    ${arm(28, -152, 56, '#f4f7ff', '#fff', true, -10)}
    <g transform="translate(0,-196)">${ART.quackHead()}</g></g>`;

  /* ---------------- William the Once-Great (goat) ---------------- */
  const GOAT = '#e8e2d6', GOAT_D = '#b9b0a0', ROBE = '#6a2c91';
  ART.williamHead = (crown = true) => `
    <path d="M-12,-34 C-40,-70 -86,-58 -82,-22 C-80,0 -56,4 -50,-14 C-60,-12 -66,-22 -60,-32 C-50,-46 -30,-40 -22,-24Z" fill="#9c7a52" ${K}/>
    <path d="M-30,-16 L-70,-4 L-34,4Z" fill="${GOAT_D}" ${K}/>
    <path d="M-34,-10 C-36,-44 0,-52 20,-38 C40,-26 66,-14 72,4 C76,18 60,26 44,26 C30,40 -4,40 -20,26 C-32,16 -34,4 -34,-10Z" fill="${GOAT}" ${K}/>
    <ellipse cx="70" cy="2" rx="6" ry="4" fill="${INK}"/>
    <path d="M24,28 Q30,70 14,86 Q10,60 4,34Z" fill="${GOAT_D}" ${K}/>
    <g class="blink">${eye(4, -16, 9, 11, 9, -14, 4.5)}${eye(30, -14, 9, 11, 35, -12, 4.5)}</g>
    <path d="M-6,-30 L18,-22 M24,-24 L44,-30" ${K}/>
    <circle cx="30" cy="-14" r="15" fill="none" stroke="#d4a017" stroke-width="4"/><path d="M42,-6 Q50,30 40,52" fill="none" stroke="#d4a017" stroke-width="2"/>
    ${mouth('M40,20 Q54,22 62,14', 'M38,18 Q54,36 64,12 Q52,22 38,18Z')}
    ${crown ? `<g transform="rotate(-14 0 -46)"><path d="M-22,-40 L-26,-72 L-12,-56 L0,-78 L12,-56 L26,-72 L22,-40Z" fill="#ffc93c" ${K}/><circle cx="0" cy="-52" r="5" fill="#e8324a" ${K3}/></g>` : ''}`;
  ART.william = () => `<g class="bob">
    ${legs(50, 16, 4, GOAT_D, '#3b2a1a')}
    ${arm(-30, -160, 66, ROBE, GOAT, false, 16)}
    <path d="M-36,-170 Q-60,-90 -62,-30 L62,-30 Q60,-90 36,-170 Q0,-184 -36,-170Z" fill="${ROBE}" ${K}/>
    <path d="M-62,-30 L62,-30 L62,-46 L-62,-46Z" fill="#fff" ${K3}/>
    <path d="M-44,-172 Q0,-150 44,-172 Q40,-150 0,-140 Q-40,-150 -44,-172Z" fill="#fff" ${K}/>
    <circle cx="-20" cy="-158" r="3" fill="${INK}"/><circle cx="14" cy="-154" r="3" fill="${INK}"/><circle cx="-40" cy="-38" r="3" fill="${INK}"/><circle cx="10" cy="-38" r="3" fill="${INK}"/><circle cx="44" cy="-38" r="3" fill="${INK}"/>
    ${arm(32, -160, 66, ROBE, GOAT, true, -14)}
    <g transform="translate(0,-212)">${ART.williamHead()}</g></g>`;

  /* ---------------- Napoleon LeRoach ---------------- */
  const ROACH = '#7a4a26';
  ART.leroachHead = () => `
    <path d="M-6,-40 Q-30,-90 -60,-96 M10,-40 Q20,-92 50,-104" fill="none" ${K}/>
    <ellipse cx="4" cy="-4" rx="38" ry="34" fill="${ROACH}" ${K}/>
    <g class="blink">${eye(-2, -10, 11, 14, 4, -8, 6)}${eye(26, -10, 11, 14, 32, -8, 6)}</g>
    <path d="M-14,-26 L10,-18 M20,-18 L40,-28" ${K}/>
    <path d="M8,12 Q-10,20 -24,8 M22,12 Q40,20 52,6" fill="none" ${K}/>
    ${mouth('M6,16 Q16,22 26,16', 'M6,14 Q16,32 26,14Z')}
    <path d="M-50,-28 Q4,-78 58,-28 Q4,-44 -50,-28Z" fill="#141414" ${K}/><circle cx="4" cy="-46" r="7" fill="#e8324a" ${K3}/><circle cx="4" cy="-46" r="3" fill="#fff"/>`;
  ART.leroach = () => `<g class="bob">
    ${legs(56, 12, 4, '#3a2412', '#111')}
    ${arm(-22, -124, 42, ROACH, ROACH, false, 20)}
    <ellipse cx="0" cy="-92" rx="32" ry="40" fill="${ROACH}" ${K}/>
    <path d="M-24,-118 Q0,-128 24,-118 L20,-64 Q0,-58 -20,-64Z" fill="#c62828" ${K}/>
    <circle cx="0" cy="-104" r="3" fill="#ffc93c"/><circle cx="0" cy="-88" r="3" fill="#ffc93c"/><circle cx="0" cy="-74" r="3" fill="#ffc93c"/>
    ${arm(22, -124, 42, ROACH, ROACH, true, -18)}
    <g transform="translate(0,-160)">${ART.leroachHead()}</g></g>`;

  /* ---------------- Mr. Udder (cow) ---------------- */
  ART.udderHead = () => `
    <path d="M-30,-32 Q-40,-56 -30,-60 Q-22,-50 -20,-36Z M20,-36 Q24,-58 34,-56 Q36,-44 28,-30Z" fill="#f5e6c8" ${K3}/>
    <ellipse cx="-44" cy="-20" rx="20" ry="9" fill="#fff" transform="rotate(-20 -44 -20)" ${K}/>
    <path d="M-34,-6 C-36,-44 34,-48 38,-8 C40,10 30,18 0,18 C-28,18 -34,8 -34,-6Z" fill="#fff" ${K}/>
    <path d="M-30,-20 Q-20,-40 -2,-36 Q-6,-20 -24,-12Z" fill="${INK}"/>
    <ellipse cx="14" cy="22" rx="40" ry="24" fill="#f7a8b8" ${K}/>
    <ellipse cx="2" cy="20" rx="5" ry="7" fill="#c06a7c"/><ellipse cx="28" cy="20" rx="5" ry="7" fill="#c06a7c"/>
    <g class="blink">${eye(-6, -18, 8, 10, -2, -16, 4)}${eye(20, -18, 8, 10, 24, -16, 4)}</g>
    ${mouth('M0,36 Q14,42 30,36', 'M0,34 Q14,52 30,34Z')}`;
  ART.udder = () => `<g class="bob">
    ${legs(74, 20, 4, '#5c6170', '#222')}
    ${arm(-30, -158, 58, '#5c6170', '#fff', false, 14)}
    ${torso(-168, -76, 38, 48, '#5c6170')}
    <path d="M-14,-170 L0,-120 L14,-170Z" fill="#fff" ${K3}/><path d="M0,-168 L-7,-156 L0,-122 L7,-156Z" fill="#1565c0" ${K3}/>
    ${arm(32, -158, 58, '#5c6170', '#fff', true, -12)}
    <g transform="translate(0,-210)">${ART.udderHead()}</g></g>`;
  // Tied to a chair version (for the lair)
  ART.udderTied = () => `
    <rect x="-56" y="-150" width="112" height="16" rx="6" fill="#8d6e63" ${K}/>
    <rect x="-50" y="-140" width="12" height="140" fill="#6d4c41" ${K}/><rect x="38" y="-140" width="12" height="140" fill="#6d4c41" ${K}/>
    <rect x="-56" y="-62" width="112" height="16" rx="6" fill="#8d6e63" ${K}/>
    <g class="bob">${torso(-160, -60, 38, 46, '#5c6170')}
      <path d="M-14,-162 L0,-116 L14,-162Z" fill="#fff" ${K3}/><path d="M0,-160 L-7,-148 L0,-118 L7,-148Z" fill="#1565c0" ${K3}/>
      <path d="M-50,-140 Q0,-128 50,-140 M-52,-110 Q0,-98 52,-110 M-50,-82 Q0,-70 50,-82" fill="none" stroke="#d7b46a" stroke-width="8"/>
      <g transform="translate(0,-202)">${ART.udderHead()}</g></g>`;

  /* ---------------- Walrus waiter ---------------- */
  ART.walrus = () => `<g class="bob">
    ${legs(56, 22, 6, '#222', '#111')}
    ${arm(-44, -160, 60, '#7b5a44', '#7b5a44', false, 18)}
    <path d="M-50,-170 Q-70,-100 -56,-50 L56,-50 Q70,-100 50,-170 Q0,-190 -50,-170Z" fill="#7b5a44" ${K}/>
    <path d="M-36,-150 L36,-150 L42,-56 L-42,-56Z" fill="#fff" ${K}/>
    <path d="M0,-172 L-14,-182 L-14,-162Z M0,-172 L14,-182 L14,-162Z" fill="${INK}"/>
    ${arm(46, -160, 60, '#7b5a44', '#7b5a44', true, -14)}
    <g transform="translate(0,-212)">
      <ellipse cx="0" cy="0" rx="58" ry="50" fill="#7b5a44" ${K}/>
      <g class="blink"><circle cx="-6" cy="-18" r="6" fill="${INK}"/><circle cx="26" cy="-18" r="6" fill="${INK}"/></g>
      <ellipse cx="12" cy="-2" rx="9" ry="6" fill="${INK}"/>
      <g class="mouth"><path class="m-closed" d="M-6,10 L-8,62 L4,62 L4,14Z M22,14 L22,62 L34,62 L30,10Z" fill="#fffbe8" ${K3}/>
        <path class="m-open" d="M-6,10 L-10,66 L2,66 L4,14Z M22,14 L24,66 L36,66 L30,10Z" fill="#fffbe8" ${K3}/></g>
      <path d="M-30,2 Q-20,30 12,10 Q44,30 54,2 Q40,-8 12,4 Q-16,-8 -30,2Z" fill="#4e342e" ${K}/></g></g>`;

  /* ---------------- Flower-cart sheep ---------------- */
  const wool = (cx, cy, r, n) => { let s = ''; for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; s += `<circle cx="${(cx + Math.cos(a) * r).toFixed(1)}" cy="${(cy + Math.sin(a) * r).toFixed(1)}" r="${(r * 0.55).toFixed(1)}" fill="#fff" ${K3}/>`; } return s + `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff"/>`; };
  ART.sheep = () => `<g class="bob">
    ${legs(52, 12, 8, '#2b2b2b', '#2b2b2b')}
    ${arm(-34, -140, 48, '#fff', '#2b2b2b', false, 18)}
    <path d="M-40,-150 Q-56,-90 -50,-46 L50,-46 Q56,-90 40,-150 Q0,-164 -40,-150Z" fill="#4fc3f7" ${K}/>
    <path d="M-30,-100 L30,-100 L36,-46 L-36,-46Z" fill="#fff" ${K3}/>
    ${wool(0, -150, 30, 9)}
    ${arm(36, -140, 48, '#fff', '#2b2b2b', true, -12)}
    <g transform="translate(6,-200)">
      ${wool(-8, -12, 34, 10)}
      <ellipse cx="14" cy="4" rx="26" ry="32" fill="#2b2b2b" ${K}/>
      <path d="M-14,-40 Q14,-60 40,-30 L44,-10 Q14,-34 -16,-14Z" fill="#e8324a" ${K}/><circle cx="6" cy="-34" r="3" fill="#fff"/><circle cx="24" cy="-30" r="3" fill="#fff"/>
      <g class="blink">${eye(6, -4, 8, 10, 10, -2, 4)}${eye(28, -4, 8, 10, 32, -2, 4)}</g>
      ${mouth('M10,24 Q20,30 30,22', 'M10,22 Q20,38 30,20Z', '#e57373')}</g></g>`;

  /* ---------------- Pelican fisherman ---------------- */
  ART.pelican = () => `<g class="bob">
    ${legs(50, 10, 8, '#ffa726', '#ffa726')}
    ${arm(-34, -150, 54, '#fdd835', '#fff', false, 18)}
    <path d="M-40,-160 Q-58,-90 -50,-44 L50,-44 Q58,-90 40,-160 Q0,-176 -40,-160Z" fill="#fdd835" ${K}/>
    <path d="M0,-158 L0,-50" stroke="#c6a700" stroke-width="4"/><circle cx="10" cy="-130" r="4" fill="${INK}"/><circle cx="10" cy="-100" r="4" fill="${INK}"/>
    ${arm(34, -150, 54, '#fdd835', '#fff', true, -18)}
    <g transform="translate(0,-200)">
      <ellipse cx="-2" cy="0" rx="30" ry="34" fill="#fff" ${K}/>
      <g class="mouth"><path class="m-closed" d="M14,-6 L104,6 L20,12Z" fill="#ffb74d" ${K}/>
        <path class="m-open" d="M14,-6 L104,0 L20,6Z" fill="#ffb74d" ${K}/></g>
      <path d="M20,12 Q60,48 98,8 L20,10Z" fill="#ff8a65" ${K}/>
      <g class="blink">${eye(4, -8, 8, 9, 8, -6, 4)}</g>
      <path d="M-44,-18 Q-4,-60 40,-18 L50,-10 L-54,-10Z" fill="#fdd835" ${K}/></g></g>`;

  /* ---------------- Bulldog doorman ---------------- */
  ART.bulldog = () => `<g class="bob">
    ${legs(70, 26, 6, '#1d1d1d', '#000')}
    ${arm(-56, -176, 70, '#1d1d1d', '#d9a36a', false, 16)}
    <path d="M-60,-190 Q-76,-120 -62,-66 L62,-66 Q76,-120 60,-190 Q0,-206 -60,-190Z" fill="#1d1d1d" ${K}/>
    <path d="M-14,-190 L0,-150 L14,-190Z" fill="#fff" ${K3}/><path d="M0,-188 L-6,-176 L0,-152 L6,-176Z" fill="#000"/>
    ${arm(58, -176, 70, '#1d1d1d', '#d9a36a', true, -12)}
    <g transform="translate(0,-232)">
      <path d="M-56,-30 L-74,6 L-46,0Z M48,-34 L70,0 L44,-2Z" fill="#a8743f" ${K}/>
      <path d="M-54,-10 C-58,-50 54,-54 52,-10 C60,30 30,46 0,46 C-30,46 -60,30 -54,-10Z" fill="#d9a36a" ${K}/>
      <rect x="-38" y="-24" width="30" height="18" rx="6" fill="#111"/><rect x="2" y="-24" width="30" height="18" rx="6" fill="#111"/><path d="M-8,-18 L2,-18" stroke="#111" stroke-width="5"/>
      <ellipse cx="0" cy="6" rx="12" ry="8" fill="${INK}"/>
      <path d="M-34,18 Q0,8 34,18 Q34,42 0,42 Q-34,42 -34,18Z" fill="#c48b52" ${K}/>
      <g class="mouth"><path class="m-closed" d="M-22,20 L-18,10 L-14,20 M14,20 L18,10 L22,20" fill="#fff" ${K3}/><path class="m-open" d="M-24,22 Q0,48 24,22Z" fill="#7a1a2a" ${K3}/></g>
      <path d="M46,-6 Q60,10 54,30" fill="none" stroke="#9e9e9e" stroke-width="4"/></g></g>`;

  /* ---------------- Newspaper readers (seated, café) ---------------- */
  const paper = (upside) => `
    <g transform="translate(0,-110)">
      <rect x="-80" y="-60" width="160" height="110" fill="#f3efe2" ${K}/>
      <path d="M0,-60 L0,50" stroke="#c9c2ad" stroke-width="3"/>
      <g ${upside ? 'transform="rotate(180 0 -5)"' : ''}>
        <text x="-72" y="-36" font-family="Georgia, serif" font-weight="700" font-size="17" fill="${INK}">ACIDOPHILUS TIMES</text>
        <rect x="-72" y="-28" width="64" height="34" fill="#b9b2a0"/>
        <path d="M6,-24 L70,-24 M6,-14 L70,-14 M6,-4 L60,-4 M-72,16 L-8,16 M-72,26 L-8,26 M-72,36 L-20,36 M6,16 L70,16 M6,26 L70,26 M6,36 L50,36" stroke="#8f8878" stroke-width="4"/>
      </g></g>
    <circle cx="-82" cy="-106" r="12" fill="var(--hand)" ${K}/><circle cx="82" cy="-106" r="12" fill="var(--hand)" ${K}/>`;
  ART.hippo = () => `<g style="--hand:#9575cd"><g class="bob"><g transform="translate(0,-200)">
      <circle cx="-30" cy="-34" r="12" fill="#9575cd" ${K}/><circle cx="30" cy="-34" r="12" fill="#9575cd" ${K}/>
      <ellipse cx="0" cy="0" rx="50" ry="40" fill="#9575cd" ${K}/>
      <g class="blink"><circle cx="-16" cy="-6" r="6" fill="${INK}"/><circle cx="16" cy="-6" r="6" fill="${INK}"/></g>
      <g class="mouth"><path class="m-closed" d="M-10,24 L10,24" ${K}/><path class="m-open" d="M-10,22 Q0,34 10,22Z" fill="#7a1a2a" ${K3}/></g></g>
    ${paper(false)}</g></g>`;
  ART.turtle = () => `<g style="--hand:#81c784"><g class="bob"><g transform="translate(0,-196)">
      <ellipse cx="0" cy="0" rx="34" ry="36" fill="#81c784" ${K}/>
      <g class="blink">${eye(-12, -6, 8, 8, -10, -4, 4)}${eye(12, -6, 8, 8, 14, -4, 4)}</g>
      <circle cx="-12" cy="-6" r="12" fill="none" stroke="${INK}" stroke-width="3"/><circle cx="12" cy="-6" r="12" fill="none" stroke="${INK}" stroke-width="3"/>
      <path d="M-24,-26 Q0,-52 24,-26 Z" fill="#7e57c2" ${K3}/>
      <g class="mouth"><path class="m-closed" d="M-8,18 Q0,22 8,18" fill="none" ${K}/><path class="m-open" d="M-8,16 Q0,30 8,16Z" fill="#7a1a2a" ${K3}/></g></g>
    ${paper(false)}</g></g>`;
  ART.agent = () => `<g style="--hand:#4caf50"><g class="bob"><g transform="translate(0,-196)">
      <path d="M-30,-20 Q-10,-56 30,-30 L36,-10Z" fill="#43a047" ${K}/>
      <ellipse cx="0" cy="0" rx="40" ry="32" fill="#66bb6a" ${K}/>
      <circle cx="-14" cy="-10" r="14" fill="#43a047" ${K}/><circle cx="18" cy="-10" r="14" fill="#43a047" ${K}/>
      <g class="blink"><circle cx="-10" cy="-10" r="6" fill="${INK}"/><circle cx="22" cy="-12" r="6" fill="${INK}"/></g>
      <path d="M-30,14 Q0,4 30,12" fill="none" stroke="#2e7d32" stroke-width="4"/>
      <g class="mouth"><path class="m-closed" d="M-14,18 Q0,24 16,16" fill="none" ${K}/><path class="m-open" d="M-14,16 Q0,30 16,14Z" fill="#7a1a2a" ${K3}/></g>
      <path d="M-46,-10 L-30,-34 L-24,-6Z" fill="#212121" ${K3}/></g>
    ${paper(true)}</g></g>`;

  /* ---------------- Sleepy goat guard ---------------- */
  ART.guard = () => `<g class="bob">
    <ellipse cx="0" cy="-30" rx="60" ry="34" fill="#6d6d5a" ${K}/>
    <path d="M-50,-10 L-70,0 M50,-10 L70,0" ${K}/>
    <g transform="translate(-10,-90)">
      <path d="M-34,-10 C-36,-40 30,-44 44,-10 C52,10 30,24 0,24 C-24,24 -34,12 -34,-10Z" fill="${GOAT}" ${K}/>
      <path d="M-26,-26 Q-30,-50 -14,-56 Q-16,-40 -10,-30Z" fill="#9c7a52" ${K3}/>
      <path d="M-2,-6 Q6,0 14,-6 M20,-6 Q28,0 36,-6" fill="none" ${K}/>
      <path d="M8,24 Q10,46 2,54 Q0,40 -4,26Z" fill="${GOAT_D}" ${K3}/>
      <g class="mouth"><path class="m-closed" d="M24,12 Q32,16 40,10" fill="none" ${K3}/><path class="m-open" d="M24,10 Q32,24 40,8Z" fill="#7a1a2a" ${K3}/></g>
      <path d="M-40,-14 Q0,-58 44,-14Z" fill="#78909c" ${K}/><path d="M0,-44 L0,-58" ${K}/></g></g>`;

  /* ---------------- Seagull ---------------- */
  ART.gull = () => `<g class="bob">
    <path d="M-6,0 L-6,-14 M6,0 L6,-14" stroke="#ffa726" stroke-width="4"/>
    <ellipse cx="0" cy="-30" rx="26" ry="18" fill="#fff" ${K}/>
    <path d="M-20,-34 Q-6,-20 18,-30 Q0,-44 -20,-34Z" fill="#b0bec5" ${K3}/>
    <circle cx="16" cy="-52" r="14" fill="#fff" ${K}/><circle cx="20" cy="-56" r="3" fill="${INK}"/>
    <path d="M28,-54 L46,-50 L28,-46Z" fill="#ffca28" ${K3}/></g>`;

  /* ---------------- Item icons (viewBox 0 0 100 100) ---------------- */
  SF.icons = {
    gum: `<g transform="rotate(-12 50 50)"><rect x="14" y="30" width="72" height="40" rx="6" fill="#ff7eb6" ${K}/><rect x="14" y="42" width="72" height="16" fill="#fff" ${K3}/><text x="50" y="55" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="12" fill="#e8324a">SPY GUM</text></g>`,
    lipstick: `<g transform="rotate(30 50 50)"><rect x="36" y="46" width="28" height="44" rx="4" fill="#ffc93c" ${K}/><rect x="40" y="26" width="20" height="24" fill="#e8324a" ${K}/><path d="M40,26 L40,16 L60,8 L60,26Z" fill="#ff5c73" ${K}/></g><path d="M78 10 L94 4 M80 22 L96 22" stroke="#ff3d5a" stroke-width="4" stroke-linecap="round"/>`,
    mist: `<rect x="44" y="10" width="12" height="16" fill="#9e9e9e" ${K}/><path d="M56,14 L72,10" ${K}/><path d="M28,34 Q28,24 50,24 Q72,24 72,34 L76,84 Q76,92 50,92 Q24,92 24,84Z" fill="#7fe3ff" ${K}/><path d="M34,44 L34,80" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".7"/><circle cx="82" cy="12" r="4" fill="#7fe3ff"/><circle cx="90" cy="22" r="3" fill="#7fe3ff"/>`,
    cappuccino: `<path d="M20,40 L80,40 L72,86 Q70,92 50,92 Q30,92 28,86Z" fill="#fff" ${K}/><ellipse cx="50" cy="40" rx="30" ry="8" fill="#c8a27a" ${K3}/><path d="M80,50 Q96,52 92,64 Q88,74 76,70" fill="none" ${K}/><path d="M40,30 Q36,20 42,12 M58,30 Q54,20 60,12" fill="none" stroke="#bbb" stroke-width="4" stroke-linecap="round"/>`,
    carnation: `<path d="M50,50 Q46,74 52,96" stroke="#43a047" stroke-width="6" fill="none"/><path d="M50,74 Q30,64 26,74 Q40,80 50,78Z" fill="#43a047" ${K3}/><g fill="#e8324a" ${K3}><circle cx="50" cy="30" r="14"/><circle cx="36" cy="40" r="12"/><circle cx="64" cy="40" r="12"/><circle cx="50" cy="46" r="12"/><circle cx="50" cy="34" r="8" fill="#ff5c73"/></g>`,
    membership: `<rect x="10" y="24" width="80" height="52" rx="8" fill="#ffc93c" ${K}/><path d="M10,40 L90,40" stroke="${INK}" stroke-width="6"/><text x="50" y="66" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="12" fill="${INK}">HIGH ROLLER</text>`,
    keycard: `<rect x="12" y="20" width="76" height="60" rx="8" fill="#5c6bc0" ${K}/><rect x="20" y="30" width="20" height="14" rx="3" fill="#ffc93c" ${K3}/><path d="M56,40 Q70,24 80,40 Q76,58 66,60 Q60,58 56,40Z" fill="#fff"/><path d="M58,34 Q50,22 54,16 M78,34 Q86,22 82,16" fill="none" stroke="#fff" stroke-width="4"/><path d="M20,66 L80,66" stroke="#fff" stroke-width="5"/>`,
  };

  // Generic card art for Go Fish ranks (viewBox 0 0 100 140)
  const fish = (body, fin, extra = '') => `<g transform="translate(50 74)">${extra}<path d="M-30,0 Q-6,-26 24,-4 L40,-18 L36,0 L40,18 L24,4 Q-6,26 -30,0Z" fill="${body}" ${K3}/><path d="M-4,-14 L6,-24 L12,-10Z" fill="${fin}" ${K3}/><circle cx="-18" cy="-4" r="4" fill="${INK}"/></g>`;
  SF.cardArt = [
    { name: 'Sardine', svg: fish('#90a4ae', '#607d8b') },
    { name: 'Clownfish', svg: fish('#ff9800', '#fff', '') + `<path d="M44,62 L44,86 M56,62 L56,86" stroke="#fff" stroke-width="6"/>` },
    { name: 'Pufferfish', svg: `<g transform="translate(50 74)"><circle r="28" fill="#ffd54f" ${K3}/><path d="M-28,-10 L-38,-14 M-24,-22 L-30,-32 M0,-28 L0,-40 M24,-22 L30,-32 M28,-10 L38,-14 M28,12 L38,16 M0,28 L0,40 M-28,12 L-38,16" ${K3}/><circle cx="-10" cy="-6" r="5" fill="${INK}"/><circle cx="10" cy="-6" r="5" fill="${INK}"/><ellipse cx="0" cy="12" rx="6" ry="4" fill="#e57373" ${K3}/></g>` },
    { name: 'Swordfish', svg: fish('#1e88e5', '#0d47a1', `<path d="M-30,0 L-46,-4 L-30,-4Z" fill="#90caf9" ${K3}/>`) },
    { name: 'Octopus', svg: `<g transform="translate(50 70)"><path d="M-26,0 Q-26,-34 0,-34 Q26,-34 26,0 L30,30 L18,10 L12,32 L4,12 L-4,32 L-10,12 L-18,32 L-22,10 L-30,30Z" fill="#ba68c8" ${K3}/><circle cx="-9" cy="-10" r="5" fill="${INK}"/><circle cx="9" cy="-10" r="5" fill="${INK}"/></g>` },
    { name: 'Crab', svg: `<g transform="translate(50 76)"><ellipse rx="28" ry="18" fill="#e53935" ${K3}/><path d="M-26,-6 L-38,-24 M26,-6 L38,-24" ${K3}/><circle cx="-38" cy="-28" r="8" fill="#e53935" ${K3}/><circle cx="38" cy="-28" r="8" fill="#e53935" ${K3}/><path d="M-20,14 L-30,26 M-8,16 L-12,30 M8,16 L12,30 M20,14 L30,26" ${K3}/><circle cx="-8" cy="-22" r="5" fill="#fff" ${K3}/><circle cx="8" cy="-22" r="5" fill="#fff" ${K3}/></g>` },
    { name: 'Shark', svg: fish('#78909c', '#546e7a', '') + `<path d="M52,48 L62,32 L66,52Z" fill="#78909c" ${K3}/><path d="M26,78 L34,76 L30,82Z" fill="#fff"/>` },
  ];
})(window.SF);
