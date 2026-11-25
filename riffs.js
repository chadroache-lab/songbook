/* Riff Lab for Open Mic Songbook: a fretboard, backing tracks and a riff builder. Settings and your riff are saved on this device (osb:riff). */
(function () {
'use strict';

const $ = id => document.getElementById('rl-' + id);
const NS = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const NF = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
const KEYS = [['C',0,0],['Db',1,1],['D',2,0],['Eb',3,1],['E',4,0],['F',5,1],['F#',6,0],['G',7,0],['Ab',8,1],['A',9,0],['Bb',10,1],['B',11,0]];
const OPEN = [40,45,50,55,59,64];                 // low E to high e (MIDI)
const STRN = ['E','A','D','G','B','e'];
const IVN = ['1','♭2','2','♭3','3','4','♭5','5','♭6','6','♭7','7'];
const SCALES = {
  minpent:{name:'Minor pentatonic', iv:[0,3,5,7,10]},
  majpent:{name:'Major pentatonic', iv:[0,2,4,7,9]},
  blues:{name:'Minor blues', iv:[0,3,5,6,7,10]},
  minor:{name:'Natural minor', iv:[0,2,3,5,7,8,10]},
  major:{name:'Major', iv:[0,2,4,5,7,9,11]},
  dorian:{name:'Dorian', iv:[0,2,3,5,7,9,10]},
  mixo:{name:'Mixolydian', iv:[0,2,4,5,7,9,10]}
};
const QUAL = {M:{s:'',iv:[0,4,7]}, m:{s:'m',iv:[0,3,7]}, '7':{s:'7',iv:[0,4,7,10]}, m7:{s:'m7',iv:[0,3,7,10]}};
const PROGS = {
  epic:{name:'Minor rock: i  ♭VI  ♭III  ♭VII', scale:'minpent', feel:'straight', bpm:100, ch:[[0,'m'],[8,'M'],[3,'M'],[10,'M']]},
  andal:{name:'Andalusian: i  ♭VII  ♭VI  V', scale:'minpent', feel:'straight', bpm:96, ch:[[0,'m'],[10,'M'],[8,'M'],[7,'M']]},
  heavy:{name:'Heavy: i  i  ♭VI  ♭VII', scale:'minpent', feel:'straight', bpm:110, ch:[[0,'m'],[0,'m'],[8,'M'],[10,'M']]},
  mblues:{name:'Minor blues, 12 bars', scale:'blues', feel:'shuffle', bpm:84, ch:[[0,'m7'],[0,'m7'],[0,'m7'],[0,'m7'],[5,'m7'],[5,'m7'],[0,'m7'],[0,'m7'],[8,'7'],[7,'7'],[0,'m7'],[7,'7']]},
  blues:{name:'Blues, 12 bars: I7 IV7 V7', scale:'blues', feel:'shuffle', bpm:92, ch:[[0,'7'],[0,'7'],[0,'7'],[0,'7'],[5,'7'],[5,'7'],[0,'7'],[0,'7'],[7,'7'],[5,'7'],[0,'7'],[7,'7']]},
  pop:{name:'Pop: I  V  vi  IV', scale:'majpent', feel:'straight', bpm:104, ch:[[0,'M'],[7,'M'],[9,'m'],[5,'M']]},
  rock:{name:'Classic rock: I  IV  V  IV', scale:'majpent', feel:'straight', bpm:112, ch:[[0,'M'],[5,'M'],[7,'M'],[5,'M']]},
  fifties:{name:'Fifties: I  vi  IV  V', scale:'majpent', feel:'straight', bpm:90, ch:[[0,'M'],[9,'m'],[5,'M'],[7,'M']]},
  dorian:{name:'Dorian groove: i7  IV7', scale:'dorian', feel:'straight', bpm:98, ch:[[0,'m7'],[5,'7']]},
  canon:{name:'Canon: I  V  vi  iii  IV  I  IV  V', scale:'majpent', feel:'straight', bpm:80, ch:[[0,'M'],[7,'M'],[9,'m'],[4,'m'],[5,'M'],[0,'M'],[5,'M'],[7,'M']]},
  epic2:{name:'Anthem: i  ♭III  ♭VII  iv', scale:'minpent', feel:'straight', bpm:100, ch:[[0,'m'],[3,'M'],[10,'M'],[5,'m']]},
  mixo:{name:'Mixolydian rock: I  ♭VII  IV  I', scale:'mixo', feel:'straight', bpm:108, ch:[[0,'M'],[10,'M'],[5,'M'],[0,'M']]},
  funk:{name:'Funk vamp: i7  i7  IV7  i7', scale:'dorian', feel:'straight', bpm:100, ch:[[0,'m7'],[0,'m7'],[5,'7'],[0,'m7']]},
  quick:{name:'Quick-change blues, 12 bars', scale:'blues', feel:'shuffle', bpm:100, ch:[[0,'7'],[5,'7'],[0,'7'],[0,'7'],[5,'7'],[5,'7'],[0,'7'],[0,'7'],[7,'7'],[5,'7'],[0,'7'],[7,'7']]},
  eight:{name:'8-bar blues: I7 V7 IV7 IV7 I7 V7 I7 V7', scale:'blues', feel:'shuffle', bpm:88, ch:[[0,'7'],[7,'7'],[5,'7'],[5,'7'],[0,'7'],[7,'7'],[0,'7'],[7,'7']]},
  ballad:{name:'Ballad: i  ♭VI  iv  V', scale:'minor', feel:'straight', bpm:74, ch:[[0,'m'],[8,'M'],[5,'m'],[7,'M']]},
  sadpop:{name:'Sad pop: vi  IV  I  V', scale:'majpent', feel:'straight', bpm:98, ch:[[9,'m'],[5,'M'],[0,'M'],[7,'M']]}
};
// Recipes: rs = string the root sits on, notes = semitones above that root (null = rest, [semitones, extra strings up] to force a shape)
const RECIPES = {
  chug:{name:'Rock chug', rs:0, notes:[0,0,3,0,0,5,3,0], notes2:[0,0,3,0,0,5,6,5]},
  walk:{name:'Blues walk', rs:1, notes:[0,3,5,6,7,6,5,3], notes2:[0,3,5,6,7,10,12,10]},
  run:{name:'Pentatonic run', rs:0, notes:[0,3,5,7,10,12,10,7], notes2:[12,10,7,5,3,5,3,0]},
  oct:{name:'Octave bounce', rs:1, notes:[[0,0],[12,2],[0,0],[12,2],[3,0],[15,2],[3,0],[15,2]], notes2:[[0,0],[12,2],[0,0],[12,2],[5,0],[17,2],[3,0],[15,2]]},
  qa:{name:'Question and answer', rs:0, notes:[0,null,3,null,5,3,0,null], notes2:[0,null,3,null,5,7,5,3]},
  metal:{name:'Metal pedal point', rs:0, notes:[0,0,0,3,0,0,5,6], notes2:[0,0,0,3,0,0,6,5]},
  funk:{name:'Funk stabs', rs:1, notes:[0,null,0,3,null,5,3,null], notes2:[0,null,0,3,null,5,7,5]},
  boogie:{name:'Boogie shuffle', rs:0, notes:[0,7,9,10,9,7,0,null], notes2:[0,7,9,10,12,10,9,7]},
  desc:{name:'Descending lick', rs:1, notes:[12,10,7,5,7,5,3,0], notes2:[15,12,10,12,10,7,5,0]},
  sync:{name:'Syncopated rock', rs:0, notes:[0,null,0,0,null,3,5,null], notes2:[0,null,0,0,null,3,5,7]},
  arp:{name:'Arpeggio ripple (minor)', rs:1, notes:[0,3,7,12,7,3,0,null], notes2:[0,3,7,12,15,12,7,3]},
  majhook:{name:'Major pentatonic hook', rs:1, notes:[0,2,4,7,4,2,0,null], notes2:[0,2,4,7,9,7,4,2]}
};
const NUMS = ['I','♭II','II','♭III','III','IV','♭V','V','♭VI','VI','♭VII','VII'];
const ROLE = ['R','♭2','2','♭3','3','4','♭5','5','♭6','6','♭7','7'];

const state = {
  key:9, scale:'minpent', prog:'epic', feel:'straight', bpm:100, pos:0, labels:'names', vol:.7, view:'scale', len:8,
  mix:{drums:true,bass:true,chords:true,riff:true},
  riff:Array(8).fill(null), cursor:0, sel:0, playing:false, step:-1
};

/* ---------- helpers ---------- */
const spell = pc => ((KEYS[state.key][2] ? NF : NS)[((pc % 12) + 12) % 12]);
const prog = () => PROGS[state.prog];
function chordAt(i){
  const list = prog().ch, c = list[((i % list.length) + list.length) % list.length];
  const root = (state.key + c[0]) % 12, q = QUAL[c[1]];
  let num = NUMS[c[0]]; if (c[1] === 'm' || c[1] === 'm7') num = num.toLowerCase(); if (c[1] === '7' || c[1] === 'm7') num += '7';
  return {off:c[0], root, q:c[1], name:spell(root) + q.s, num, pcs:q.iv.map(i => (root + i) % 12)};
}
function inWindow(f, w){ return [-12,0,12].some(k => f >= w[0] + k && f <= w[1] + k); }
function posWindows(){
  const iv = SCALES[state.scale].iv, rf = ((state.key - 4) % 12 + 12) % 12, out = [];
  for (let f = rf; f < rf + 12; f++) if (iv.includes(f - rf)) out.push([f - 1, f + 3]);
  return out;
}

/* ---------- fretboard ---------- */
const noteEls = new Map();
function renderFretboard(){
  const nutX = 70, endX = 984, fw = (endX - nutX) / 15, top = 30, gap = 34;
  const X = f => f === 0 ? nutX - 26 : nutX + (f - .5) * fw, Y = s => top + (5 - s) * gap;
  const iv = SCALES[state.scale].iv, wins = posWindows(), win = state.pos ? wins[state.pos - 1] : null;
  let h = `<rect x="${nutX}" y="${top - 16}" width="${endX - nutX}" height="${5 * gap + 32}" rx="5" fill="var(--rl-wood)"/>`;
  for (let f = 1; f <= 15; f++){
    h += `<line x1="${nutX + f * fw}" x2="${nutX + f * fw}" y1="${top - 16}" y2="${top + 5 * gap + 16}" stroke="var(--rl-fret)" stroke-width="2"/>`;
    h += `<text x="${X(f)}" y="${top + 5 * gap + 38}" text-anchor="middle" font-size="12" fill="var(--muted)">${f}</text>`;
  }
  h += `<rect x="${nutX - 3}" y="${top - 16}" width="6" height="${5 * gap + 32}" fill="var(--rl-marker)"/>`;
  [3,5,7,9,15].forEach(f => h += `<circle cx="${X(f)}" cy="${top + 2.5 * gap}" r="6" fill="var(--rl-marker)" opacity=".5"/>`);
  h += `<circle cx="${X(12)}" cy="${top + 1.5 * gap}" r="6" fill="var(--rl-marker)" opacity=".5"/><circle cx="${X(12)}" cy="${top + 3.5 * gap}" r="6" fill="var(--rl-marker)" opacity=".5"/>`;
  for (let s = 0; s < 6; s++){
    h += `<line x1="${nutX - 50}" x2="${endX}" y1="${Y(s)}" y2="${Y(s)}" stroke="var(--rl-string)" stroke-width="${(2.6 - s * .32).toFixed(2)}"/>`;
    h += `<text x="12" y="${Y(s)}" dy=".35em" font-size="12" font-weight="600" fill="var(--muted)">${STRN[s]}</text>`;
  }
  const inRiff = new Map();
  state.riff.forEach((n, i) => { if (n){ const k = n.s + ',' + n.f; if (!inRiff.has(k)) inRiff.set(k, []); inRiff.get(k).push(i + 1); } });
  let notes = '', badges = '';
  const allPcs = new Set(); prog().ch.forEach((_, i) => chordAt(i).pcs.forEach(p => allPcs.add(p)));
  for (let s = 0; s < 6; s++) for (let f = 0; f <= 15; f++){
    const pc = (OPEN[s] + f) % 12, d = ((pc - state.key) % 12 + 12) % 12, scaled = iv.includes(d), k = s + ',' + f;
    const extra = !scaled && !inRiff.has(k); if (extra && !allPcs.has(pc)) continue;
    const dim = win && !inWindow(f, win), cls = ['n']; if (d === 0) cls.push('root'); if (extra) cls.push('xtra'); else if (!scaled) cls.push('out'); if (dim) cls.push('dim');
    const lab = state.labels === 'names' ? spell(pc) : state.labels === 'ivs' ? IVN[d] : '';
    notes += `<g class="${cls.join(' ')}" data-s="${s}" data-f="${f}" data-pc="${pc}"><circle class="ring" cx="${X(f)}" cy="${Y(s)}" r="15"/><circle class="d" cx="${X(f)}" cy="${Y(s)}" r="12.5"/><text x="${X(f)}" y="${Y(s)}" dy=".35em" text-anchor="middle">${lab}</text></g>`;
    if (inRiff.has(k)){
      const t = inRiff.get(k).join('·'), w = 10 + 6 * t.length;
      badges += `<g class="badge" pointer-events="none"><rect x="${X(f) + 12 - w / 2}" y="${Y(s) - 22}" width="${w}" height="15" rx="7.5"/><text x="${X(f) + 12}" y="${Y(s) - 14.5}" dy=".35em" text-anchor="middle">${t}</text></g>`;
    }
  }
  $('board').classList.toggle('view-chord', state.view === 'chord');
  $('board').innerHTML = h + notes + badges;
  noteEls.clear();
  $('board').querySelectorAll('.n').forEach(g => noteEls.set(g.dataset.s + ',' + g.dataset.f, g));
  paintChord(); paintHit(); save();
}
function paintChord(){
  const c = chordAt(state.sel), set = new Set(c.pcs);
  noteEls.forEach(g => g.classList.toggle('chord', set.has(+g.dataset.pc)));
  $('chordinfo').innerHTML = `<b>${c.name}</b> &nbsp;chord notes: ${c.pcs.map(spell).join('  ')}. End your phrases on these.`;
  $('strip').querySelectorAll('.rl-bar').forEach((b, i) => b.classList.toggle('on', i === state.sel));
  if (state.labels === 'role') noteEls.forEach(g => { g.querySelector('text').textContent = ROLE[((+g.dataset.pc - c.root) % 12 + 12) % 12]; });
}
let hitEl = null;
function paintHit(){
  if (hitEl) hitEl.classList.remove('hit'); hitEl = null;
  const n = state.playing && state.step >= 0 ? state.riff[state.step] : null;
  if (n && state.mix.riff){ hitEl = noteEls.get(n.s + ',' + n.f) || null; if (hitEl) hitEl.classList.add('hit'); }
  $('tab').querySelectorAll('.rl-cell').forEach(c => {
    const st = +c.dataset.step;
    c.classList.toggle('cur', state.playing && st === state.step);
    c.classList.toggle('sel', !state.playing && st === state.cursor);
  });
}

/* ---------- strip, positions, tab ---------- */
function renderStrip(){
  const n = prog().ch.length;
  $('strip').innerHTML = Array.from({length:n}, (_, i) => { const c = chordAt(i); return `<button type="button" class="rl-bar" data-i="${i}" aria-label="Bar ${i + 1}: ${c.name}"><span class="rl-num">${c.num}</span><span class="rl-nm">${c.name}</span></button>`; }).join('');
  if (state.sel >= n) state.sel = 0;
}
function renderPositions(){
  const n = SCALES[state.scale].iv.length;
  if (state.pos > n) state.pos = 0;
  $('positions').innerHTML = '<span class="rl-lbl">Position</span>' + ['All', ...Array.from({length:n}, (_, i) => i + 1)].map((t, i) => `<button type="button" data-p="${i}" aria-pressed="${state.pos === i}">${t}</button>`).join('');
}
function renderTab(){
  let out = '';
  for (let blk = 0; blk < state.len / 8; blk++){
    let h = '<span></span>' + ['1','&','2','&','3','&','4','&'].map(t => `<span class="rl-hd">${t}</span>`).join('');
    for (let s = 5; s >= 0; s--){
      h += `<span class="rl-sl">${STRN[s]}</span>`;
      for (let j = 0; j < 8; j++){ const i = blk * 8 + j, n = state.riff[i], here = n && n.s === s;
        h += `<button type="button" class="rl-cell${here ? ' has' : ''}" data-step="${i}" aria-label="Step ${i + 1}, string ${STRN[s]}">${here ? n.f : '–'}</button>`; }
    }
    out += `<div>${state.len > 8 ? `<div class="rl-bt">Riff bar ${blk + 1}</div>` : ''}<div class="rl-tab">${h}</div></div>`;
  }
  $('tab').innerHTML = out; paintHit();
}
function setStep(i, note){ state.riff[i] = note; state.cursor = (i + 1) % state.len; renderTab(); renderFretboard(); }

function loadRecipe(id){
  const r = RECIPES[id], rs = r.rs, rf = ((state.key - OPEN[rs] % 12) % 12 + 12) % 12, base = OPEN[rs] + rf;
  const conv = n => {
    if (n === null) return null;
    const [semi, extra] = Array.isArray(n) ? n : [n, 0], pitch = base + semi;
    let s = Math.min(5, rs + extra), f = pitch - OPEN[s];
    while (f > 14 && s < 5){ s++; f = pitch - OPEN[s]; }
    while (f < 0 && s > 0){ s--; f = pitch - OPEN[s]; }
    return {s, f};
  };
  const a = r.notes.map(conv), b = (r.notes2 || r.notes).map(conv);
  state.riff = state.len === 16 ? a.concat(b) : a;
  state.cursor = 0; renderTab(); renderFretboard();
}

/* ---------- audio ---------- */
let ctx, master, noise, timer, raf, nextT, barStart, stepI, barI; const queue = [];
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
function ensureCtx(){
  if (!ctx){
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = state.vol;
    const comp = ctx.createDynamicsCompressor(); master.connect(comp); comp.connect(ctx.destination);
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
  if (ctx.state === 'suspended') ctx.resume();
}
function pluck(t, midi, dur, vel, bright){
  const f = hz(midi), g = ctx.createGain(), lp = ctx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.setValueAtTime(bright, t); lp.frequency.exponentialRampToValueAtTime(350, t + dur);
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vel, t + .006); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  [1, 1.005].forEach(det => { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f * det; o.connect(lp); o.start(t); o.stop(t + dur + .05); });
  lp.connect(g); g.connect(master);
}
function bassNote(t, midi, dur){
  const g = ctx.createGain(), o = ctx.createOscillator(), o2 = ctx.createOscillator();
  o.type = 'triangle'; o2.type = 'sine'; o.frequency.value = hz(midi); o2.frequency.value = hz(midi);
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.42, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g); o2.connect(g); g.connect(master); o.start(t); o2.start(t); o.stop(t + dur + .05); o2.stop(t + dur + .05);
}
function kick(t){
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(42, t + .12);
  g.gain.setValueAtTime(.9, t); g.gain.exponentialRampToValueAtTime(.0001, t + .22);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + .25);
}
function noiseHit(t, hp, dur, vel){
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = noise; f.type = 'highpass'; f.frequency.value = hp;
  g.gain.setValueAtTime(vel, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + dur + .02);
}
function stepOffset(step){
  const beat = 60 / state.bpm;
  return (step >> 1) * beat + ((step & 1) ? beat * (state.feel === 'shuffle' ? 2 / 3 : .5) : 0);
}
function playStep(step, bar, t){
  const beat = 60 / state.bpm, c = chordAt(bar);
  if (state.mix.chords && (step === 0 || step === 4)){
    const base = 52 + ((c.root - 52) % 12 + 12) % 12;
    QUAL[c.q].iv.forEach((i, k) => pluck(t + k * .012, base + i, beat * 1.9, .075, 2000));
  }
  if (state.mix.bass && step % 2 === 0){
    const r = 36 + ((c.root - 36) % 12 + 12) % 12;
    bassNote(t, step === 6 ? r + 7 : r, beat * .9);
  }
  if (state.mix.drums){
    if (step === 0 || step === 4 || step === 5) kick(t);
    if (step === 2 || step === 6){ noiseHit(t, 1200, .16, .5); }
    noiseHit(t, 7000, .04, step % 2 ? .1 : .18);
  }
  const ri = state.len === 16 ? (bar % 2) * 8 + step : step, n = state.riff[ri];
  if (state.mix.riff && n) pluck(t, OPEN[n.s] + n.f, beat * .5, .3, 3200);
  queue.push({t, bar, step: ri});
}
function schedule(){
  while (nextT < ctx.currentTime + .12){
    playStep(stepI, barI, nextT);
    stepI++;
    if (stepI >= 8){ stepI = 0; barI = (barI + 1) % prog().ch.length; barStart += 4 * 60 / state.bpm; }
    nextT = barStart + stepOffset(stepI);
  }
}
function tick(){
  if (!state.playing) return;
  let last = null;
  while (queue.length && queue[0].t <= ctx.currentTime) last = queue.shift();
  if (last){
    const barChanged = last.bar % prog().ch.length !== state.sel;
    state.step = last.step; state.sel = last.bar % prog().ch.length;
    if (barChanged) paintChord();
    paintHit();
  }
  raf = requestAnimationFrame(tick);
}
function startPlay(){
  ensureCtx(); queue.length = 0; stepI = 0; barI = 0; barStart = ctx.currentTime + .12; nextT = barStart;
  state.playing = true; state.step = -1;
  timer = setInterval(schedule, 25); schedule(); raf = requestAnimationFrame(tick);
  $('playtxt').textContent = 'Stop'; $('playicon').innerHTML = '&#9632;';
}
function stopPlay(){
  state.playing = false; clearInterval(timer); cancelAnimationFrame(raf); queue.length = 0; state.step = -1;
  $('playtxt').textContent = 'Play backing track'; $('playicon').innerHTML = '&#9654;'; paintHit();
}
function audition(s, f){ ensureCtx(); pluck(ctx.currentTime + .01, OPEN[s] + f, .6, .32, 3200); }

/* ---------- wiring ---------- */
KEYS.forEach((k, i) => $('key').add(new Option(k[0], i)));
Object.entries(SCALES).forEach(([id, s]) => $('scale').add(new Option(s.name, id)));
Object.entries(PROGS).forEach(([id, p]) => $('prog').add(new Option(p.name, id)));
Object.entries(RECIPES).forEach(([id, r], i) => { if (!i) $('recipe').add(new Option('Load a riff recipe…', '')); $('recipe').add(new Option(r.name, id)); });
$('key').value = state.key; $('scale').value = state.scale; $('prog').value = state.prog;

const PKEY = 'riff';
function save(){
  const o = {key:state.key, scale:state.scale, prog:state.prog, feel:state.feel, bpm:state.bpm, view:state.view, len:state.len, labels:state.labels, riff:state.riff, recipe:state.recipe || null};
  try { localStorage.setItem('osb:' + PKEY, JSON.stringify(o)); } catch (e) {}
}
function load(){
  try {
    const o = JSON.parse(localStorage.getItem('osb:' + PKEY) || 'null'); if (!o) return false;
    if (typeof o.key === 'number' && o.key >= 0 && o.key < 12) state.key = o.key;
    if (SCALES[o.scale]) state.scale = o.scale;
    if (PROGS[o.prog]) state.prog = o.prog;
    if (o.feel === 'shuffle' || o.feel === 'straight') state.feel = o.feel;
    if (typeof o.bpm === 'number') state.bpm = Math.max(60, Math.min(160, o.bpm));
    if (o.view === 'chord' || o.view === 'scale') state.view = o.view;
    if (o.len === 8 || o.len === 16) state.len = o.len;
    if (['names','ivs','role','none'].includes(o.labels)) state.labels = o.labels;
    if (Array.isArray(o.riff) && o.riff.length === state.len) state.riff = o.riff.map(n => n && typeof n.s === 'number' && typeof n.f === 'number' ? {s:n.s, f:n.f} : null);
    state.recipe = o.recipe && RECIPES[o.recipe] ? o.recipe : null;
    return true;
  } catch (e) { return false; }
}
function refreshAll(){ renderStrip(); renderPositions(); renderFretboard(); renderTab(); }
$('key').onchange = e => { state.key = +e.target.value; renderStrip(); renderFretboard(); if (state.recipe) loadRecipe(state.recipe); };
$('scale').onchange = e => { state.scale = e.target.value; state.pos = 0; renderPositions(); renderFretboard(); };
$('prog').onchange = e => {
  state.prog = e.target.value; const p = prog();
  state.scale = p.scale; state.feel = p.feel; state.bpm = p.bpm; state.sel = 0; state.pos = 0;
  $('scale').value = p.scale; $('feel').value = p.feel; $('bpm').value = p.bpm; $('bpmout').textContent = p.bpm;
  refreshAll();
};
$('feel').onchange = e => { state.feel = e.target.value; save(); };
$('bpm').oninput = e => { state.bpm = +e.target.value; $('bpmout').textContent = state.bpm; save(); };
$('vol').oninput = e => { state.vol = e.target.value / 100; if (master) master.gain.value = state.vol; };
[['mDrums','drums'],['mBass','bass'],['mChords','chords'],['mRiff','riff']].forEach(([id, k]) => $(id).onchange = e => { state.mix[k] = e.target.checked; paintHit(); });
$('play').onclick = () => state.playing ? stopPlay() : startPlay();
$('strip').onclick = e => { const b = e.target.closest('.rl-bar'); if (!b) return; state.sel = +b.dataset.i; paintChord(); };
$('positions').onclick = e => { const b = e.target.closest('button'); if (!b) return; state.pos = +b.dataset.p; renderPositions(); renderFretboard(); };
function setLabels(l){
  state.labels = l;
  $('labels').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x.dataset.l === l)); renderFretboard();
}
$('labels').onclick = e => { const b = e.target.closest('button'); if (b) setLabels(b.dataset.l); };
$('views').onclick = e => {
  const b = e.target.closest('button'); if (!b) return; state.view = b.dataset.v;
  $('views').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
  if (state.view === 'chord') setLabels('role'); else if (state.labels === 'role') setLabels('names'); else renderFretboard();
};
$('board').onclick = e => {
  const g = e.target.closest('.n'); if (!g) return;
  const s = +g.dataset.s, f = +g.dataset.f; audition(s, f); state.recipe = null; $('recipe').value = '';
  setStep(state.cursor, {s, f});
};
$('tab').onclick = e => { const c = e.target.closest('.rl-cell'); if (!c) return; state.cursor = +c.dataset.step; paintHit(); const n = state.riff[state.cursor]; if (n) audition(n.s, n.f); };
$('recipe').onchange = e => { if (!e.target.value) return; state.recipe = e.target.value; loadRecipe(state.recipe); };
$('rest').onclick = () => { state.recipe = null; setStep(state.cursor, null); };
$('clearStep').onclick = () => { state.recipe = null; state.riff[state.cursor] = null; renderTab(); renderFretboard(); };
$('clearAll').onclick = () => { state.recipe = null; $('recipe').value = ''; state.riff = Array(state.len).fill(null); state.cursor = 0; renderTab(); renderFretboard(); };

$('rlen').onclick = e => {
  const b = e.target.closest('button'); if (!b) return; const n = +b.dataset.n; if (n === state.len) return;
  if (n === 16) state.riff = state.riff.slice(0, 8).concat(state.riff.slice(0, 8).map(x => x && {s:x.s, f:x.f})); else state.riff = state.riff.slice(0, 8);
  state.len = n; if (state.cursor >= n) state.cursor = 0;
  $('rlen').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', +x.dataset.n === n));
  if (state.recipe) loadRecipe(state.recipe); else { renderTab(); renderFretboard(); }
};

/* song hookup: the songbook tells us which song is open */
let songInfo = null;
function paintMatch(){
  const b = $('match'); if (!songInfo){ b.hidden = true; return; }
  b.hidden = false; b.textContent = 'Match ' + songInfo.short + ': key of ' + KEYS[songInfo.key][0] + ', ' + songInfo.bpm + ' BPM';
}
$('match').onclick = () => {
  if (!songInfo) return;
  state.key = songInfo.key; state.bpm = Math.max(60, Math.min(160, songInfo.bpm));
  $('key').value = state.key; $('bpm').value = state.bpm; $('bpmout').textContent = state.bpm;
  renderStrip(); renderFretboard(); if (state.recipe) loadRecipe(state.recipe);
};
document.addEventListener('visibilitychange', () => { if (document.hidden) stopPlay(); });
window.RiffLab = {
  hide(){ if (state.playing) stopPlay(); },
  song(s){ songInfo = s && typeof s.key === 'number' ? {short:s.short || s.title, key:((s.key % 12) + 12) % 12, bpm:s.bpm || 90} : null; paintMatch(); }
};

const had = load();
$('key').value = state.key; $('scale').value = state.scale; $('prog').value = state.prog; $('feel').value = state.feel;
$('bpm').value = state.bpm; $('bpmout').textContent = state.bpm;
$('views').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x.dataset.v === state.view));
$('labels').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x.dataset.l === state.labels));
$('rlen').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', +x.dataset.n === state.len));
$('recipe').value = state.recipe || '';
refreshAll();
if (!had) { state.recipe = 'chug'; $('recipe').value = 'chug'; loadRecipe('chug'); }


})();
