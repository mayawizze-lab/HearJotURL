// HearJot mascot "เฮียจด" — FULL-BODY deterministic VIDEO RIG for HyperFrames (GSAP seek-safe).
// Production copy of the body-explore-1 study (owner picked B2 on 2026-10-17; B4 kept as an alternate outfit).
// The head, face, K1a hair, hood, ears, hands/props and FX are the half-body rig's own art, unchanged, at the
// same coordinates (y 0..200), so every POSE and prop of hearjot-mascot-rig.js works here the same way.
// Below that it adds a hoodie hem, pants and legs. Pure function of state: no rAF, clocks, random or CSS animation.
//
// USE (in the EP host index.html, next to the half-body rig; both can be loaded together)
//   <script>window.HEARJOT_RIG_NO_FONTFACE = true;<\/script>
//   <script src="assets/mascot/hearjot-mascot-fullbody.js"><\/script>
//   <div id="hero" style="width:400px;height:600px"></div>          // viewBox is 200x300: keep the box 2:3
//   const rig = HearJotRigFull.mount(el, Object.assign({}, HearJotRigFull.POSES.wave, { outfit: 'b4' }));
//   tl.to(rig, { hop: 1, duration: .75, ease: 'none' }, 2);          // one hop: crouch, air, landing squash
//   tl.to(rig, { keyframes: { footTap: [0, 1, 0, 1, 0] }, duration: 1 }, 3);
//
// OUTFITS   outfit: 'b2' (default) crop hoodie + grey joggers + white high-tops
//                   'b4'           rounded-hem hoodie + rolled denim shorts + bear slippers
//           OUTFITS.b2 / OUTFITS.b4 also carry each outfit's standing stance (b2 crossed ankles, b4 feet apart).
// WHOLE BODY  bodyY (hop offset, up = negative), squash (pivots at the ground, so feet stay planted), lean, armSwing.
// LEGS      stance (deg each leg turns out), cross 0..1 (left ankle behind the right; auto-uncrosses in the air),
//           step -1..1 (lift left/right foot), legSwing (deg, both legs), hop (cycles; integers = standing),
//           hopHeight (units), footTap 0..1 (right toe up; the shoe pivots at its heel on the ground and the leg bends to stay attached), kick 0..1 (left foot flicked up), shadow 0..1.
// Ground line: y 289 of 300. The ground shadow stays on the floor and shrinks while he is in the air.
// Globals are separate from the half-body rig: window.HearJotRigFull, <hearjot-rig-full>, CSS classes .hjrf*.
(() => {
  if (window.HearJotRigFull) return;
  const INK = '#2B2440', HOOD = '#3E4766', LINE = '#56608A', HAIR = '#2E2838', SKIN = '#FFE7D6', BLUE = '#3A5BE0';
  const EARIN = '#D9A088', CHEEK = '#FF9DB0', MOUTH = '#E8707E', TONGUE = '#FFB3BF', PENCIL = '#FFC94A';
  const WATER = '#8EC5FF', RED = '#E5484D', METAL = '#B8BCCB';
  const SCRIPT_SRC = document.currentScript && document.currentScript.src;

  const SMILE = 'M92 123 Q100 123 108 123 Q107 134 100 134 Q93 134 92 123Z';
  const OPEN = 'M90 121 Q100 121 110 121 Q109 138 100 138 Q91 138 90 121Z';
  const EAR = 'M56 101 C50 97 43 99 42 107 C41 113 43 118 45 121 C47 125 51 127 55 124 Z';
  const EAR_R = 'M144 101 C150 97 157 99 158 107 C159 113 157 118 155 121 C153 125 149 127 145 124 Z';
  const STAR = 'M0 -10 Q1.6 -1.6 10 0 Q1.6 1.6 0 10 Q-1.6 1.6 -10 0 Q-1.6 -1.6 0 -10Z';

  // ---- drawing helpers (same hand: flat fill, dark ink outline) ----
  const sleeve = d => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="17" stroke-linecap="round"/>` +
                      `<path d="${d}" fill="none" stroke="${HOOD}" stroke-width="10.5" stroke-linecap="round"/>`;
  const hand = (x, y, r = 7) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${SKIN}" stroke="${INK}" stroke-width="3.5"/>`;
  const tube = (d, fill, w = 9, inner = 5) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w}" stroke-linecap="round"/>` +
                      `<path d="${d}" fill="none" stroke="${fill}" stroke-width="${inner}" stroke-linecap="round"/>`;
  const v = (group, name, body, extra = '') => `<g data-v="${group}:${name}" ${extra}>${body}</g>`;

  const NOTEPAD = `
    <g transform="rotate(-6 102 180)">
      <rect x="84" y="167" width="36" height="27" rx="4" fill="#fff" stroke="${INK}" stroke-width="3.5"/>
      <path d="M90 176 H114 M90 182 H108" stroke="#C3D1FF" stroke-width="2.5" stroke-linecap="round"/>
      <path data-r="scribble" d="M90 188 q3 -4 6 0 t6 0 t6 0" fill="none" stroke="${BLUE}" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="40" stroke-dashoffset="40"/>
    </g>`;
  const PENCIL_HAND = `
    <g data-r="pencil">
      <path d="M134 162 L120 184" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>
      <path d="M134 162 L120 184" stroke="${PENCIL}" stroke-width="5" stroke-linecap="round"/>
      <path d="M120 184 L117 189" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      ${hand(127, 177)}
    </g>`;
  // notepad held low in the left hand (used when the right hand does something else)
  const NOTEPAD_LEFT = `<g transform="translate(-24 5)">${NOTEPAD.replace('data-r="scribble"', '')}${hand(84, 185)}</g>`;

  const PROPS = [
    v('hands', 'notepad', `${NOTEPAD}${hand(84, 185)}${PENCIL_HAND}`),
    v('hands', 'phone', `
      <g transform="rotate(-6 101 178)">
        <rect x="88" y="152" width="26" height="44" rx="6" fill="${INK}"/>
        <rect x="91.5" y="157" width="19" height="33" rx="2.5" fill="#EEF2FF"/>
        <circle data-r="recdot" cx="101" cy="166" r="4" fill="#EF4444"/>
        <path d="M94.5 180 v3 M97.5 178 v7 M100.5 176 v11 M103.5 178.5 v6 M106.5 180 v3" stroke="${BLUE}" stroke-width="2" stroke-linecap="round"/>
      </g>
      ${hand(88, 184)}${hand(115, 182)}`),
    v('hands', 'texting', `
      <g transform="rotate(-4 101 172)">
        <rect x="87" y="146" width="28" height="46" rx="6" fill="${INK}"/>
        <rect x="90.5" y="151" width="21" height="35" rx="2.5" fill="#EEF2FF"/>
        <rect x="99" y="155" width="10" height="4.5" rx="2.2" fill="${BLUE}"/>
        <rect x="93" y="162" width="9" height="4.5" rx="2.2" fill="#fff" stroke="#C3D1FF" stroke-width="1"/>
        <rect x="97" y="169" width="12" height="4.5" rx="2.2" fill="${BLUE}"/>
      </g>
      <g data-r="thumbs">${hand(89, 176, 6.5)}${hand(113, 174, 6.5)}</g>`),
    v('hands', 'mug', `
      <g data-r="steam" fill="none" stroke="#DDE4F5" stroke-width="2.6" stroke-linecap="round">
        <path d="M95 156 q-3 -3.5 0 -7 t0 -7"/><path d="M104 156 q3 -3.5 0 -7 t0 -7"/>
      </g>
      <path d="M111 167 q11 0 11 9 t-11 9" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
      <path d="M111 167 q11 0 11 9 t-11 9" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M86 160 H114 V186 Q114 194 106 194 H94 Q86 194 86 186Z" fill="#fff" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
      <rect x="87.8" y="172" width="24.4" height="7" fill="${BLUE}"/>
      <ellipse cx="100" cy="160" rx="14" ry="3.6" fill="#7A4E2D" stroke="${INK}" stroke-width="3"/>
      ${hand(86, 184)}${hand(121, 181, 6.5)}`),
    v('hands', 'magnifier', `
      ${NOTEPAD_LEFT}
      ${sleeve('M145 176 Q166 180 164 160')}
      ${tube('M164 158 L156 138', '#8A5A3B', 10, 5.5)}
      <circle cx="148" cy="122" r="17" fill="#DCEBFF" fill-opacity=".55" stroke="${INK}" stroke-width="8"/>
      <circle cx="148" cy="122" r="17" fill="none" stroke="${PENCIL}" stroke-width="3.6"/>
      <path d="M139 116 Q141 110 147 109" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>
      ${hand(164, 160, 7.5)}`),
    v('hands', 'thumbsup', `
      ${NOTEPAD_LEFT}
      ${sleeve('M145 177 Q158 184 164 176')}
      <g data-r="armR" data-pivot="164 176">
        ${sleeve('M164 176 L163 166')}
        <rect x="155" y="139" width="8" height="18" rx="4" fill="${SKIN}" stroke="${INK}" stroke-width="3.2"/>
        <rect x="155" y="151" width="20" height="16" rx="6" fill="${SKIN}" stroke="${INK}" stroke-width="3.5"/>
        <path d="M167 156 H174 M167 161.5 H174" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
      </g>`),
    v('hands', 'point', `
      ${NOTEPAD_LEFT}
      ${sleeve('M145 177 Q158 184 165 176')}
      <g data-r="armR" data-pivot="165 176">
        ${sleeve('M165 176 L170 163')}
        ${tube('M175 152 L183 138', SKIN, 9, 4.6)}
        ${hand(172, 157, 7.5)}
      </g>`),
    v('hands', 'wave', `
      ${NOTEPAD_LEFT}
      ${sleeve('M145 177 Q160 184 167 174')}
      <g data-r="armR" data-pivot="167 174">
        ${sleeve('M167 174 L171 156')}
        <ellipse cx="164" cy="150" rx="4.2" ry="6.5" transform="rotate(-35 164 150)" fill="${SKIN}" stroke="${INK}" stroke-width="3"/>
        <ellipse cx="174" cy="143" rx="10" ry="12" fill="${SKIN}" stroke="${INK}" stroke-width="3.5"/>
        <path d="M170 132.5 v5 M175 132 v5.5 M179.5 134 v4.5" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
      </g>
      <g data-r="wavelines" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round">
        <path d="M189 134 q4 6 0 12"/><path d="M195 130 q6 10 0 20"/>
      </g>`),
    v('hands', 'shrug', `
      ${sleeve('M56 178 Q40 188 33 178')}${sleeve('M144 178 Q160 188 167 178')}
      <ellipse cx="29" cy="171" rx="11" ry="6.5" transform="rotate(-25 29 171)" fill="${SKIN}" stroke="${INK}" stroke-width="3.5"/>
      <ellipse cx="171" cy="171" rx="11" ry="6.5" transform="rotate(25 171 171)" fill="${SKIN}" stroke="${INK}" stroke-width="3.5"/>`),
    // hands that touch the face: sleeve here, the hand itself is in the head-front layer
    v('hands', 'cheeks', `${sleeve('M57 178 Q40 168 51 144')}${sleeve('M143 178 Q160 168 149 144')}`),
    v('hands', 'facepalm', `${NOTEPAD_LEFT}${sleeve('M145 177 Q166 160 133 124')}`),
    // both hands pressed on the tummy
    v('hands', 'belly', `${sleeve('M60 200 Q66 184 84 186')}${sleeve('M140 200 Q134 184 116 186')}
      <ellipse cx="88" cy="186" rx="9" ry="7" transform="rotate(-15 88 186)" fill="${SKIN}" stroke="${INK}" stroke-width="3.5"/>
      <ellipse cx="112" cy="186" rx="9" ry="7" transform="rotate(15 112 186)" fill="${SKIN}" stroke="${INK}" stroke-width="3.5"/>
      <path d="M84 182 l3 4 M89 181 l3 4 M116 182 l-3 4 M111 181 l-3 4" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>`),
    // right hand raised high (asking a question), notepad low in the left
    v('hands', 'raise', `
      ${NOTEPAD_LEFT}
      ${sleeve('M145 176 Q162 180 170 166')}
      <g data-r="armR" data-pivot="170 166">
        ${sleeve('M170 166 L176 132')}
        <ellipse cx="177" cy="118" rx="10" ry="13" fill="${SKIN}" stroke="${INK}" stroke-width="3.5"/>
        <path d="M172 107 v5 M177 106 v6 M182 107 v5" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
        <ellipse cx="167" cy="124" rx="4.2" ry="6.5" transform="rotate(-30 167 124)" fill="${SKIN}" stroke="${INK}" stroke-width="3"/>
      </g>`),
    v('hands', 'none', ''),
  ].join('');

  const HEAD_FRONT = [
    v('hands', 'cheeks', `
      <ellipse cx="57" cy="128" rx="10.5" ry="13.5" transform="rotate(14 57 128)" fill="${SKIN}" stroke="${INK}" stroke-width="3.5"/>
      <ellipse cx="143" cy="128" rx="10.5" ry="13.5" transform="rotate(-14 143 128)" fill="${SKIN}" stroke="${INK}" stroke-width="3.5"/>
      <path d="M60 119 l4 -2 M61.5 125 l4.5 -1.5 M140 119 l-4 -2 M138.5 125 l-4.5 -1.5" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`),
    v('hands', 'facepalm', `
      <g transform="rotate(-18 114 108)">
        <ellipse cx="114" cy="108" rx="19" ry="14" fill="${SKIN}" stroke="${INK}" stroke-width="3.5"/>
        <path d="M100 102 h10 M98 108 h12 M100 114 h10" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
      </g>`),
  ].join('');

  const EYES = [
    v('eyes', 'normal', `<g data-r="pupils">
        <ellipse cx="82" cy="113" rx="6.5" ry="8" fill="${INK}"/><ellipse cx="118" cy="113" rx="6.5" ry="8" fill="${INK}"/>
        <circle cx="84.5" cy="110" r="2.8" fill="#fff"/><circle cx="120.5" cy="110" r="2.8" fill="#fff"/></g>`),
    v('eyes', 'happy', `<path d="M75 115 Q82 106 89 115 M111 115 Q118 106 125 115" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`),
    v('eyes', 'wide', `
      <ellipse cx="82" cy="112" rx="9" ry="11" fill="#fff" stroke="${INK}" stroke-width="3.4"/>
      <ellipse cx="118" cy="112" rx="9" ry="11" fill="#fff" stroke="${INK}" stroke-width="3.4"/>
      <g data-r="pupils"><circle cx="82" cy="113" r="3.6" fill="${INK}"/><circle cx="118" cy="113" r="3.6" fill="${INK}"/></g>`),
    v('eyes', 'tired', `<g data-r="pupils">
        <ellipse cx="82" cy="114" rx="6.5" ry="7.5" fill="${INK}"/><ellipse cx="118" cy="114" rx="6.5" ry="7.5" fill="${INK}"/>
        <circle cx="84" cy="114" r="2" fill="#fff"/><circle cx="120" cy="114" r="2" fill="#fff"/></g>
      <path d="M71 101 H93 V111 Q82 113.5 71 111Z M107 101 H129 V111 Q118 113.5 107 111Z" fill="${SKIN}"/>
      <path d="M73.5 111 Q82 113.5 90.5 111 M109.5 111 Q118 113.5 126.5 111" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>
      <path d="M76.5 123.5 Q82 126 87.5 123.5 M112.5 123.5 Q118 126 123.5 123.5" fill="none" stroke="#A98FB0" stroke-width="2" stroke-linecap="round"/>`),
    v('eyes', 'teary', `<g data-r="pupils">
        <ellipse cx="82" cy="113" rx="7.2" ry="9" fill="${INK}"/><ellipse cx="118" cy="113" rx="7.2" ry="9" fill="${INK}"/>
        <circle cx="85" cy="109.5" r="3.2" fill="#fff"/><circle cx="121" cy="109.5" r="3.2" fill="#fff"/>
        <circle cx="79" cy="117" r="1.7" fill="#fff"/><circle cx="115" cy="117" r="1.7" fill="#fff"/></g>
      <path d="M74 118.5 Q82 125 90 118.5 M110 118.5 Q118 125 126 118.5" fill="none" stroke="${WATER}" stroke-width="3" stroke-linecap="round"/>`),
    v('eyes', 'sparkle', `<g data-r="pupils">
        <ellipse cx="82" cy="113" rx="7.4" ry="9" fill="${INK}"/><ellipse cx="118" cy="113" rx="7.4" ry="9" fill="${INK}"/>
        <path d="${STAR}" transform="translate(84.5 110) scale(.5)" fill="#fff"/><path d="${STAR}" transform="translate(120.5 110) scale(.5)" fill="#fff"/>
        <circle cx="79" cy="117.5" r="1.6" fill="#fff"/><circle cx="115" cy="117.5" r="1.6" fill="#fff"/></g>`),
    v('eyes', 'side', `<g data-r="pupils">
        <ellipse cx="85" cy="114" rx="6" ry="7" fill="${INK}"/><ellipse cx="121" cy="114" rx="6" ry="7" fill="${INK}"/>
        <circle cx="87" cy="114" r="1.8" fill="#fff"/><circle cx="123" cy="114" r="1.8" fill="#fff"/></g>
      <path d="M71 101 H93 V110 H71Z M107 101 H129 V110 H107Z" fill="${SKIN}"/>
      <path d="M73.5 110 H90.5 M109.5 110 H126.5" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>`),
    v('eyes', 'roll', `
      <ellipse cx="82" cy="113" rx="8" ry="10" fill="#fff" stroke="${INK}" stroke-width="3.2"/>
      <ellipse cx="118" cy="113" rx="8" ry="10" fill="#fff" stroke="${INK}" stroke-width="3.2"/>
      <circle cx="83" cy="106.5" r="4.4" fill="${INK}"/><circle cx="119" cy="106.5" r="4.4" fill="${INK}"/>`),
    v('eyes', 'closed', `<path d="M75 112 Q82 119 89 112 M111 112 Q118 119 125 112" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`),
    v('eyes', 'spiral', `<path d="M82 113 m0 -1.5 a1.5 1.5 0 1 1 -1.5 1.5 a3.5 3.5 0 1 1 3.5 3.5 a5.5 5.5 0 1 1 -5.5 -5.5 a7.5 7.5 0 1 1 7.5 7.5 M118 113 m0 -1.5 a1.5 1.5 0 1 1 -1.5 1.5 a3.5 3.5 0 1 1 3.5 3.5 a5.5 5.5 0 1 1 -5.5 -5.5 a7.5 7.5 0 1 1 7.5 7.5" fill="none" stroke="${INK}" stroke-width="2.8" stroke-linecap="round"/>`),
    v('eyes', 'wink', `<g data-r="pupils">
        <ellipse cx="82" cy="113" rx="6.5" ry="8" fill="${INK}"/><circle cx="84.5" cy="110" r="2.8" fill="#fff"/></g>
      <path d="M110 114 Q118 105 126 114" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
      <path d="M124.5 110.5 L129 107.5" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`),
    v('eyes', 'squint', `<path d="M76 107.5 L88 113 L76 118.5 M124 107.5 L112 113 L124 118.5" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`),
  ].join('');

  const MOUTHS = {
    smile: `<path d="${SMILE}" fill="${MOUTH}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M95 130 Q100 127 105 130 Q103 133 100 133 Q97 133 95 130Z" fill="${TONGUE}"/>`,
    open: `<path d="${OPEN}" fill="${MOUTH}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M94 133 Q100 129 106 133 Q104 137 100 137 Q96 137 94 133Z" fill="${TONGUE}"/>`,
    flat: `<path d="M93 128 H107" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>`,
    frown: `<path d="M90.5 131 Q93.5 126 97 129 Q100 132 103 129 Q106.5 126 109.5 131" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`,
    o: `<ellipse cx="100" cy="129" rx="5.5" ry="7" fill="${MOUTH}" stroke="${INK}" stroke-width="3"/><ellipse cx="100" cy="132" rx="3" ry="2.4" fill="${TONGUE}"/>`,
    talkA: `<path d="M94.5 124 Q100 124 105.5 124 Q104.5 130.5 100 130.5 Q95.5 130.5 94.5 124Z" fill="${MOUTH}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`,
    talkB: `<path d="M93 122.5 Q100 122 107 122.5 Q106 135 100 135 Q94 135 93 122.5Z" fill="${MOUTH}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M96 131.5 Q100 128.5 104 131.5 Q102.5 134 100 134 Q97.5 134 96 131.5Z" fill="${TONGUE}"/>`,
    talkC: `<path d="M90.5 124.5 Q100 121 109.5 124.5 Q107.5 131.5 100 131.5 Q92.5 131.5 90.5 124.5Z" fill="${MOUTH}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`,
    smirk: `<path d="M92.5 129.5 Q101 132 108.5 125" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/><path d="M107 122.8 Q110 124.2 110.2 127.2" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`,
    yawn: `<ellipse cx="100" cy="130" rx="8" ry="10.5" fill="#8C3A4C" stroke="${INK}" stroke-width="3"/><path d="M94 136 Q100 132 106 136 Q104 139.5 100 139.5 Q96 139.5 94 136Z" fill="${TONGUE}"/>`,
    // clenched teeth (holding on): a white bar of teeth with a gum line and tooth gaps
    clench: `<rect x="87" y="122" width="26" height="12" rx="4" fill="#fff" stroke="${INK}" stroke-width="3"/><path d="M88.5 128 H111.5 M93.5 123 V133 M100 123 V133 M106.5 123 V133" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>`,
    // wobbly mouth (queasy / nervous)
    wobble: `<path d="M89 129 q2.75 -4 5.5 0 t5.5 0 t5.5 0 t5.5 0" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`,
    grin: `<path d="M88 122 Q100 124 112 122 Q110.5 138 100 138 Q89.5 138 88 122Z" fill="${MOUTH}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M90 123.6 Q100 125.6 110 123.6 L109.4 127.4 Q100 129 90.6 127.4Z" fill="#fff"/><path d="M94.5 133.5 Q100 130 105.5 133.5 Q103.5 136.5 100 136.5 Q96.5 136.5 94.5 133.5Z" fill="${TONGUE}"/>`,
  };
  const MOUTH_SVG = Object.keys(MOUTHS).map(k => v('mouth', k, MOUTHS[k])).join('');

  const BROWS = [
    v('brows', 'worried', `<path d="M73 101.5 Q80 101 89 96.5 M127 101.5 Q120 101 111 96.5"/>`),
    v('brows', 'angry', `<path d="M73.5 96.5 L89 102 M126.5 96.5 L111 102"/>`),
    v('brows', 'raised', `<path d="M74 99 Q81.5 93.5 89 97.5 M126 99 Q118.5 93.5 111 97.5"/>`),
    v('brows', 'none', ''),
  ].join('');

  const HEADWEAR = [
    v('headwear', 'headphones', `
      ${tube('M39 108 C33 2 167 2 161 108', BLUE, 11, 5)}
      <ellipse cx="42" cy="114" rx="10" ry="16" fill="${BLUE}" stroke="${INK}" stroke-width="3.6"/>
      <ellipse cx="158" cy="114" rx="10" ry="16" fill="${BLUE}" stroke="${INK}" stroke-width="3.6"/>
      <path d="M38 104 Q36 114 38 124 M162 104 Q164 114 162 124" fill="none" stroke="#7D95F0" stroke-width="2.4" stroke-linecap="round"/>`),
    v('headwear', 'earbuds', `
      ${tube('M47 116 L47 130', '#fff', 7.5, 3.4)}${tube('M153 116 L153 130', '#fff', 7.5, 3.4)}
      <circle cx="47" cy="112" r="5.6" fill="#fff" stroke="${INK}" stroke-width="2.8"/>
      <circle cx="153" cy="112" r="5.6" fill="#fff" stroke="${INK}" stroke-width="2.8"/>`),
    v('headwear', 'none', ''),
  ].join('');

  const zLetter = `<path d="M-5 -5 H5 L-5 5 H5" fill="none" stroke="${INK}" stroke-width="5.6" stroke-linecap="round" stroke-linejoin="round"/>` +
                  `<path d="M-5 -5 H5 L-5 5 H5" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`;
  const cloud = `<g stroke="${INK}" stroke-width="3"><circle cx="-6" cy="2" r="6" fill="#fff"/><circle cx="6" cy="2" r="6" fill="#fff"/><circle cx="0" cy="-4" r="7" fill="#fff"/></g>
                 <circle cx="-6" cy="2" r="4.5" fill="#fff"/><circle cx="6" cy="2" r="4.5" fill="#fff"/><circle cx="0" cy="-4" r="5.5" fill="#fff"/><rect x="-6" y="-2" width="12" height="7" fill="#fff"/>`;
  const FX = `
    <g data-r="fx-sweat"><g data-r="sweatDrop">
      <path d="M0 -10 C4 -4 7 0 7 4 A7 7 0 0 1 -7 4 C-7 0 -4 -4 0 -10Z" fill="${WATER}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M-3 3 Q-3 6 -0.5 7" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></g></g>
    <g data-r="fx-anger"><path d="M-9 -3 Q-3 -3 -3 -9 M3 -9 Q3 -3 9 -3 M9 3 Q3 3 3 9 M-3 9 Q-3 3 -9 3" fill="none" stroke="${RED}" stroke-width="3.6" stroke-linecap="round"/></g>
    <g data-r="fx-zzz"><g data-r="z0">${zLetter}</g><g data-r="z1">${zLetter}</g><g data-r="z2">${zLetter}</g></g>
    <g data-r="fx-question">
      ${tube('M-7 -8 Q-7 -17 1 -17 Q9 -17 9 -9 Q9 -3 1 0 V5', BLUE, 9, 4.6)}
      <circle cx="1" cy="13" r="3.6" fill="${BLUE}" stroke="${INK}" stroke-width="2.4"/></g>
    <g data-r="fx-sparkles">
      ${[0, 1, 2, 3].map(i => `<g data-r="sp${i}"><path d="${STAR}" fill="${PENCIL}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/></g>`).join('')}</g>
    <g data-r="fx-dizzy">${[0, 1, 2].map(i => `<g data-r="dz${i}"><path d="${STAR}" fill="${PENCIL}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/></g>`).join('')}</g>
    <g data-r="fx-steam"><g data-r="st0">${cloud}</g><g data-r="st1">${cloud}</g></g>`;


  // ================= FULL BODY =================
  // The head/props region (y 0..200) is byte-identical to the half-body rig, so every pose still applies.
  // Below it: a hoodie that continues to a hem, and two legs hung from hips at (87|113, 220). Leg art is
  // drawn for the RIGHT leg in local coords (origin = hip, +x = outward, ankle at y 56, sole at y 68);
  // the left leg is the same art mirrored. Ground line G = 289.
  const HIP_Y = 220, HIP_L = 87, HIP_R = 113, G = 289;
  const GREY = '#D3D8E6', GREY_D = '#A3AAC2', DENIM = '#7EA2E6', DENIM_L = '#B9CEF5', SOLE = '#E4E8F2';
  const ol = (w = 3.5) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
  const SHOULDERS = 'M48 200 C48 166 70 150 100 150 C130 150 152 166 152 200';
  const ribs = (x0, x1, y0, y1, step = 8) => { let d = ''; for (let x = x0; x <= x1; x += step) d += `M${x} ${y0} V${y1} `; return `<path d="${d}" stroke="${LINE}" stroke-width="2" stroke-linecap="round"/>`; };

  // --- shoes (local, ankle at 0,56). Each lives in a data-r="foot" group that pivots at the heel. ---
  const SOLE_LOW = `<path d="M-11.5 61 H18.5 Q20 67.5 15 68 H-8 Q-12.5 68 -11.5 62 Z" fill="${SOLE}" ${ol(3.2)}/>`;
  const SHOE = {
    hightop: `
      <path d="M-9.5 41 H8.5 C9 46 10.5 50 15 53.5 C19.5 57 19.5 62.5 15 62.5 H-8 C-11 62.5 -11 60 -10.5 56 Z" fill="#fff" ${ol()}/>
      <rect x="-10.5" y="37" width="20" height="6.5" rx="3" fill="${BLUE}" ${ol(3)}/>
      <path d="M-3 47 l5.5 1.6 M-2.5 51.5 l5.5 1.6" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
      <path d="M9.5 62 Q17 61.5 17.5 57" fill="none" stroke="${LINE}" stroke-width="2" stroke-linecap="round"/>
      ${SOLE_LOW}`,
    bear: `
      <circle cx="-7" cy="48.5" r="6" fill="${HOOD}" ${ol(3)}/><circle cx="10" cy="49.5" r="6" fill="${HOOD}" ${ol(3)}/>
      <circle cx="-7" cy="48.5" r="2.8" fill="${LINE}"/><circle cx="10" cy="49.5" r="2.8" fill="${LINE}"/>
      <path d="M-12 57 C-12 49 -2 46 5 47.5 C13 49 19 54 19 60 C19 65.5 15.5 68 10 68 H-8 C-12 68 -13 64 -12 57 Z" fill="${HOOD}" ${ol()}/>
      <circle cx="1.5" cy="56.5" r="1.6" fill="#fff"/><circle cx="9.5" cy="57" r="1.6" fill="#fff"/>
      <ellipse cx="6" cy="61.5" rx="4.6" ry="3.2" fill="${LINE}"/>
      <ellipse cx="6" cy="60.3" rx="1.7" ry="1.2" fill="${INK}"/>
      <path d="M-11.5 64.5 Q3 66.5 17.5 63.5" fill="none" stroke="${LINE}" stroke-width="2" stroke-linecap="round"/>`,
  };
  // --- foot pose: the shoe turns as one rigid piece about its HEEL on the ground (HEEL, local coords).
  // The pants/leg are not rigid: each leg point is blended between where it is drawn and where the foot frame
  // carries it, by a weight that is 0 at the hidden top of the leg and 1 at the cuff/ankle. So the cuff, the
  // ankle and the shoe collar move together (no gap, no stroke break) and the leg bends to follow.
  const HEEL = [-10, 68], ANKLE = [0, 44];
  const c01 = x => Math.min(1, Math.max(0, x));
  const rn = x => Math.round(x * 100) / 100;
  const rot = (deg, [px, py]) => {
    const r = deg * Math.PI / 180, c = Math.cos(r), sn = Math.sin(r);
    return (x, y) => { const dx = x - px, dy = y - py; return [px + dx * c - dy * sn, py + dx * sn + dy * c]; };
  };
  // foot frame = level the shoe about the ANKLE (cancels the hip angle; the ankle does not move, so the leg needs
  // no bend for it) and then tilt it about the HEEL (tap/step/kick/air; the leg bends to follow)
  const footFrame = (heelDeg, ankleDeg = 0) => { const A = rot(ankleDeg, ANKLE), H = rot(heelDeg, HEEL); return (x, y) => H(...A(x, y)); };
  // points along a straight edge (x0,y0)→(x1,y1), so the bent leg reads as a smooth curve, not a kink
  const edge = (T, x0, y0, x1, y1, n = 7) => Array.from({ length: n + 1 }, (_, i) => T(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n)).join(' L');
  // T(x, y) → "x y" for a leg point: weight 0 at y <= y0 (stays put), 1 at y >= y1 (moves with the foot)
  const legT = (F, y0, y1) => (x, y) => { const w = c01((y - y0) / (y1 - y0)), [fx, fy] = F(x, y); return `${rn(x + (fx - x) * w)} ${rn(y + (fy - y) * w)}`; };
  // deformable leg paths per outfit: name → { y0, y1, d(T) }
  const LEG_DEF = {
    b2: {
      // the top runs up to y -24 so a leg swung far from the hip still starts under the hoodie band
      pants: { y0: -24, y1: 31, d: T => `M${T(-14.4, -24)} L${edge(T, 14.4, -24, 12.5, 38)} Q${T(12.5, 41)} ${T(9, 41)} L${T(-8.5, 41)} Q${T(-12, 41)} ${T(-12, 38)} L${edge(T, -12, 38, -14.4, -24)} Z` },
      crease: { y0: -24, y1: 31, d: T => `M${T(5, 8)} Q${T(9, 16)} ${T(6.5, 26)}` },
    },
    b4: {
      skin: { y0: 4, y1: 46, d: T => `M${T(-7, 4)} L${edge(T, 7, 4, 7, 54)} L${edge(T, -7, 54, -7, 4)} Z` },
    },
  };
  const defPath = (o, k, attrs) => `<path data-d="${o}:${k}" d="${LEG_DEF[o][k].d(legT(footFrame(0), 0, 1))}" ${attrs}/>`;
  // --- one leg per body variant (right-leg art; pants/socks + a foot group) ---
  const LEG = {
    // B2: grey joggers with a ribbed cuff, white high-tops with a blue collar
    b2: `
      ${defPath('b2', 'pants', `fill="${GREY}" ${ol()}`)}
      ${defPath('b2', 'crease', `fill="none" stroke="${GREY_D}" stroke-width="2.2" stroke-linecap="round"`)}
      <g data-r="foot">
        <rect x="-10.5" y="31" width="21" height="9" rx="3.5" fill="${GREY}" ${ol(3)}/>
        <path d="M-5.5 33.5 V37.5 M0 33.5 V37.5 M5.5 33.5 V37.5" stroke="${GREY_D}" stroke-width="1.8" stroke-linecap="round"/>
        ${SHOE.hightop}</g>`,
    // B4: rolled denim shorts, bare legs, bear slippers that match the hood
    b4: `${defPath('b4', 'skin', `fill="${SKIN}" ${ol()}`)}
      <path d="M-13 -8 H13 L14 16 H-14 Z" fill="${DENIM}" ${ol()}/>
      <rect x="-15" y="13" width="30" height="8.5" rx="3.5" fill="${DENIM_L}" ${ol(3)}/>
      <path d="M8 -2 L9.5 11" stroke="#5F82CC" stroke-width="2" stroke-linecap="round"/>
      <g data-r="foot">${SHOE.bear}</g>`,
  };
  const legGroup = side => `<g data-r="leg${side}"><g transform="scale(${side === 'L' ? -1 : 1} 1)">
      ${Object.keys(LEG).map(b => v('outfit', b, LEG[b])).join('')}</g></g>`;
  // --- hoodie torso per variant (absolute coords; the shoulders are the half-body rig's own curve) ---
  const TORSO = {
    // B2: cropped hoodie, band sits high, no pocket
    b2: `<path d="${SHOULDERS} L151 202 Q151 208 145 208 H55 Q49 208 49 202 Z" fill="${HOOD}" ${ol(4)}/>
      <path d="M55 204 H145 Q148 204 148 207.5 V212.5 Q148 216.5 144 216.5 H56 Q52 216.5 52 212.5 V207.5 Q52 204 55 204 Z" fill="${HOOD}" ${ol(3.5)}/>
      ${ribs(60, 140, 207.5, 213)}`,
    // B4: regular length, rounded raw hem (no band), patch pocket
    b4: `<path d="${SHOULDERS} L151 218 Q151 229 140 229 H60 Q49 229 49 218 Z" fill="${HOOD}" ${ol(4)}/>
      <rect x="78" y="198" width="44" height="22" rx="7" fill="${HOOD}" stroke="${LINE}" stroke-width="3"/>
      <path d="M82 203.5 H118" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M52 222 Q100 225 148 222" fill="none" stroke="${LINE}" stroke-width="2.4" stroke-dasharray="5 4" stroke-linecap="round"/>`,
  };
  const LOWER_BODY = `<g data-r="legs">${legGroup('L')}${legGroup('R')}</g>` +
    Object.keys(TORSO).map(b => v('outfit', b, TORSO[b])).join('');

  const SVG = `
<svg viewBox="0 0 200 300" role="img" aria-label="มาสคอตเฮียจด" overflow="visible">
  <defs><clipPath id="hjrf-crop-@ID@"><rect x="-200" y="-200" width="600" height="600"/></clipPath></defs>
  <ellipse data-r="shadow" cx="100" cy="${G}" rx="50" ry="6.5" fill="${INK}" opacity=".13"/>
  <g clip-path="url(#hjrf-crop-@ID@)"><g data-r="wrap">
    ${LOWER_BODY}
    <g data-r="head">
      <g data-r="earL"><circle cx="52" cy="42" r="17" fill="${HOOD}" stroke="${INK}" stroke-width="4"/><circle cx="52" cy="42" r="8" fill="${LINE}"/></g>
      <g data-r="earR"><circle cx="148" cy="42" r="17" fill="${HOOD}" stroke="${INK}" stroke-width="4"/><circle cx="148" cy="42" r="8" fill="${LINE}"/></g>
      <path d="M30 120 C26 52 62 18 100 18 C138 18 174 52 170 120 C170 146 150 160 100 160 C50 160 30 146 30 120Z" fill="${HOOD}" stroke="${INK}" stroke-width="4"/>
      <path d="M42 112 C40 62 68 40 100 40 C132 40 160 62 158 112 C158 140 140 154 100 154 C60 154 42 140 42 112Z" fill="#22273A" stroke="${LINE}" stroke-width="6"/>
      <path data-rs="str" d="M74 150 Q70 164 70 178 M126 150 Q130 164 130 178" fill="none" stroke="${INK}" stroke-width="6.5" stroke-linecap="round"/>
      <path data-rs="str" d="M74 150 Q70 164 70 178 M126 150 Q130 164 130 178" fill="none" stroke="#F4F5FA" stroke-width="3.2" stroke-linecap="round"/>
      <rect data-r="agletL" x="66.5" y="176" width="7" height="9" rx="2" fill="${METAL}" stroke="${INK}" stroke-width="2.2"/>
      <rect data-r="agletR" x="126.5" y="176" width="7" height="9" rx="2" fill="${METAL}" stroke="${INK}" stroke-width="2.2"/>
      <circle cx="74" cy="150" r="3.5" fill="${METAL}" stroke="${INK}" stroke-width="2"/>
      <circle cx="126" cy="150" r="3.5" fill="${METAL}" stroke="${INK}" stroke-width="2"/>
      <path d="${EAR}" fill="${SKIN}" stroke="${INK}" stroke-width="4.2" stroke-linejoin="round"/>
      <path d="${EAR_R}" fill="${SKIN}" stroke="${INK}" stroke-width="4.2" stroke-linejoin="round"/>
      <circle data-r="skull" cx="100" cy="100" r="48" fill="${SKIN}" stroke="${INK}" stroke-width="4.5"/>
      <path d="${EAR}" fill="${SKIN}"/><path d="${EAR_R}" fill="${SKIN}"/>
      <circle data-r="pale" cx="100" cy="100" r="45.8" fill="#A9D9A0" opacity="0"/>
      <path d="M51 104 C47 104.5 45.5 108.5 46.5 113 C47.3 116.5 49.5 118.5 52 117 M149 104 C153 104.5 154.5 108.5 153.5 113 C152.7 116.5 150.5 118.5 148 117" fill="none" stroke="${EARIN}" stroke-width="2.3" stroke-linecap="round"/>
      <path d="M53.5 109.5 Q51.5 111 53 113.5 M146.5 109.5 Q148.5 111 147 113.5" fill="none" stroke="${EARIN}" stroke-width="2" stroke-linecap="round"/>
      <g data-r="face">
        <ellipse cx="64" cy="124" rx="11" ry="6.5" fill="${CHEEK}" opacity=".9"/>
        <ellipse cx="136" cy="124" rx="11" ry="6.5" fill="${CHEEK}" opacity=".9"/>
        <g data-r="blush">
          <ellipse cx="64" cy="124.5" rx="13" ry="8" fill="#FF7894" opacity=".85"/>
          <ellipse cx="136" cy="124.5" rx="13" ry="8" fill="#FF7894" opacity=".85"/>
          <path d="M58 128 l3 -6 M63.5 128 l3 -6 M69 128 l3 -6 M128 128 l3 -6 M133.5 128 l3 -6 M139 128 l3 -6" stroke="#D9416A" stroke-width="2" stroke-linecap="round"/>
        </g>
        <g data-r="eyes">${EYES}</g>
        <g data-r="mouth">${MOUTH_SVG}</g>
        <g data-r="tear">
          <path d="M77 120 Q75 128 76 138 M123 120 Q125 128 124 138" fill="none" stroke="${WATER}" stroke-width="4" stroke-linecap="round" opacity=".9"/>
          <g data-r="tearDrops">
            <path d="M76 135 C78 138 80 140 80 142.5 A4 4 0 0 1 72 142.5 C72 140 74 138 76 135Z" fill="${WATER}" stroke="${INK}" stroke-width="2"/>
            <path d="M124 135 C126 138 128 140 128 142.5 A4 4 0 0 1 120 142.5 C120 140 122 138 124 135Z" fill="${WATER}" stroke="${INK}" stroke-width="2"/>
          </g>
        </g>
      </g>
      <g data-r="hair">
        <!-- K1a (2026-10-17): clean Korean cut. Low groomed quiff with 2 tips curving back, soft comma fringe parted at x 114, slim side locks; the lock over the left eye stops at y 97 so the brows stay readable -->
        <path d="M47 90 C45 70 52 52 66 44 C68 34.2 80 24.4 96 20.2 C100 17.2 104 13.9 107 9.9 Q108.5 14.2 106 18.9 C112 18.3 118 17.2 125 14.8 Q122 20.6 118 24.2 C126 28.6 132 35.6 134 44 C148 52 155 70 153 90 C152 98 151 106 148.5 115 Q147.5 117.5 146.5 115 C146 110 146 103 145 97 C140 96 134 98 131 100 Q128.5 100.5 128 98 C126 94 121 90 114 87 C112 94 106 100 98 102.5 Q95 103 95 100.5 C93 96 90 93 86 92 C84 94 80 96 77 97 Q74 97.5 73.5 95.5 C72 93.5 68 92.5 64 93.5 C60 95 57 97 55 98 C54 104 54 110 53.5 115 Q52.5 117.5 51.5 115 C50 106 48.5 98 47 90Z" fill="${HAIR}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>
        <path d="M114 86 Q116 72 121 60 M80 46.8 C86 37 96 28.6 108 23.7" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M82 39.8 Q90 31.4 101 27.2 M90 80 Q98 74 106 74" fill="none" stroke="#5B5470" stroke-width="3" stroke-linecap="round"/>
      </g>
      <g data-r="brows" fill="none" stroke="${INK}" stroke-width="3.3" stroke-linecap="round">${BROWS}</g>
      ${HEADWEAR}
    </g>
    <g data-r="props">${PROPS}</g>
    <g data-r="headFront">${HEAD_FRONT}</g>
    <g data-r="headFx">${FX}</g>
  </g></g>
  <g data-r="waves" fill="none" stroke="${BLUE}" stroke-linecap="round">
    ${[0, 1, 2].map(i => `<path data-r="wl${i}" d="M20 100 Q28 113 20 126"/>`).join('')}
    ${[0, 1, 2].map(i => `<path data-r="wr${i}" d="M180 100 Q172 113 180 126"/>`).join('')}
  </g>
</svg>`;

  const CSS = `
.hjrf{position:relative;container-type:size;overflow:visible}
.hjrf>svg{position:absolute;inset:0;width:100%;height:100%;display:block;overflow:visible}
.hjrf-bubble{position:absolute;left:50%;bottom:96%;transform-origin:50% 100%;opacity:0;
  background:#fff;color:#1E2240;border:max(2px,1.1cqw) solid ${INK};border-radius:5cqw;padding:1.8cqw 4.5cqw 2.2cqw;
  font-family:"Noto Sans Thai Looped";font-weight:600;font-size:7.6cqw;line-height:1.45;white-space:nowrap}
.hjrf-bubble::after{content:"";position:absolute;left:50%;bottom:-2.6cqw;width:4cqw;height:4cqw;background:#fff;
  border-right:max(2px,1.1cqw) solid ${INK};border-bottom:max(2px,1.1cqw) solid ${INK};transform:translateX(-50%) rotate(45deg)}`;

  function injectGlobalCss() {
    if (document.getElementById('hjrf-style')) return;
    const st = document.createElement('style');
    st.id = 'hjrf-style';
    let css = CSS;
    if (!window.HEARJOT_RIG_NO_FONTFACE && SCRIPT_SRC) {
      const f = n => new URL('../fonts/' + n, SCRIPT_SRC).href;
      css = `
@font-face{font-family:"Noto Sans Thai Looped";font-weight:100 900;font-display:block;src:url("${f('NotoSansThaiLooped-thai.woff2')}") format("woff2");unicode-range:U+02D7,U+0303,U+0331,U+0E01-0E5B,U+200C-200D,U+25CC}
@font-face{font-family:"Noto Sans Thai Looped";font-weight:100 900;font-display:block;src:url("${f('NotoSansThaiLooped-latin.woff2')}") format("woff2");unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:"Noto Sans Thai Looped";font-weight:100 900;font-display:block;src:url("${f('NotoSansThaiLooped-latin-ext.woff2')}") format("woff2");unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}` + css;
    }
    st.textContent = css;
    document.head.appendChild(st);
  }

  // ---- state ----
  const DEFAULTS = {
    lookX: 0, lookY: 0,      // -1..1, head/face/pupils/hair parallax (as the original tick())
    tilt: 0,                 // head tilt, degrees (+ = clockwise)
    squash: 0,               // -1 (stretch tall) .. 1 (squash wide); ±8%
    bodyY: 0,                // vertical hop, viewBox units (200 = full height); negative = up
    lean: 0,                 // whole-body rotation about the bottom centre, degrees
    blink: 0,                // 0 open .. 1 shut
    hairSway: 0,             // extra hair rotation, degrees (hair already sways against lookX)
    listen: 0,               // 0..1 listening mode: +7° tilt and the sound-wave arcs on
    waves: 0,                // 0..1 sound-wave arcs on their own (without the tilt)
    wavePhase: 0,            // wave cycle; +1 = one full pulse. Tween linearly with time.
    flutter: 0,              // 0..1 hoodie strings flutter (superhero wind); phase follows fx
    write: 0,                // 0..1 scribble draw-on progress; pencil jiggles while 0<write<1
    fx: 0,                   // phase for idle loops of the extras (zzz drift, twinkle, steam). Tween linearly.
    armSwing: 0,             // degrees added to the raised right forearm (wave / point / thumbsup / raise) about the elbow
    talk: 0,                 // lip-flap: floor(talk)%4 → rest, B, A, C. Tween 0→4n to end on the rest mouth.
    sweat: 0, tear: 0, blush: 0, anger: 0, zzz: 0, question: 0, sparkles: 0, steam: 0, dizzy: 0, // extras 0..1
    bubble: 0,               // 0..1 speech-bubble pop
    bubbleX: 0,              // bubble horizontal offset, % of the rig width
    pale: 0,                 // 0..1 queasy green-pale tint over the face (stomach ache)
    earTwitch: 0,            // degrees: the hood's bear ears flick outward (tween keyframes for a twitch)
    eyes: 'normal',          // normal happy wide tired teary sparkle side roll closed squint spiral wink
    brows: 'none',           // none worried angry raised
    mouth: 'smile',          // smile open flat frown o talkA talkB talkC smirk yawn grin clench wobble
    hands: 'notepad',        // notepad phone texting mug magnifier thumbsup point wave shrug cheeks facepalm belly raise none
    headwear: 'none',        // none headphones earbuds
    bubbleText: '',
    // ---- full body ----
    outfit: 'b2',            // b2 (crop hoodie, joggers, high-tops) | b4 (denim shorts, bear slippers)
    stance: 3,               // degrees each leg turns outward about its hip (feet apart)
    step: 0,                 // -1..1: lift the left (-) / right (+) foot; tween [0,1,0,-1,0] = march in place
    legSwing: 0,             // degrees, both legs swing the same way (dangling sway; adds to stance)
    hop: 0,                  // hop cycles: 0→1 = one hop (crouch, air, squash on landing, settle). Integers = standing
    hopHeight: 38,           // viewBox units of a hop's peak
    footTap: 0,              // 0..1 right toe lifts about the heel (tween keyframes [0,1,0,1,0] for taps)
    kick: 0,                 // 0..1 left foot kicked up/out (cute one-foot pose)
    cross: 1,                // 0..1 left leg crosses behind the right (b2's standard stand; 0 = apart) (casual crossed-ankle stand)
    shadow: 1,               // ground shadow opacity multiplier
  };
  const KEYS = Object.keys(DEFAULTS);
  const OPTIONS = {
    eyes: ['normal', 'happy', 'wide', 'tired', 'teary', 'sparkle', 'side', 'roll', 'closed', 'squint', 'spiral', 'wink'],
    brows: ['none', 'worried', 'angry', 'raised'],
    mouth: Object.keys(MOUTHS),
    hands: ['notepad', 'phone', 'texting', 'mug', 'magnifier', 'thumbsup', 'point', 'wave', 'shrug', 'cheeks', 'facepalm', 'belly', 'raise', 'none'],
    headwear: ['none', 'headphones', 'earbuds'],
    outfit: ['b2', 'b4'],
  };

  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const frac = x => x - Math.floor(x);
  const r2 = x => Math.round(x * 1000) / 1000;
  const TAU = Math.PI * 2;
  // pop-in: scale for an extra that is 0..1 visible (slight overshoot, purely a function of the value)
  const pop = a => a <= 0 ? 0 : a >= 1 ? 1 : a < .7 ? (a / .7) * 1.12 : 1.12 - .12 * ((a - .7) / .3);

  let mountCount = 0;
  function mount(container, initial) {
    injectGlobalCss();
    container.classList.add('hjrf');
    container.innerHTML = `<div class="hjrf-bubble"></div>${SVG.replace(/@ID@/g, String(++mountCount))}`;
    const q = s => container.querySelector(`[data-r="${s}"]`);
    const el = {};
    container.querySelectorAll('[data-r]').forEach(n => { el[n.dataset.r] = n; });
    el.bubbleBox = container.querySelector('.hjrf-bubble');
    const variants = {};
    container.querySelectorAll('[data-v]').forEach(n => {
      const [g, name] = n.dataset.v.split(':');
      (variants[g] = variants[g] || []).push({ name, n });
    });
    const pencils = container.querySelectorAll('[data-r="pencil"]');
    el.legL = container.querySelector('[data-r="legL"]'); el.legR = container.querySelector('[data-r="legR"]');
    const armRs = container.querySelectorAll('[data-r="armR"]');
    const pupilsAll = container.querySelectorAll('[data-r="pupils"]');
    const strs = container.querySelectorAll('[data-rs="str"]');

    const cache = new WeakMap();
    const attr = (n, k, val) => {
      let c = cache.get(n); if (!c) cache.set(n, c = {});
      if (c[k] !== val) { c[k] = val; n.setAttribute(k, val); }
    };
    const style = (n, k, val) => {
      let c = cache.get(n); if (!c) cache.set(n, c = {});
      if (c['s:' + k] !== val) { c['s:' + k] = val; n.style[k] = val; }
    };
    const showOnly = (group, name) => {
      for (const { name: nm, n } of variants[group] || []) attr(n, 'display', nm === name ? 'inline' : 'none');
    };

    const s = Object.assign({}, DEFAULTS);
    function render() {
      const lx = +s.lookX || 0, ly = +s.lookY || 0;
      const listen = clamp(+s.listen || 0);
      const tilt = (+s.tilt || 0) + 7 * listen;
      // hop cycle: crouch (0-.18) → air (.18-.78, parabola, stretch) → land squash + settle (.78-1)
      const hv = +s.hop || 0, hp = frac(hv);
      let hSq = 0, hY = 0, air = 0;
      if (hv > 0 && hp > 0) {
        if (hp < .18) { const c = hp / .18; hSq = c < .7 ? .9 * c / .7 : .9 - 1.5 * (c - .7) / .3; }
        else if (hp < .78) { const t = (hp - .18) / .6; air = 4 * t * (1 - t); hY = -(+s.hopHeight || 0) * air; hSq = -.6 * (1 - air); }
        else { const u = (hp - .78) / .22; hSq = u < .25 ? -.6 + 1.8 * u / .25 : 1.2 * Math.pow(1 - (u - .25) / .75, 2); }
      }
      const sq = 0.08 * ((+s.squash || 0) + hSq);
      attr(el.wrap, 'transform', `translate(0 ${r2((+s.bodyY || 0) + hY)}) rotate(${r2(+s.lean || 0)} 100 ${G}) translate(100 ${G}) scale(${r2(1 + sq)} ${r2(1 - sq)}) translate(-100 -${G})`);
      const shK = 1 - .45 * air - .3 * clamp(-(+s.bodyY || 0) / 40);
      attr(el.shadow, 'transform', `translate(100 ${G}) scale(${r2(shK * (1 + sq))} ${r2(shK)}) translate(-100 -${G})`);
      attr(el.shadow, 'opacity', r2(.13 * clamp(+s.shadow) * (.6 + .4 * shK)));
      // legs: outward angle about each hip, a lift, and the foot's tilt about its heel
      showOnly('outfit', OPTIONS.outfit.includes(s.outfit) ? s.outfit : 'b2');
      const st = +s.stance || 0, sw = +s.legSwing || 0, stp = clamp(+s.step || 0, -1, 1);
      const kk = clamp(+s.kick || 0), cr = clamp(+s.cross || 0) * (1 - air), tap = clamp(+s.footTap || 0);
      const tuck = 7 * air, sL = Math.max(0, -stp), sR = Math.max(0, stp);
      const aL = st * (1 - cr) - 15 * cr + sw + 10 * sL + 30 * kk + 5 * air, aR = -st + sw - 10 * sR - 5 * air;
      const yL = -tuck - 12 * sL - 15 * kk, yR = -tuck - 12 * sR;
      const xL = 5 * cr;
      // a planted foot stays flat and on the ground whatever the hip angle (stance/cross/legSwing): the shoe is
      // counter-rotated about its heel and the leg is shifted so that heel sits on the ground line.
      // gL/gR = how planted each foot is (1 standing, 0 in the air / lifted by step / kicked).
      const gnd = 1 - air, gL = gnd * (1 - sL) * (1 - kk), gR = gnd * (1 - sR);
      // levelling about the ankle leaves the sole (ANKLE→sole = 24 units) hanging by ANKLE.y·(1 - cos a) above the line
      const lift = a => ANKLE[1] * (1 - Math.cos(a * Math.PI / 180));
      const dyL = lift(aL) * gL, dyR = lift(aR) * gR;
      attr(el.legL, 'transform', `translate(${r2(HIP_L + xL)} ${r2(HIP_Y + dyL)}) rotate(${r2(aL)}) translate(0 ${r2(yL)})`);
      attr(el.legR, 'transform', `translate(${HIP_R} ${r2(HIP_Y + dyR)}) rotate(${r2(aR)}) translate(0 ${r2(yR)})`);
      // foot tilt (deg, - = toe up) about the heel, and the levelling angle about the ankle. Local frames: the left
      // leg is mirrored, so cancelling its hip angle is +aL there and -aR on the right.
      const fL = r2(-14 * sL + 14 * air + 32 * kk), fR = r2(-22 * tap - 14 * sR + 14 * air);
      const lvL = r2(aL * gL), lvR = r2(-aR * gR);
      [[el.legL, fL, lvL], [el.legR, fR, lvR]].forEach(([leg, a, lv]) => {
        leg.querySelectorAll('[data-r="foot"]').forEach(f => attr(f, 'transform', `rotate(${a} ${HEEL[0]} ${HEEL[1]}) rotate(${lv} ${ANKLE[0]} ${ANKLE[1]})`));
        const F = footFrame(a, lv);
        leg.querySelectorAll('[data-d]').forEach(pth => {
          const [o, k] = pth.dataset.d.split(':'), D = LEG_DEF[o][k];
          attr(pth, 'd', D.d(legT(F, D.y0, D.y1)));
        });
      });
      const headT = `translate(${r2(lx * 3)} ${r2(ly * 2)}) rotate(${r2(lx * 5 + tilt)} 100 150)`;
      attr(el.head, 'transform', headT);
      attr(el.headFront, 'transform', headT);
      attr(el.headFx, 'transform', headT);
      const faceT = `translate(${r2(lx * 7)} ${r2(ly * 5)})`;
      attr(el.face, 'transform', faceT);
      attr(el.brows, 'transform', faceT);
      attr(el.hair, 'transform', `translate(${r2(lx * 4)} ${r2(ly * 2)}) rotate(${r2(-lx * 6 + (+s.hairSway || 0))} 100 92)`);
      pupilsAll.forEach(p => attr(p, 'transform', `translate(${r2(lx * 2)} ${r2(ly * 2)})`));
      const bl = 1 - 0.92 * clamp(+s.blink || 0);
      attr(el.eyes, 'transform', `translate(0 113) scale(1 ${r2(bl)}) translate(0 -113)`);

      showOnly('eyes', OPTIONS.eyes.includes(s.eyes) ? s.eyes : 'normal');
      showOnly('brows', OPTIONS.brows.includes(s.brows) ? s.brows : 'none');
      showOnly('hands', OPTIONS.hands.includes(s.hands) ? s.hands : 'notepad');
      showOnly('headwear', OPTIONS.headwear.includes(s.headwear) ? s.headwear : 'none');
      const rest = MOUTHS[s.mouth] ? s.mouth : 'smile';
      const talk = +s.talk || 0;
      const mouth = talk > 0 ? [rest, 'talkB', 'talkA', 'talkC'][Math.floor(talk) % 4] : rest;
      showOnly('mouth', mouth);

      // writing
      const w = clamp(+s.write || 0);
      attr(el.scribble, 'stroke-dashoffset', r2(40 * (1 - w)));
      const jig = w > 0 && w < 1 ? 0.5 - 0.5 * Math.cos(w * Math.PI * 10) : 0;
      pencils.forEach(p => attr(p, 'transform', `translate(${r2(-4 * jig)} ${r2(1.5 * jig)})`));
      attr(el.thumbs, 'transform', `translate(${r2(1.5 * jig)} ${r2(-2.5 * jig)})`);
      armRs.forEach(a => attr(a, 'transform', `rotate(${r2(+s.armSwing || 0)} ${a.dataset.pivot || '138 194'})`));   // forearm + hand turn about the elbow

      const fx = +s.fx || 0;
      // hoodie strings: at flutter 0 the path is exactly the drawn one
      const fl = clamp(+s.flutter || 0);
      const dL = r2(fl * 9 * Math.sin(TAU * fx * 2)), dR = r2(fl * 9 * Math.sin(TAU * fx * 2 + 1.7));
      const uL = r2(fl * 5 * Math.abs(Math.sin(TAU * fx * 2 + .6))), uR = r2(fl * 5 * Math.abs(Math.sin(TAU * fx * 2 + 2.3)));
      const sd = fl > 0 ? `M74 150 Q${r2(70 + dL * .3)} 164 ${r2(70 + dL)} ${r2(178 - uL)} M126 150 Q${r2(130 + dR * .3)} 164 ${r2(130 + dR)} ${r2(178 - uR)}`
                        : 'M74 150 Q70 164 70 178 M126 150 Q130 164 130 178';
      strs.forEach(p => attr(p, 'd', sd));
      attr(el.agletL, 'transform', `translate(${fl > 0 ? dL : 0} ${fl > 0 ? -uL : 0})`);
      attr(el.agletR, 'transform', `translate(${fl > 0 ? dR : 0} ${fl > 0 ? -uR : 0})`);
      // phone rec dot blinks once a fx-cycle; mug steam drifts
      attr(el.recdot, 'opacity', frac(fx) < 0.6 ? 1 : 0.25);
      attr(el.steam, 'transform', `translate(0 ${r2(-3 * frac(fx))})`);
      attr(el.steam, 'opacity', r2(0.9 * Math.sin(Math.PI * frac(fx)) + 0.1));
      attr(el.wavelines, 'opacity', r2(0.35 + 0.65 * Math.abs(Math.sin(fx * Math.PI * 2))));

      // extras
      const amt = k => clamp(+s[k] || 0);
      attr(el.blush, 'opacity', r2(amt('blush')));
      attr(el.pale, 'opacity', r2(0.62 * amt('pale')));
      const et = +s.earTwitch || 0;
      attr(el.earL, 'transform', `rotate(${r2(-et)} 62 56)`);
      attr(el.earR, 'transform', `rotate(${r2(et)} 138 56)`);
      attr(el.tear, 'opacity', r2(amt('tear')));
      attr(el.tearDrops, 'transform', `translate(0 ${r2(3 * frac(fx))})`);
      const place = (n, a, x, y, extra = '') => {
        attr(n, 'display', a > 0 ? 'inline' : 'none');
        attr(n, 'transform', `translate(${r2(x)} ${r2(y)}) scale(${r2(pop(a))}) ${extra}`);
      };
      place(el['fx-sweat'], amt('sweat'), 150, 74);
      attr(el.sweatDrop, 'transform', `translate(0 ${r2(5 * frac(fx * 0.8))})`);
      place(el['fx-anger'], amt('anger'), 152, 60, `scale(${r2(1 + 0.12 * Math.sin(fx * TAU * 2))})`);
      place(el['fx-question'], amt('question'), 172, 36, `rotate(${r2(8 * Math.sin(fx * TAU))})`);
      el['fx-zzz'].setAttribute('display', amt('zzz') > 0 ? 'inline' : 'none');
      for (let i = 0; i < 3; i++) {
        const l = frac(fx * 0.6 + i / 3);
        const a = amt('zzz') * Math.sin(Math.PI * l);
        attr(el['z' + i], 'transform', `translate(${r2(166 + 22 * l)} ${r2(52 - 44 * l)}) scale(${r2(0.7 + 0.7 * l)}) rotate(${r2(-10 + 10 * l)})`);
        attr(el['z' + i], 'opacity', r2(a));
      }
      const SP = [[30, 40, 1], [176, 64, .8], [20, 150, .75], [180, 150, .6]];
      attr(el['fx-sparkles'], 'display', amt('sparkles') > 0 ? 'inline' : 'none');
      SP.forEach(([x, y, k], i) => {
        const tw = 0.7 + 0.3 * Math.sin(TAU * (fx + i / 4));
        attr(el['sp' + i], 'transform', `translate(${x} ${y}) scale(${r2(k * tw * pop(amt('sparkles')))}) rotate(${r2(20 * Math.sin(TAU * (fx * .5 + i / 4)))})`);
      });
      // dizzy: three stars orbit an ellipse over the head; one orbit per fx unit
      attr(el['fx-dizzy'], 'display', amt('dizzy') > 0 ? 'inline' : 'none');
      for (let i = 0; i < 3; i++) {
        const a = TAU * (fx + i / 3);
        attr(el['dz' + i], 'transform', `translate(${r2(100 + 58 * Math.cos(a))} ${r2(46 + 12 * Math.sin(a))}) scale(${r2((1.25 + 0.35 * Math.sin(a)) * pop(amt('dizzy')))}) rotate(${r2(90 * fx)})`);
      }
      attr(el['fx-steam'], 'display', amt('steam') > 0 ? 'inline' : 'none');
      [[34, 34], [166, 34]].forEach(([x, y], i) => {
        const l = frac(fx * 0.9 + i / 2);
        attr(el['st' + i], 'transform', `translate(${r2(x + (i ? 8 : -8) * l)} ${r2(y - 22 * l)}) scale(${r2((0.7 + 0.6 * l) * pop(amt('steam')))})`);
        attr(el['st' + i], 'opacity', r2(Math.sin(Math.PI * l)));
      });

      // sound-wave arcs (deterministic replacement of the CSS keyframes inL/inR)
      const A = Math.max(clamp(+s.waves || 0), listen);
      const ph = +s.wavePhase || 0;
      attr(el.waves, 'stroke-width', r2(3.5 + 0.7 * listen));
      for (let i = 0; i < 3; i++) {
        const l = frac(ph + i / 3);
        const op = A * (l < .35 ? .9 * l / .35 : .9 * (1 - (l - .35) / .65));
        attr(el['wl' + i], 'transform', `translate(${r2(-16 + 24 * l)} 0)`);
        attr(el['wr' + i], 'transform', `translate(${r2(16 - 24 * l)} 0)`);
        attr(el['wl' + i], 'opacity', r2(op));
        attr(el['wr' + i], 'opacity', r2(op));
      }

      // speech bubble
      const b = clamp(+s.bubble || 0);
      if (el.bubbleBox.textContent !== String(s.bubbleText)) el.bubbleBox.textContent = String(s.bubbleText);
      style(el.bubbleBox, 'opacity', String(r2(clamp(b * 1.6))));
      style(el.bubbleBox, 'transform', `translateX(calc(-50% + ${r2(+s.bubbleX || 0)}cqw)) scale(${r2(0.6 + 0.4 * pop(b))})`);
    }

    const rig = {
      el: container,
      render,
      set(obj) { for (const k in obj) if (k in DEFAULTS) s[k] = obj[k]; render(); return rig; },
      get(k) { return s[k]; },
      state() { return Object.assign({}, s); },
      reset() { Object.assign(s, DEFAULTS); render(); return rig; },
    };
    // plain properties GSAP can tween (numbers) or tl.set (strings); each write re-renders synchronously
    KEYS.forEach(k => Object.defineProperty(rig, k, {
      get: () => s[k], set: val => { s[k] = val; render(); }, enumerable: true,
    }));
    if (initial) Object.assign(s, initial);
    render();
    return rig;
  }

  // custom element: <hearjot-rig eyes="happy" hands="mug" listen="1"> — attributes seed the state; tween el.rig
  class HearJotRigEl extends HTMLElement {
    connectedCallback() {
      if (this.rig) return;
      if (!this.style.display) this.style.display = 'block';
      const init = {};
      for (const k of KEYS) if (this.hasAttribute(k.toLowerCase())) {
        const a = this.getAttribute(k.toLowerCase());
        init[k] = typeof DEFAULTS[k] === 'number' ? parseFloat(a) : a;
      }
      this.rig = mount(this, init);
    }
  }
  if (!customElements.get('hearjot-rig-full')) customElements.define('hearjot-rig-full', HearJotRigEl);

  // Named poses used by the series (pass to mount() or rig.set(); combine with your own overrides).
  // Every pose is a full state, so rig.set(POSES.x) fully replaces the previous look.
  const P = o => Object.assign({}, DEFAULTS, o);
  const POSES = {
    greet:      P({ eyes: 'normal', mouth: 'smile', hands: 'notepad', write: 1, lookX: .15, tilt: -3 }),
    shock:      P({ eyes: 'wide', brows: 'raised', mouth: 'o', hands: 'cheeks', squash: -.6, sweat: 1 }),
    headache:   P({ eyes: 'squint', brows: 'worried', mouth: 'frown', hands: 'notepad', sweat: 1, tilt: 6, lookY: .3 }),
    lateNight:  P({ eyes: 'tired', brows: 'worried', mouth: 'flat', hands: 'mug', zzz: 1, fx: .35, tilt: 12, squash: .5, lookY: .4 }),
    recording:  P({ eyes: 'normal', brows: 'worried', mouth: 'frown', hands: 'phone', lookX: -.25, lookY: .35 }),
    listening:  P({ eyes: 'normal', mouth: 'smile', hands: 'notepad', headwear: 'headphones', listen: 1, wavePhase: .2, lookX: -.2 }),
    detective:  P({ eyes: 'side', brows: 'angry', mouth: 'smirk', hands: 'magnifier', lookX: .35 }),
    writing:    P({ eyes: 'normal', brows: 'angry', mouth: 'flat', hands: 'notepad', write: .55, sweat: 1, lookX: .2, lookY: .7, fx: .3 }),
    sad:        P({ eyes: 'teary', brows: 'worried', mouth: 'frown', hands: 'notepad', tear: 1, lookY: .4, tilt: -4, fx: .2 }),
    proud:      P({ eyes: 'sparkle', brows: 'raised', mouth: 'grin', hands: 'thumbsup', sparkles: 1, fx: .1, tilt: -4 }),
    confused:   P({ eyes: 'normal', brows: 'raised', mouth: 'frown', hands: 'notepad', question: 1, tilt: 10, lookX: -.3 }),
    laugh:      P({ eyes: 'happy', mouth: 'open', hands: 'notepad', squash: .4, tilt: -6, blush: .6 }),
    // extras
    wave:       P({ eyes: 'happy', mouth: 'open', hands: 'wave', fx: .2, lookX: .2 }),
    point:      P({ eyes: 'normal', brows: 'raised', mouth: 'smile', hands: 'point', lookX: .6, lookY: -.5 }),
    shrug:      P({ eyes: 'side', brows: 'raised', mouth: 'flat', hands: 'shrug', squash: .5, tilt: 8 }),
    facepalm:   P({ eyes: 'closed', brows: 'worried', mouth: 'frown', hands: 'facepalm', tilt: 8, lookY: .3 }),
    eyeRoll:    P({ eyes: 'roll', brows: 'raised', mouth: 'flat', hands: 'notepad', tilt: -6 }),
    sideEye:    P({ eyes: 'side', brows: 'angry', mouth: 'smirk', hands: 'notepad', lookX: .3 }),
    laughCry:   P({ eyes: 'squint', mouth: 'grin', hands: 'notepad', tear: 1, squash: .5, tilt: -8, fx: .5 }),
    yawn:       P({ eyes: 'closed', brows: 'worried', mouth: 'yawn', hands: 'mug', squash: -.5, lookY: -.4, tilt: 5 }),
    angry:      P({ eyes: 'normal', brows: 'angry', mouth: 'frown', hands: 'notepad', steam: 1, anger: 1, blush: .5, fx: .35, squash: .3 }),
    texting:    P({ eyes: 'normal', brows: 'none', mouth: 'smile', hands: 'texting', lookY: .55, lookX: .05, tilt: -3 }),
    hopeful:    P({ eyes: 'sparkle', brows: 'raised', mouth: 'smile', hands: 'texting', lookY: .45, tilt: -5, blush: .4 }),
    bonked:     P({ eyes: 'spiral', brows: 'worried', mouth: 'o', hands: 'texting', dizzy: 1, squash: .8, tilt: 6 }),
    wink:       P({ eyes: 'wink', brows: 'raised', mouth: 'grin', hands: 'wave', fx: .2, lookX: .2, tilt: -5 }),
    tummyAche:  P({ eyes: 'squint', brows: 'worried', mouth: 'clench', hands: 'belly', sweat: 1, pale: 1, tilt: 4, lookY: .2 }),
    askHand:    P({ eyes: 'normal', brows: 'raised', mouth: 'talkC', hands: 'raise', lookX: .3, lookY: -.3, tilt: -3 }),
    earbuds:    P({ eyes: 'happy', mouth: 'smile', hands: 'phone', headwear: 'earbuds', waves: .8, wavePhase: .25 }),
  };
  // Outfit presets with each one's standing stance: merge AFTER a pose, e.g. Object.assign({}, POSES.wave, OUTFITS.b4)
  const OUTFITS = {
    b2: { outfit: 'b2', stance: 3, cross: 1 },   // crossed-ankle casual stand (the standard look)
    b4: { outfit: 'b4', stance: 5, cross: 0 },   // feet apart; pairs well with a footTap idle
  };
  window.HearJotRigFull = { mount, DEFAULTS, OPTIONS, POSES, OUTFITS };
})();
