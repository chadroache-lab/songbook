/* Open Mic Songbook app. Everything the person adds (lyrics, ticks, settings, recordings) stays on this device. */
(function () {
  'use strict';
  var APP_VERSION = '1.1.1';

  /* ---------- small helpers ---------- */
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function safeUrl(u) { return (typeof u === 'string' && /^https?:\/\//i.test(u)) ? u : ''; }
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem('osb:' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('osb:' + k, JSON.stringify(v)); } catch (e) { toast('This phone is out of storage for the app. Delete old takes to make room.'); } },
    del: function (k) { try { localStorage.removeItem('osb:' + k); } catch (e) {} }
  };
  var toastTimer = 0;
  function toast(msg, actionText, action) {
    var t = $('toast');
    t.innerHTML = esc(msg) + (actionText ? '<button type="button">' + esc(actionText) + '</button>' : '');
    t.hidden = false;
    if (actionText) t.querySelector('button').onclick = function () { t.hidden = true; action(); };
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, actionText ? 15000 : 3500);
  }
  function fmtSize(b) { return b >= 1073741824 ? (b / 1073741824).toFixed(1) + ' GB' : b >= 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB'; }
  function fmtDur(s) { s = Math.max(0, Math.round(s || 0)); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  function fmtDate(ms) {
    try { return new Date(ms).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }); }
    catch (e) { return ''; }
  }
  function armed(btn, label, ms) {
    /* two-tap confirm: returns true on the second tap */
    if (btn.getAttribute('data-armed') === '1') { btn.removeAttribute('data-armed'); return true; }
    var orig = btn.textContent;
    btn.setAttribute('data-armed', '1'); btn.textContent = label;
    setTimeout(function () { if (btn.getAttribute('data-armed') === '1') { btn.removeAttribute('data-armed'); btn.textContent = orig; } }, ms || 4000);
    return false;
  }

  /* ---------- music theory ---------- */
  var SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  var FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  var KEYLABEL = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
  var FLATKEYS = [1, 3, 5, 8, 10];
  var NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  var ROMAN = { I: 0, II: 2, III: 4, IV: 5, V: 7, VI: 9, VII: 11 };
  var ROMNUM = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7 };
  var degCache = {};
  function parseDeg(s) {
    if (degCache[s] !== undefined) return degCache[s];
    var m = /^([b#]?)(VII|VI|V|IV|III|II|I|vii|vi|v|iv|iii|ii|i)(.*)$/.exec(String(s));
    var out = null;
    if (m) {
      var acc = m[1], rn = m[2], suf = m[3] || '', up = rn.toUpperCase(), minor = rn !== up, q;
      if (/^[a-z0-9()+°#]*$/i.test(suf)) {
        if (suf === '°' || suf === 'dim') q = 'dim';
        else if (minor) q = suf === '' ? 'm' : (suf.charAt(0) === 'm' && suf.indexOf('maj') !== 0 ? suf : 'm' + suf);
        else q = suf;
        var num = acc + ROMNUM[up];
        out = {
          o: ((ROMAN[up] + (acc === 'b' ? -1 : acc === '#' ? 1 : 0)) % 12 + 12) % 12,
          q: q, flat: acc === 'b',
          n: num + (minor ? q : (q === '7' ? '(7)' : q))
        };
      }
    }
    degCache[s] = out;
    return out;
  }
  function spell(pc, preferFlat) { return (preferFlat ? FLAT : SHARP)[((pc % 12) + 12) % 12]; }
  /* Spell a note the way a player expects in a key: notes of the key follow its key signature,
     borrowed b2, b3, b6 and b7 notes use flats, and #4 uses a sharp unless the key uses flats. */
  function spellIn(pc, key) {
    pc = ((pc % 12) + 12) % 12; key = ((key % 12) + 12) % 12;
    var r = (pc - key + 12) % 12, flatKey = FLATKEYS.indexOf(key) > -1;
    if ([1, 3, 8, 10].indexOf(r) > -1) return FLAT[pc];
    return (flatKey ? FLAT : SHARP)[pc];
  }
  function chordFromDeg(deg, shapeKey) {
    var d = parseDeg(deg);
    if (!d) return '?';
    return spellIn(shapeKey + d.o, shapeKey) + d.q;
  }
  var CHORD_RE = /^([A-G])([#b]?)([^\/\s]*)(?:\/([A-G])([#b]?))?$/;
  var QUAL_RE = /^(maj|min|dim|aug|sus|add|m|M|\d|\+|°|ø|\(|\)|-|b|#)*$/;
  function parseChord(tok) {
    var m = CHORD_RE.exec(tok);
    if (!m || !QUAL_RE.test(m[3])) return null;
    return {
      pc: (NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + 12) % 12,
      q: m[3],
      bass: m[4] ? (NOTE[m[4]] + (m[5] === '#' ? 1 : m[5] === 'b' ? -1 : 0) + 12) % 12 : null
    };
  }
  function transposeChord(tok, semis, targetKey) {
    if (!semis) return tok;
    var c = parseChord(tok);
    if (!c) return tok;
    return spellIn(c.pc + semis, targetKey) + c.q + (c.bass !== null ? '/' + spellIn(c.bass + semis, targetKey) : '');
  }

  /* ---------- chord diagrams ---------- */
  var OPEN = {
    'E': '022100', 'E7': '020100', 'Em': '022000', 'Em7': '020000', 'Esus4': '022200', 'Emaj7': '021100',
    'A': 'x02220', 'A7': 'x02020', 'Am': 'x02210', 'Am7': 'x02010', 'Asus2': 'x02200', 'Asus4': 'x02230', 'Amaj7': 'x02120',
    'D': 'xx0232', 'D7': 'xx0212', 'Dm': 'xx0231', 'Dm7': 'xx0211', 'Dsus2': 'xx0230', 'Dsus4': 'xx0233', 'Dmaj7': 'xx0222',
    'C': 'x32010', 'C7': 'x32310', 'Cmaj7': 'x32000', 'Csus2': 'x30013',
    'G': '320003', 'G7': '320001', 'Gmaj7': '320002', 'Gsus2': '300233',
    'F': { f: '133211', b: 1 }, 'Fmaj7': 'xx3210',
    'B7': 'x21202', 'Esus2': '024400'
  };
  var EFORM = { '': [0, 2, 2, 1, 0, 0], 'm': [0, 2, 2, 0, 0, 0], '7': [0, 2, 0, 1, 0, 0], 'm7': [0, 2, 0, 0, 0, 0], 'sus4': [0, 2, 2, 2, 0, 0] };
  var AFORM = { '': [-1, 0, 2, 2, 2, 0], 'm': [-1, 0, 2, 2, 1, 0], '7': [-1, 0, 2, 0, 2, 0], 'm7': [-1, 0, 2, 0, 1, 0], 'sus2': [-1, 0, 2, 2, 0, 0], 'sus4': [-1, 0, 2, 2, 3, 0], 'maj7': [-1, 0, 2, 1, 2, 0] };
  function shapeFor(name) {
    var base = name.split('/')[0];
    var o = OPEN[base];
    if (o) {
      var fs = typeof o === 'string' ? o : o.f;
      return { f: fs.split('').map(function (c) { return c === 'x' ? -1 : parseInt(c, 10); }), b: typeof o === 'string' ? 0 : o.b };
    }
    var c = parseChord(base);
    if (!c) return null;
    var cands = [];
    if (EFORM[c.q]) cands.push({ r: (c.pc - 4 + 12) % 12, t: EFORM[c.q] });
    if (AFORM[c.q]) cands.push({ r: (c.pc - 9 + 12) % 12, t: AFORM[c.q] });
    if (!cands.length) return null;
    cands.sort(function (a, b) { return a.r - b.r; });
    var best = cands[0];
    return { f: best.t.map(function (v) { return v < 0 ? -1 : v + best.r; }), b: best.r };
  }
  function svgFor(name) {
    var d = shapeFor(name);
    if (!d) return null;
    var fr = d.f, played = fr.filter(function (v) { return v > 0; });
    var mx = played.length ? Math.max.apply(null, played) : 0, mn = played.length ? Math.min.apply(null, played) : 1;
    var base = mx > 5 ? mn : 1;
    var X0 = 14, DX = 11.2, Y0 = 26, DY = 15, i;
    var s = '<svg viewBox="0 0 84 114" role="img" aria-label="' + esc(name) + ' chord diagram" fill="none" stroke="currentColor">';
    if (base === 1) s += '<line x1="' + X0 + '" y1="' + Y0 + '" x2="' + (X0 + 5 * DX) + '" y2="' + Y0 + '" stroke-width="3"/>';
    else s += '<text x="' + (X0 + 5 * DX + 4) + '" y="' + (Y0 + DY * 0.7) + '" font-size="9" fill="currentColor" stroke="none" font-family="IBM Plex Mono, monospace">' + base + 'fr</text>';
    for (i = 0; i <= 5; i++) s += '<line x1="' + X0 + '" y1="' + (Y0 + i * DY) + '" x2="' + (X0 + 5 * DX) + '" y2="' + (Y0 + i * DY) + '" stroke-width="0.8" opacity="0.55"/>';
    for (i = 0; i < 6; i++) s += '<line x1="' + (X0 + i * DX) + '" y1="' + Y0 + '" x2="' + (X0 + i * DX) + '" y2="' + (Y0 + 5 * DY) + '" stroke-width="0.9" opacity="0.75"/>';
    var bi = [];
    if (d.b) fr.forEach(function (v, j) { if (v === d.b) bi.push(j); });
    var barre = d.b && bi.length > 1;
    if (barre) {
      var y = Y0 + (d.b - base + 0.5) * DY;
      s += '<rect x="' + (X0 + bi[0] * DX - 4) + '" y="' + (y - 4.5) + '" width="' + ((bi[bi.length - 1] - bi[0]) * DX + 8) + '" height="9" rx="4.5" fill="currentColor" stroke="none"/>';
    }
    fr.forEach(function (v, j) {
      var x = X0 + j * DX;
      if (v === -1) s += '<text x="' + x + '" y="' + (Y0 - 8) + '" font-size="10" text-anchor="middle" fill="currentColor" stroke="none" font-family="IBM Plex Mono, monospace">x</text>';
      else if (v === 0) s += '<circle cx="' + x + '" cy="' + (Y0 - 10) + '" r="3.2" stroke-width="1"/>';
      else if (!(barre && v === d.b)) s += '<circle cx="' + x + '" cy="' + (Y0 + (v - base + 0.5) * DY) + '" r="4.4" fill="currentColor" stroke="none"/>';
    });
    return { svg: s + '</svg>', barre: barre };
  }

  /* ---------- songs ---------- */
  var BUILTIN = (window.SONGBOOK_SONGS || []).slice();
  function imported() { var v = store.get('imported', []); return Array.isArray(v) ? v : []; }
  function allSongs() {
    var imp = imported(), ids = {};
    imp.forEach(function (s) { ids[s.id] = s; });
    var list = BUILTIN.map(function (s) { return ids[s.id] ? Object.assign({ _updated: true }, ids[s.id]) : s; });
    imp.forEach(function (s) { if (!BUILTIN.some(function (b) { return b.id === s.id; })) list.push(Object.assign({ _imported: true }, s)); });
    return list;
  }
  var SONGS = allSongs();
  var song = SONGS[0] || null;
  var state = { key: 0, capo: 0, bpm: 80, pat: 0 };
  function sk(k) { return song.id + ':' + k; }
  function shapeKey() { return ((state.key - state.capo) % 12 + 12) % 12; }

  /* ---------- strum patterns ---------- */
  var STEPS = ['1', '&', '2', '&', '3', '&', '4', '&'];
  var PATTERNS = [
    { name: 'Boom-chuck', cells: ['B', '', 'D', '', 'B', '', 'D', ''],
      how: 'Bass note on 1 (the chord root), brush the top strings on 2, a second bass note on 3, brush again on 4. Best under quiet verses.',
      legend: 'B = bass note · ↓ = light downstrum on the top strings.' },
    { name: 'Steady ballad', cells: ['D', '', 'D', 'U', '', 'U', 'D', 'U'],
      how: 'Down on 1, down-up on 2, up on the "and" of 3, down-up on 4. Keep your hand swinging through the gaps and just miss the strings.',
      legend: '↓ = downstrum · ↑ = upstrum · blank = hand keeps moving, no strings hit.' },
    { name: 'Arpeggio', cells: ['R', '3', '2', '1', 'R', '3', '2', '3'],
      how: 'Thumb takes the bass note, then roll through strings 3, 2 and 1 and back down. Good for intros and quiet verses.',
      legend: 'R = root on a bass string · numbers = which string to pick.' }
  ];
  function pats() { return (song.patterns || []).concat(PATTERNS); }

  /* ---------- rendering: header and chart ---------- */
  function renderSongTabs() {
    $('songTabs').innerHTML = SONGS.map(function (s, i) {
      return '<button class="tab" role="tab" type="button" data-i="' + i + '" aria-selected="' + (s.id === song.id) + '">' + esc(s.short || s.title) + '</button>';
    }).join('');
    var sel = $('songTabs').querySelector('[aria-selected="true"]');
    if (sel && sel.scrollIntoView) { try { sel.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) {} }
  }
  function renderHeader() {
    var parts = [song.artist, song.year, song.writers ? 'written by ' + song.writers : ''].filter(Boolean);
    $('byline').textContent = parts.join(' · ');
    $('songTitle').textContent = song.title;
    var f = [['Original key', KEYLABEL[song.key]], ['Tempo', song.bpm + ' BPM'], ['Time', song.time || '4/4'], ['Tuning', song.tuning || 'Standard']];
    if (song.alt) f.push(['Alt. way to play it', song.alt]);
    $('facts').innerHTML = f.map(function (x) { return '<div class="fact"><small>' + esc(x[0]) + '</small><b>' + esc(x[1]) + '</b></div>'; }).join('');
    document.title = song.title + ' · Songbook';
  }
  function keyOptions(orig) {
    var out = '';
    for (var i = 0; i < 12; i++) out += '<option value="' + i + '">' + KEYLABEL[i] + (i === orig ? ' (original)' : '') + '</option>';
    return out;
  }
  function renderKeySelect() {
    $('keySel').innerHTML = keyOptions(song.key);
    $('keySel').value = String(state.key);
    $('capoSel').value = String(state.capo);
  }
  function renderMap() {
    var k = shapeKey();
    $('songMap').innerHTML = (song.sections || []).map(function (s) {
      return '<div class="sect"><div><h3>' + esc(s.name) + '</h3>' + (s.note ? '<p class="note">' + esc(s.note) + '</p>' : '') + '</div><div class="lines">' +
        (s.lines || []).map(function (line) {
          return '<div class="line">' + line.map(function (deg) {
            var d = parseDeg(deg);
            return '<div class="chip"><b>' + esc(chordFromDeg(deg, k)) + '</b><i>' + esc(d ? d.n : deg) + '</i></div>';
          }).join('') + '</div>';
        }).join('') + '</div></div>';
    }).join('');
    var name = spell(k, FLATKEYS.indexOf(k) > -1);
    var txt = 'Playing <b>' + esc(name) + '</b> shapes' + (state.capo > 0 ? ' with the capo on fret <b>' + state.capo + '</b>' : ' with no capo') + '. It sounds in the key of <b>' + KEYLABEL[state.key] + '</b>.';
    if (state.key === song.key && state.capo === 0) txt += ' This is the key of the record.';
    $('keyReadout').innerHTML = txt;
    $('chartNote').textContent = song.chartNote || '';
  }
  function uniqueChords() {
    var seen = {}, list = [], k = shapeKey();
    (song.sections || []).forEach(function (s) { (s.lines || []).forEach(function (l) { l.forEach(function (deg) {
      var n = chordFromDeg(deg, k);
      if (!seen[n]) { seen[n] = 1; list.push(n); }
    }); }); });
    return list;
  }
  function renderShapes() {
    var names = uniqueChords();
    $('shapeGrid').innerHTML = names.map(function (n) {
      var d = svgFor(n);
      return '<figure class="shape"><figcaption>' + esc(n) + '</figcaption>' + (d ? d.svg + (d.barre ? '<p>Barre chord</p>' : '') : '<p>No diagram stored. Look this one up on a chord site.</p>') + '</figure>';
    }).join('');
    $('shapesSub').textContent = 'The ' + names.length + ' chords in this song for your key and capo. Open circle means ring the string, x means skip it.';
  }
  function renderPattern() {
    var P = pats();
    if (!(state.pat < P.length)) state.pat = 0;
    var p = P[state.pat];
    $('patTabs').innerHTML = P.map(function (x, i) {
      return '<button class="tab" role="tab" type="button" data-i="' + i + '" aria-selected="' + (i === state.pat) + '">' + esc(x.name) + '</button>';
    }).join('');
    $('patGrid').innerHTML = p.cells.map(function (c, i) {
      var sym = c === 'D' ? '↓' : c === 'U' ? '↑' : c;
      return '<div class="cell' + (i % 2 === 0 ? ' beat' : '') + '"><small>' + STEPS[i] + '</small><span>' + esc(sym) + '</span></div>';
    }).join('');
    $('patHow').textContent = p.how + (song.patNote && p.name === 'Arpeggio' ? ' ' + song.patNote : '');
    $('patLegend').textContent = p.legend || '';
  }
  function tempoSteps() {
    var r = function (x) { return Math.round(song.bpm * x / 2) * 2; };
    return [r(0.68), r(0.82), r(0.92), song.bpm];
  }
  function renderPresets() {
    var v = tempoSteps();
    $('presets').innerHTML = v.map(function (b, i) { return '<button class="tab" type="button" data-bpm="' + b + '">' + b + (i === 3 ? ' record' : '') + '</button>'; }).join('');
    $('metroSub').textContent = 'Start under tempo and work up. The record sits at ' + song.bpm + ' BPM.';
  }

  /* ---------- prep ---------- */
  function renderLinks() {
    $('linkGrid').innerHTML = (song.links || []).map(function (g) {
      return '<div><h3>' + esc(g.h) + '</h3><ul>' + (g.items || []).map(function (it) {
        var u = safeUrl(it.u);
        return u ? '<li><a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(it.t) + '</a>' + (it.d ? '<span>' + esc(it.d) + '</span>' : '') + '</li>' : '';
      }).join('') + '</ul></div>';
    }).join('') || '<p class="empty">No links for this song yet.</p>';
  }
  function planItems() {
    var t = tempoSteps();
    return [
      ['Chords on their own', 'Switch between each pair of chords in the song map for two minutes, one chord per click, ringing every string.'],
      ['Slow strum at ' + t[0] + ' BPM', 'First verse only, until the changes land on the beat.'],
      ['Whole song at ' + t[1] + ' BPM', 'Play through without stopping, even after a slip. Rejoin on the next line.'],
      ['Add the vocal', 'Sing and play at ' + t[1] + ' BPM. If the words and your hand fight, speak the words in rhythm first.'],
      ['Climb to ' + song.bpm + ' BPM', 'Raise the tempo 4 BPM at a time, after two clean run-throughs in a row.'],
      ['Record a take and listen back', 'Use the Play tab. Listen for rushing, dropped chords and where your voice strains.'],
      ['Play with a backing track', 'Load a karaoke or instrumental version on the Play tab. Start it at 0.85× speed, then work up to full speed.'],
      ['Perform it standing up', 'Stand, wear the strap, use Stage view for the lyrics, and play it top to bottom.'],
      ['Three clean run-throughs', 'Do this the day before. Then stop practicing the song and rest your hands.']
    ];
  }
  var GEAR = [
    ['Tuner and capo', 'Tune before you leave home and again quietly before you start.'],
    ['Spare strings and picks', 'A broken string mid-song is common. Have a spare set and a few picks in your pocket.'],
    ['Strap and cable', 'Bring a cable if the room plugs in. Ask first.'],
    ['Phone charged, in Stage view', 'Open the Lyrics tab, tap Stage view, and set the text size before you go up.'],
    ['Water', 'Singing dries your throat.']
  ];
  var HOST = [
    ['How long is the slot?', 'Number of songs or minutes. Plan one extra song in case there is time.'],
    ['Where do I sign up and when?', 'Sign-up lists often fill before the music starts.'],
    ['Is there a sound check?', 'Ask where to stand and whether the guitar goes through a direct box.'],
    ['Where can I tune?', 'Find a quiet corner so you are not tuning on stage.']
  ];
  var STAGE = [
    ['Set the mic height and guitar volume', 'Do it before the first chord so you are not fixing it mid-song.'],
    ['Count in silently', 'Tap four beats on your leg. The tempo lives in your hand.'],
    ['Start with a clean first chord', 'A solid first chord sets the whole song.'],
    ['If you lose your place, keep strumming', 'Hold the chord you are on and rejoin at the next line.'],
    ['Let the last chord ring', 'Hold it, look up, then stop your hand.']
  ];
  function checklist(id, key, items) {
    var saved = store.get('ck:' + key, {});
    $(id).innerHTML = items.map(function (it, i) {
      var cid = 'ck-' + id + '-' + i;
      return '<label class="check" for="' + cid + '"><input type="checkbox" id="' + cid + '" data-p="' + esc(key) + '" data-i="' + i + '"' + (saved[i] ? ' checked' : '') + '><div><b>' + esc(it[0]) + '</b><span>' + esc(it[1]) + '</span></div></label>';
    }).join('');
  }
  function renderPrep() {
    checklist('planList', 'plan:' + song.id, planItems());
    checklist('listGear', 'gear', GEAR);
    checklist('listHost', 'host', HOST);
    checklist('listStage', 'stage', STAGE);
    renderLinks();
  }

  /* ---------- lyrics ---------- */
  var HEAD_RE = /^\s*[\(\[]?\s*(verse|chorus|bridge|intro|outro|pre-?chorus|refrain|solo|interlude|tag|ending|coda|instrumental|break|hook|turnaround)\b[^\]\)]{0,30}[\)\]]?\s*:?\s*$/i;
  var CHORD_LINE_EXTRA = /^(\||-+|x\d+|\(x\d+\)|n\.?c\.?|\(|\)|\/)$/i;
  function isChordLine(line) {
    var toks = line.trim().split(/\s+/);
    if (!toks[0]) return false;
    var chords = 0;
    for (var i = 0; i < toks.length; i++) {
      if (parseChord(toks[i])) chords++;
      else if (!CHORD_LINE_EXTRA.test(toks[i])) return false;
    }
    return chords > 0;
  }
  function transposeChordLine(line, semis, target) {
    if (!semis) return line;
    var out = '', i = 0, debt = 0;
    while (i < line.length) {
      if (line[i] === ' ') {
        if (debt > 0 && line[i + 1] === ' ') { debt--; i++; continue; }
        out += ' '; i++; continue;
      }
      var j = i;
      while (j < line.length && line[j] !== ' ') j++;
      var tok = line.slice(i, j), nt = parseChord(tok) ? transposeChord(tok, semis, target) : tok;
      out += nt;
      var diff = nt.length - tok.length;
      if (diff > 0) debt += diff;
      else if (diff < 0) out += new Array(-diff + 1).join(' ');
      i = j;
    }
    return out;
  }
  function renderInlineLine(line, semis, target) {
    var re = /\[([^\]]+)\]/g, m, last = 0, html = '', pending = 0;
    while ((m = re.exec(line))) {
      var text = line.slice(last, m.index);
      html += esc(text);
      if (pending && text.length < pending) html += '<span class="pad" style="width:' + ((pending - text.length) * 0.5) + 'em"></span>';
      var tok = m[1].trim();
      if (parseChord(tok)) {
        var name = transposeChord(tok, semis, target);
        html += '<span class="ch"><b>' + esc(name) + '</b></span>';
        pending = name.length + 1;
      } else {
        html += esc(m[0]); pending = 0;
      }
      last = re.lastIndex;
    }
    var rest = line.slice(last);
    html += esc(rest);
    if (pending && rest.length < pending) html += '<span class="pad" style="width:' + ((pending - rest.length) * 0.5) + 'em"></span>';
    return html;
  }
  function renderLyricsView() {
    var text = store.get(sk('lyrics'), '');
    var lyrKey = store.get(sk('lyrKey'), song.lyricsKey != null ? song.lyricsKey : song.key);
    $('lyrKeySel').innerHTML = keyOptions(song.key);
    $('lyrKeySel').value = String(lyrKey);
    var k = shapeKey(), semis = ((k - lyrKey) % 12 + 12) % 12;
    $('lyrReadout').innerHTML = semis
      ? 'Chords shown as your shapes in <b>' + esc(spell(k, FLATKEYS.indexOf(k) > -1)) + '</b>' + (state.capo ? ' with the capo on <b>' + state.capo + '</b>' : '') + '. Change the key or capo on the Chart tab.'
      : 'Chords shown as written.' + (state.capo ? ' Capo on <b>' + state.capo + '</b>.' : '');
    var u = safeUrl(song.lyricsUrl);
    $('lyrLink').hidden = !u;
    if (u) $('lyrLink').href = u;
    $('lyrHelp').textContent = song.lyricsHelp || '';
    $('lyricsBox').value = text;
    var host = $('lyrRead');
    if (!text.trim()) {
      host.innerHTML = '<div class="panel lyr-empty"><h3>No lyrics yet</h3><p class="empty">Tap <b>Edit</b>, then paste the lyrics and chords from your source. They stay on this phone and are never uploaded.</p></div>';
      return;
    }
    var lines = text.replace(/\r\n?/g, '\n').split('\n');
    var hasChordLines = lines.some(function (l) { return l.indexOf('[') === -1 && isChordLine(l); });
    var html = lines.map(function (l) {
      if (!l.trim()) return '<div class="ln">&nbsp;</div>';
      if (HEAD_RE.test(l)) return '<div class="ln head">' + esc(l.trim().replace(/^[\(\[]|[\)\]]$/g, '')) + '</div>';
      if (/\[[^\]]+\]/.test(l)) return '<div class="ln inl">' + renderInlineLine(l, semis, k) + '</div>';
      if (isChordLine(l)) return '<div class="ln cline">' + esc(transposeChordLine(l, semis, k)) + '</div>';
      return '<div class="ln' + (hasChordLines ? ' lyr' : '') + '">' + esc(l) + '</div>';
    }).join('');
    host.innerHTML = '<div class="sheet" id="sheet">' + html + '</div>';
    applyFont();
  }
  var lyrSize = store.get('lyrSize', 19);
  function applyFont() { var s = $('sheet'); if (s) s.style.setProperty('--lyr-size', lyrSize + 'px'); }
  function setEditing(on) {
    $('lyrEdit').hidden = !on; $('lyrRead').hidden = on;
    $('editBtn').textContent = on ? 'Preview' : 'Edit';
    if (on) { stopScroll(); setTimeout(function () { $('lyricsBox').focus(); }, 50); }
    else renderLyricsView();
  }

  /* ---------- auto-scroll and stage view ---------- */
  var scrolling = false, sraf = 0, slast = 0, spos = 0, wake = null;
  function pps() { var v = parseInt($('scrollSpeed').value, 10) || 3; return 4 + (v - 1) * 6; }
  function atBottom() { return window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2; }
  function wakeOn() { try { if (navigator.wakeLock && !wake) navigator.wakeLock.request('screen').then(function (w) { wake = w; w.addEventListener('release', function () { wake = null; }); }).catch(function () {}); } catch (e) {} }
  function wakeOff() { if (stageOn || playing || recording) return; try { if (wake) { wake.release(); wake = null; } } catch (e) {} }
  function paintScroll() {
    var t = scrolling ? 'Pause' : 'Auto-scroll';
    $('scrollBtn').textContent = t; $('stageScroll').textContent = t;
    $('scrollBtn').setAttribute('aria-pressed', scrolling ? 'true' : 'false');
  }
  function stepScroll(ts) {
    if (!scrolling) return;
    var dt = slast ? Math.min(0.1, (ts - slast) / 1000) : 0;
    slast = ts; spos += pps() * dt;
    window.scrollTo(0, spos);
    if (atBottom()) { stopScroll(); return; }
    sraf = requestAnimationFrame(stepScroll);
  }
  function startScroll() {
    if (!$('lyrEdit').hidden) setEditing(false);
    if (!$('sheet')) { toast('Add lyrics first: tap Edit and paste them.'); return; }
    if (atBottom()) window.scrollTo(0, $('lyrRead').offsetTop - 70);
    spos = window.scrollY; slast = 0; scrolling = true;
    wakeOn(); paintScroll();
    sraf = requestAnimationFrame(stepScroll);
  }
  function stopScroll() { if (!scrolling) return; scrolling = false; cancelAnimationFrame(sraf); paintScroll(); wakeOff(); }
  function toggleScroll() { scrolling ? stopScroll() : startScroll(); }
  var stageOn = false;
  function setStage(on) {
    if (on && !$('sheet')) { toast('Add lyrics first: tap Edit and paste them.'); return; }
    stageOn = on;
    document.body.classList.toggle('stage', on);
    $('stageBar').hidden = !on;
    if (on) { lyrSize = Math.max(lyrSize, 22); applyFont(); wakeOn(); window.scrollTo(0, 0); }
    else { stopScroll(); wakeOff(); }
  }

  /* ---------- audio ---------- */
  var ctx = null;
  function getCtx() {
    if (!ctx) { var C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); }
    if (ctx.state === 'suspended' && ctx.resume) ctx.resume();
    return ctx;
  }
  function audioSession(type) { try { if (navigator.audioSession) navigator.audioSession.type = type; } catch (e) {} }
  function clickAt(t, strong, quiet) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.value = strong ? 1250 : quiet ? 620 : 900;
    var vol = strong ? 0.55 : quiet ? 0.14 : 0.4;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.055);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + 0.07);
  }

  /* ---------- metronome ---------- */
  var playing = false, nextTime = 0, step = 0, timer = 0, raf = 0, queue = [];
  function setBpm(v, save) {
    v = Math.max(40, Math.min(200, Math.round(v)));
    state.bpm = v;
    if (save !== false) store.set(sk('bpm'), v);
    $('bpmBig').textContent = v; $('dockBpm').textContent = v;
    $('bpmRange').value = Math.min(160, v);
  }
  function sched() {
    var eighth = 60 / state.bpm / 2;
    while (nextTime < ctx.currentTime + 0.12) {
      var beat = step % 2 === 0;
      if (beat || $('subOn').checked) clickAt(nextTime, step === 0, !beat);
      queue.push({ t: nextTime, s: step });
      step = (step + 1) % 8;
      nextTime += eighth;
    }
  }
  function lights(s) {
    var cells = $('patGrid').children;
    for (var i = 0; i < cells.length; i++) cells[i].classList.toggle('on', s === i);
    [$('beatDots'), $('dockDots')].forEach(function (g) {
      for (var j = 0; j < g.children.length; j++) g.children[j].classList.toggle('on', s >= 0 && s % 2 === 0 && (s >> 1) === j);
    });
  }
  function draw() {
    if (!playing) return;
    while (queue.length && queue[0].t <= ctx.currentTime) lights(queue.shift().s);
    raf = requestAnimationFrame(draw);
  }
  function startM() {
    if (!getCtx()) { toast('This browser cannot play the metronome.'); return; }
    if (!recording) audioSession('playback');
    playing = true; step = 0; queue = []; nextTime = ctx.currentTime + 0.06;
    timer = setInterval(sched, 25);
    raf = requestAnimationFrame(draw);
    wakeOn(); paintPlay();
  }
  function stopM() {
    if (!playing) return;
    playing = false; clearInterval(timer); cancelAnimationFrame(raf); queue = []; lights(-1);
    paintPlay(); wakeOff();
  }
  function paintPlay() {
    $('playBtn').textContent = playing ? 'Stop' : 'Start';
    $('dockPlay').textContent = playing ? '■' : '▶';
    $('dockPlay').setAttribute('aria-label', playing ? 'Stop metronome' : 'Start metronome');
  }
  var taps = [];
  function tap() {
    var now = Date.now();
    if (taps.length && now - taps[taps.length - 1] > 2000) taps = [];
    taps.push(now);
    if (taps.length > 5) taps.shift();
    if (taps.length >= 2) {
      var sum = 0;
      for (var i = 1; i < taps.length; i++) sum += taps[i] - taps[i - 1];
      setBpm(60000 / (sum / (taps.length - 1)));
    }
  }

  /* ---------- takes: storage ---------- */
  var dbp = null;
  function idb() {
    if (dbp) return dbp;
    dbp = new Promise(function (res, rej) {
      if (!window.indexedDB) { rej(new Error('no-idb')); return; }
      var r = indexedDB.open('songbook', 2);
      r.onupgradeneeded = function () {
        var d = r.result;
        if (!d.objectStoreNames.contains('takes')) d.createObjectStore('takes', { keyPath: 'id' }).createIndex('song', 'song');
        if (!d.objectStoreNames.contains('tracks')) d.createObjectStore('tracks', { keyPath: 'song' });
      };
      r.onsuccess = function () { res(r.result); };
      r.onerror = function () { rej(r.error); };
    });
    dbp.catch(function () { dbp = null; });
    return dbp;
  }
  function idbReq(mode, fn, storeName) {
    storeName = storeName || 'takes';
    return idb().then(function (db) {
      return new Promise(function (res, rej) {
        var t = db.transaction(storeName, mode), st = t.objectStore(storeName), out = fn(st);
        t.oncomplete = function () { res(out && out.result !== undefined ? out.result : undefined); };
        t.onerror = function () { rej(t.error); };
        t.onabort = function () { rej(t.error); };
      });
    });
  }
  function takesFor(id) { return idbReq('readonly', function (st) { return st.index('song').getAll(id); }); }
  function putTake(t) { return idbReq('readwrite', function (st) { return st.put(t); }); }
  function getTake(id) { return idbReq('readonly', function (st) { return st.get(id); }); }
  function delTake(id) { return idbReq('readwrite', function (st) { return st.delete(id); }); }
  function getTrack(id) { return idbReq('readonly', function (st) { return st.get(id); }, 'tracks'); }
  function putTrack(t) { return idbReq('readwrite', function (st) { return st.put(t); }, 'tracks'); }
  function delTrack(id) { return idbReq('readwrite', function (st) { return st.delete(id); }, 'tracks'); }
  function newId() { return 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function askPersist() { try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {} }
  function setTakeStatus(msg, err) { var el = $('takeStatus'); el.textContent = msg || ''; el.classList.toggle('err', !!err); }

  /* ---------- takes: recording ---------- */
  var recording = false, recStarting = false, rec = null, recStream = null, recChunks = [], recT0 = 0, recTimer = 0, recSong = null, recMime = '', meterRaf = 0, analyser = null, recSrc = null, countTimer = 0;
  function pickMime() {
    if (!window.MediaRecorder || !MediaRecorder.isTypeSupported) return '';
    var list = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'];
    for (var i = 0; i < list.length; i++) if (MediaRecorder.isTypeSupported(list[i])) return list[i];
    return '';
  }
  function paintRec() {
    $('recBtn').classList.toggle('on', recording || recStarting);
    $('recBtn').setAttribute('aria-label', recording || recStarting ? 'Stop recording' : 'Start recording');
    $('recDot').hidden = !recording;
  }
  function meter() {
    if (!analyser) return;
    var buf = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(buf);
    var sum = 0;
    for (var i = 0; i < buf.length; i++) { var v = (buf[i] - 128) / 128; sum += v * v; }
    var rms = Math.sqrt(sum / buf.length);
    $('recLevel').style.width = Math.min(100, Math.round(rms * 300)) + '%';
    meterRaf = requestAnimationFrame(meter);
  }
  function cleanupStream() {
    cancelAnimationFrame(meterRaf); clearInterval(recTimer); clearTimeout(countTimer);
    try { if (recSrc) recSrc.disconnect(); } catch (e) {}
    recSrc = null; analyser = null;
    if (recStream) recStream.getTracks().forEach(function (t) { t.stop(); });
    recStream = null;
    $('recLevel').style.width = '0';
    audioSession(playing ? 'playback' : 'auto');
  }
  function startRec(skipCount) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) {
      setTakeStatus('Recording is not available here. On an iPhone, open the app from your home screen, or use "Add a recording file".', true);
      return;
    }
    recStarting = true; paintRec(); setTakeStatus('Asking for the microphone…');
    audioSession('play-and-record');
    getCtx(); /* create or resume audio inside the tap, which iPhones require */
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }).then(function (stream) {
      if (!recStarting) { stream.getTracks().forEach(function (t) { t.stop(); }); return; }
      recStream = stream;
      var c = getCtx();
      if (c) {
        try { recSrc = c.createMediaStreamSource(stream); analyser = c.createAnalyser(); analyser.fftSize = 1024; recSrc.connect(analyser); meter(); } catch (e) {}
      }
      recSong = song.id;
      var go = function () {
        if (!recStarting) return;
        recMime = pickMime();
        try { rec = recMime ? new MediaRecorder(stream, { mimeType: recMime, audioBitsPerSecond: 128000 }) : new MediaRecorder(stream); }
        catch (e) { rec = new MediaRecorder(stream); }
        recChunks = [];
        rec.ondataavailable = function (e) { if (e.data && e.data.size) recChunks.push(e.data); };
        rec.onstop = saveRecording;
        rec.start(1000);
        recording = true; recStarting = false; recT0 = Date.now();
        paintRec(); wakeOn();
        setTakeStatus('Recording. Tap the button again to stop.');
        recTimer = setInterval(function () { $('recTime').textContent = fmtDur((Date.now() - recT0) / 1000); }, 250);
      };
      if (!skipCount && $('countIn').checked && c) {
        var beat = 60 / state.bpm, t0 = c.currentTime + 0.1;
        for (var i = 0; i < 4; i++) clickAt(t0 + i * beat, i === 0, false);
        var n = 0;
        $('recTime').textContent = '1';
        setTakeStatus('Counting in at ' + state.bpm + ' BPM…');
        var tick = function () { n++; if (n < 4) { $('recTime').textContent = String(n + 1); countTimer = setTimeout(tick, beat * 1000); } else { countTimer = setTimeout(go, beat * 1000 - 60); } };
        countTimer = setTimeout(tick, beat * 1000 + 100);
      } else go();
    }).catch(function (e) {
      recStarting = false; paintRec(); cleanupStream();
      setTakeStatus(e && e.name === 'NotAllowedError'
        ? 'Microphone access is off. On an iPhone, go to Settings › Safari › Microphone (or the app\'s settings) and allow it, then try again.'
        : 'The microphone could not start. Close other apps using it and try again.', true);
    });
  }
  function stopRec() {
    if (recStarting && !recording) { recStarting = false; paintRec(); cleanupStream(); $('recTime').textContent = '0:00'; setTakeStatus('Recording cancelled.'); return; }
    if (!recording || !rec) return;
    recording = false; paintRec();
    if (recWithBacking) { var bp = player(); if (bp) bp.pause(); recWithBacking = false; }
    try { rec.stop(); } catch (e) { saveRecording(); }
  }
  function saveRecording() {
    var dur = (Date.now() - recT0) / 1000, songId = recSong, mime = (rec && rec.mimeType) || recMime || 'audio/mp4';
    cleanupStream(); wakeOff();
    $('recTime').textContent = '0:00';
    if (!recChunks.length || dur < 0.5) { setTakeStatus('Nothing was recorded. Try again.', true); return; }
    var blob = new Blob(recChunks, { type: mime.split(';')[0] });
    recChunks = [];
    setTakeStatus('Saving…');
    blob.arrayBuffer().then(function (buf) {
      return putTake({ id: newId(), song: songId, data: buf, type: blob.type, kind: 'audio', size: buf.byteLength, duration: dur, note: $('takeNote').value.trim().slice(0, 200), createdAt: Date.now() });
    }).then(function () {
      askPersist(); $('takeNote').value = '';
      setTakeStatus('Take saved' + (songId !== song.id ? ' to the song you started on.' : '.'));
      renderTakes();
    }).catch(function () { setTakeStatus('That take could not be saved. The phone may be out of storage.', true); });
  }

  /* ---------- takes: list ---------- */
  var takeUrls = [];
  function extFor(type) {
    if (/quicktime/.test(type)) return 'mov';
    if (/^video\/mp4/.test(type)) return 'mp4';
    if (/mp4|m4a|aac/.test(type)) return 'm4a';
    if (/webm/.test(type)) return 'webm';
    if (/ogg/.test(type)) return 'ogg';
    if (/mpeg|mp3/.test(type)) return 'mp3';
    if (/wav/.test(type)) return 'wav';
    return 'audio';
  }
  function renderTakes() {
    var songId = song.id;
    takeUrls.forEach(function (u) { try { URL.revokeObjectURL(u); } catch (e) {} });
    takeUrls = [];
    takesFor(songId).then(function (list) {
      if (songId !== song.id) return;
      list.sort(function (a, b) { return b.createdAt - a.createdAt; });
      $('takesEmpty').textContent = list.length ? '' : 'No takes for this song yet. Tap the red button to record your first.';
      $('takesEmpty').hidden = !!list.length;
      var n = list.length;
      $('takeList').innerHTML = list.map(function (t, i) {
        var url = URL.createObjectURL(new Blob([t.data], { type: t.type || 'audio/mp4' }));
        takeUrls.push(url);
        var media = t.kind === 'video'
          ? '<video controls playsinline preload="metadata" src="' + url + '"></video>'
          : '<audio controls preload="metadata" src="' + url + '"></audio>';
        return '<div class="take panel" data-id="' + esc(t.id) + '">' +
          '<div class="take-head"><b>Take ' + (n - i) + '</b><span>' + esc(fmtDate(t.createdAt)) + '</span>' + (t.duration ? '<span>' + fmtDur(t.duration) + '</span>' : '') + '<span>' + fmtSize(t.size || 0) + '</span></div>' +
          media +
          '<div class="take-tools">' +
            '<input type="text" id="note-' + esc(t.id) + '" maxlength="200" aria-label="Note for take ' + (n - i) + '" value="' + esc(t.note || '') + '" placeholder="Add a note">' +
            '<select id="rate-' + esc(t.id) + '" data-act="rate" aria-label="Playback speed"><option value="0.75">0.75×</option><option value="0.9">0.9×</option><option value="1" selected>1×</option></select>' +
            '<button class="btn sm" type="button" data-act="share">Share</button>' +
            '<button class="btn sm" type="button" data-act="del">Delete</button>' +
          '</div></div>';
      }).join('');
      renderStorage();
    }).catch(function () {
      $('takesEmpty').hidden = false;
      $('takesEmpty').textContent = 'Saved takes are not available in this browser. Try opening the app from your home screen.';
    });
  }
  function renderStorage() {
    if (!navigator.storage || !navigator.storage.estimate) return;
    navigator.storage.estimate().then(function (e) {
      if (!e || !e.usage) return;
      var line = 'The app is using ' + fmtSize(e.usage) + ' on this phone.';
      $('takeMeter').textContent = line;
      $('storageNote').textContent = line;
    }).catch(function () {});
  }
  function shareTake(t, btn) {
    var blob = new Blob([t.data], { type: t.type || 'audio/mp4' });
    var name = (song.short || song.title).replace(/[^\w\- ]+/g, '').trim() + ' take ' + new Date(t.createdAt).toISOString().slice(0, 10) + '.' + extFor(t.type || '');
    var file = null;
    try { file = new File([blob], name, { type: blob.type }); } catch (e) {}
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: name }).catch(function () {});
      return;
    }
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
    btn.textContent = 'Saved'; setTimeout(function () { btn.textContent = 'Share'; }, 1500);
  }
  function importTake(file) {
    if (!file) return;
    var type = file.type || '';
    if (!type) { var ext = (file.name.split('.').pop() || '').toLowerCase(); type = { m4a: 'audio/mp4', mp3: 'audio/mpeg', wav: 'audio/wav', aac: 'audio/aac', mp4: 'video/mp4', mov: 'video/quicktime', webm: 'audio/webm' }[ext] || ''; }
    if (!/^(audio|video)\//.test(type)) { setTakeStatus('That file is not a recording. Pick an audio or video file.', true); return; }
    setTakeStatus('Adding ' + file.name + '…');
    var songId = song.id;
    file.arrayBuffer().then(function (buf) {
      return putTake({ id: newId(), song: songId, data: buf, type: type, kind: /^video/.test(type) ? 'video' : 'audio', size: buf.byteLength, duration: 0, note: $('takeNote').value.trim().slice(0, 200) || file.name.slice(0, 120), createdAt: Date.now() });
    }).then(function () { askPersist(); $('takeNote').value = ''; setTakeStatus('Recording added.'); renderTakes(); })
      .catch(function () { setTakeStatus('That file could not be added. The phone may be out of storage.', true); });
  }

  /* ---------- backing track: an audio file on the phone, or a YouTube video ---------- */
  var bt = { kind: null, audio: null, url: null, yt: null, ytReady: false, ytId: null, a: null, b: null, loop: false, poll: 0, song: null };
  function btKey(k) { return sk('bt:' + k); }
  function setBtStatus(msg, err) { var el = $('btStatus'); el.textContent = msg || ''; el.classList.toggle('err', !!err); }
  function parseYt(u) {
    u = String(u || '').trim();
    var m = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/|v\/))([\w-]{11})/.exec(u);
    if (m) return m[1];
    return /^[\w-]{11}$/.test(u) ? u : null;
  }
  var fileP = {
    play: function () { var p = bt.audio.play(); if (p && p.catch) p.catch(function () { setBtStatus('Tap Play to start the track.'); }); },
    pause: function () { bt.audio.pause(); },
    playing: function () { return !bt.audio.paused; },
    time: function () { return bt.audio.currentTime || 0; },
    dur: function () { return isFinite(bt.audio.duration) ? bt.audio.duration : 0; },
    seek: function (t) { try { bt.audio.currentTime = Math.max(0, t); } catch (e) {} },
    rate: function (r) { bt.audio.preservesPitch = true; bt.audio.webkitPreservesPitch = true; bt.audio.playbackRate = r; }
  };
  var ytP = {
    play: function () { bt.yt.playVideo(); },
    pause: function () { bt.yt.pauseVideo(); },
    playing: function () { return bt.yt.getPlayerState && bt.yt.getPlayerState() === 1; },
    time: function () { return (bt.yt.getCurrentTime && bt.yt.getCurrentTime()) || 0; },
    dur: function () { return (bt.yt.getDuration && bt.yt.getDuration()) || 0; },
    seek: function (t) { bt.yt.seekTo(Math.max(0, t), true); },
    rate: function (r) { if (bt.yt.setPlaybackRate) bt.yt.setPlaybackRate(r); }
  };
  function player() { return bt.kind === 'file' && bt.audio && bt.audio.src ? fileP : (bt.kind === 'yt' && bt.ytReady ? ytP : null); }
  function btUnload() {
    clearInterval(bt.poll); bt.poll = 0;
    if (bt.audio) { try { bt.audio.pause(); bt.audio.removeAttribute('src'); bt.audio.load(); } catch (e) {} }
    if (bt.url) { try { URL.revokeObjectURL(bt.url); } catch (e) {} bt.url = null; }
    if (bt.yt) { try { bt.yt.destroy(); } catch (e) {} bt.yt = null; }
    bt.ytReady = false; bt.ytId = null; bt.kind = null;
    $('ytBox').innerHTML = ''; $('ytBox').hidden = true;
    $('btTransport').hidden = true;
  }
  function btShowTransport() {
    $('btTransport').hidden = false;
    var r = parseFloat(store.get(btKey('rate'), 1)) || 1;
    $('btRate').value = String(r);
    var p = player(); if (p) p.rate(r);
    paintLoop();
    if (!bt.poll) bt.poll = setInterval(btTick, 200);
  }
  function btTick() {
    var p = player(); if (!p) return;
    var t = p.time(), d = p.dur();
    if (bt.loop && bt.a != null && bt.b != null && bt.b > bt.a && t >= bt.b) { p.seek(bt.a); t = bt.a; }
    if (!btSeeking) $('btSeek').value = d ? Math.round(t / d * 1000) : 0;
    $('btTime').textContent = fmtDur(t) + ' / ' + fmtDur(d);
    $('btPlay').textContent = p.playing() ? 'Pause' : 'Play';
  }
  function paintLoop() {
    $('btLoop').textContent = bt.loop ? 'Loop on' : 'Loop off';
    $('btLoop').classList.toggle('on', bt.loop);
    $('btLoop').setAttribute('aria-pressed', bt.loop ? 'true' : 'false');
    $('btLoopInfo').textContent = (bt.a != null || bt.b != null) ? (bt.a != null ? fmtDur(bt.a) : '…') + ' to ' + (bt.b != null ? fmtDur(bt.b) : '…') : '';
  }
  function btSaveLoop() { store.set(btKey('loop'), { a: bt.a, b: bt.b, on: bt.loop }); }
  function btLoad() {
    btUnload();
    bt.song = song.id;
    var lp = store.get(btKey('loop'), {});
    bt.a = typeof lp.a === 'number' ? lp.a : null; bt.b = typeof lp.b === 'number' ? lp.b : null; bt.loop = !!lp.on;
    var src = store.get(btKey('src'), 'file');
    document.querySelectorAll('#btSrcTabs .tab').forEach(function (b) { b.setAttribute('aria-selected', b.getAttribute('data-src') === src ? 'true' : 'false'); });
    $('btFile').hidden = src !== 'file'; $('btYt').hidden = src !== 'yt';
    $('btYtSearch').href = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(song.title + ' ' + (song.artist || '') + ' karaoke');
    $('btWithRec').checked = store.get('btWithRec', true);
    setBtStatus('');
    if (src === 'file') {
      $('btFileInfo').textContent = 'Loading…';
      var id = song.id;
      getTrack(id).then(function (t) {
        if (id !== song.id) return;
        if (!t) {
          $('btFileInfo').textContent = 'No backing track for this song yet.';
          $('btFilePickLabel').textContent = 'Add a backing track'; $('btFileRemove').hidden = true;
          return;
        }
        if (!bt.audio) { bt.audio = new Audio(); bt.audio.preload = 'auto'; bt.audio.setAttribute('playsinline', ''); }
        bt.url = URL.createObjectURL(new Blob([t.data], { type: t.type || 'audio/mpeg' }));
        bt.audio.src = bt.url; bt.kind = 'file';
        $('btFileInfo').textContent = t.name + ' · ' + fmtSize(t.size || 0);
        $('btFilePickLabel').textContent = 'Replace'; $('btFileRemove').hidden = false;
        btShowTransport();
      }).catch(function () { $('btFileInfo').textContent = 'Backing tracks are not available in this browser.'; });
    } else {
      var yid = store.get(btKey('yt'), '');
      $('btYtUrl').value = yid ? 'https://youtu.be/' + yid : '';
      if (yid) loadYt(yid);
    }
  }
  var ytApi = null;
  function ytApiReady() {
    if (window.YT && window.YT.Player) return Promise.resolve();
    if (ytApi) return ytApi;
    ytApi = new Promise(function (res, rej) {
      var prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function () { if (prev) try { prev(); } catch (e) {} res(); };
      var s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api'; s.async = true;
      s.onerror = function () { rej(new Error('load')); };
      document.head.appendChild(s);
      setTimeout(function () { rej(new Error('timeout')); }, 15000);
    });
    ytApi.catch(function () { ytApi = null; });
    return ytApi;
  }
  function loadYt(id) {
    var forSong = song.id;
    bt.ytId = id;
    $('ytBox').hidden = false;
    $('ytBox').innerHTML = '<div id="ytPlayer"></div>';
    setBtStatus('Loading the video…');
    ytApiReady().then(function () {
      if (forSong !== song.id || bt.ytId !== id) return;
      bt.yt = new YT.Player('ytPlayer', {
        videoId: id,
        playerVars: { playsinline: 1, rel: 0, modestbranding: 1 },
        events: {
          onReady: function () { if (forSong !== song.id) return; bt.ytReady = true; bt.kind = 'yt'; setBtStatus(''); btShowTransport(); },
          onError: function () { setBtStatus('That video cannot play inside other apps. Try a different link.', true); }
        }
      });
    }).catch(function () {
      setBtStatus('YouTube could not load. Check your internet connection and try again.', true);
    });
  }
  var btSeeking = false;
  function startBackingForTake() {
    var p = player();
    if (!p || !$('btWithRec').checked) return false;
    if (bt.loop && bt.a != null) p.seek(bt.a);
    else if (p.dur() && p.time() >= p.dur() - 1) p.seek(0);
    p.play();
    return true;
  }

  /* ---------- songs from files ---------- */
  var ALLOWED_CELLS = ['', 'D', 'U', 'B', 'R', '1', '2', '3', '4', '5', '6', 'x'];
  function cleanSong(s) {
    if (!s || typeof s !== 'object') throw new Error('not a song');
    var str = function (v, max) { return typeof v === 'string' ? v.slice(0, max || 400) : ''; };
    if (!/^[a-z0-9-]{1,40}$/i.test(s.id || '')) throw new Error('The song file needs an id made of letters, numbers and dashes.');
    if (!str(s.title)) throw new Error('The song file needs a title.');
    var key = parseInt(s.key, 10), bpm = Number(s.bpm);
    if (!(key >= 0 && key <= 11)) throw new Error('The song key must be a number from 0 (C) to 11 (B).');
    if (!(bpm >= 30 && bpm <= 260)) throw new Error('The tempo must be between 30 and 260 BPM.');
    if (!Array.isArray(s.sections) || !s.sections.length) throw new Error('The song needs at least one section of chords.');
    var sections = s.sections.slice(0, 40).map(function (sec) {
      var lines = (Array.isArray(sec.lines) ? sec.lines : []).slice(0, 40).map(function (l) {
        return (Array.isArray(l) ? l : []).slice(0, 16).map(String).filter(function (d) { return parseDeg(d); });
      }).filter(function (l) { return l.length; });
      return { name: str(sec.name, 60) || 'Section', note: str(sec.note, 400), lines: lines };
    }).filter(function (sec) { return sec.lines.length; });
    if (!sections.length) throw new Error('None of the chords in that file could be read.');
    var out = {
      id: s.id.toLowerCase(), short: str(s.short, 40) || str(s.title, 40), title: str(s.title, 120), artist: str(s.artist, 120),
      year: parseInt(s.year, 10) || '', writers: str(s.writers, 200), key: key, bpm: Math.round(bpm), time: str(s.time, 30) || '4/4',
      tuning: str(s.tuning, 40) || 'Standard', alt: str(s.alt, 80), sections: sections,
      chartNote: str(s.chartNote, 800), patNote: str(s.patNote, 400), lyricsUrl: safeUrl(s.lyricsUrl), lyricsHelp: str(s.lyricsHelp, 400)
    };
    var lk = parseInt(s.lyricsKey, 10);
    if (lk >= 0 && lk <= 11) out.lyricsKey = lk;
    if (Array.isArray(s.patterns)) out.patterns = s.patterns.slice(0, 4).filter(function (p) {
      return p && Array.isArray(p.cells) && p.cells.length === 8 && p.cells.every(function (c) { return ALLOWED_CELLS.indexOf(String(c)) > -1; });
    }).map(function (p) { return { name: str(p.name, 30) || 'Pattern', cells: p.cells.map(String), how: str(p.how, 600), legend: str(p.legend, 300) }; });
    if (Array.isArray(s.links)) out.links = s.links.slice(0, 6).map(function (g) {
      return { h: str(g && g.h, 40) || 'Links', items: (g && Array.isArray(g.items) ? g.items : []).slice(0, 8).filter(function (it) { return it && safeUrl(it.u); }).map(function (it) { return { t: str(it.t, 100) || it.u, u: safeUrl(it.u), d: str(it.d, 200) }; }) };
    });
    return out;
  }
  function importSongFile(file) {
    if (!file) return;
    var st = $('songStatus');
    st.classList.remove('err'); st.textContent = 'Reading ' + file.name + '…';
    file.text().then(function (txt) {
      var data = JSON.parse(txt);
      var list = Array.isArray(data) ? data : (data && Array.isArray(data.songs) ? data.songs : [data]);
      var cleaned = list.map(cleanSong);
      var imp = imported();
      cleaned.forEach(function (c) { imp = imp.filter(function (x) { return x.id !== c.id; }); imp.push(c); });
      store.set('imported', imp);
      SONGS = allSongs();
      st.textContent = cleaned.length === 1 ? '"' + cleaned[0].title + '" added to your set list.' : cleaned.length + ' songs added to your set list.';
      setSong(cleaned[cleaned.length - 1].id);
      renderAdmin();
    }).catch(function (e) {
      st.classList.add('err');
      st.textContent = e instanceof SyntaxError ? 'That file is not a song file. Song files end in .json.' : (e && e.message) || 'That file could not be read.';
    });
  }
  function renderAdmin() {
    $('songAdmin').innerHTML = SONGS.map(function (s) {
      var tag = s._imported ? 'Added from a file' : s._updated ? 'Built in, updated from a file' : 'Built in';
      return '<div class="songrow"><div><b>' + esc(s.title) + '</b><small>' + esc(s.artist || '') + ' · ' + tag + '</small></div>' +
        (s._imported || s._updated ? '<button class="btn sm" type="button" data-remove="' + esc(s.id) + '">' + (s._updated ? 'Undo update' : 'Remove') + '</button>' : '') + '</div>';
    }).join('');
  }

  /* ---------- backup ---------- */
  function backup() {
    var data = {};
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf('osb:') === 0) data[k.slice(4)] = localStorage.getItem(k);
      }
    } catch (e) {}
    var body = JSON.stringify({ app: 'open-mic-songbook', version: APP_VERSION, savedAt: new Date().toISOString(), data: data }, null, 1);
    var name = 'songbook-backup-' + new Date().toISOString().slice(0, 10) + '.json';
    var blob = new Blob([body], { type: 'application/json' });
    var file = null;
    try { file = new File([blob], name, { type: 'application/json' }); } catch (e) {}
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: name }).then(function () { $('backupStatus').textContent = 'Backup shared. Save it to Files or iCloud Drive.'; }).catch(function () {});
      return;
    }
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
    $('backupStatus').textContent = 'Backup saved as ' + name + '.';
  }
  function restore(file) {
    if (!file) return;
    var st = $('backupStatus');
    st.classList.remove('err');
    file.text().then(function (txt) {
      var b = JSON.parse(txt);
      if (!b || b.app !== 'open-mic-songbook' || typeof b.data !== 'object') throw new Error('bad');
      Object.keys(b.data).forEach(function (k) { if (typeof b.data[k] === 'string') { try { localStorage.setItem('osb:' + k, b.data[k]); } catch (e) {} } });
      SONGS = allSongs();
      setSong(store.get('song', SONGS[0].id));
      renderAdmin();
      st.textContent = 'Backup from ' + (b.savedAt ? fmtDate(Date.parse(b.savedAt)) : 'file') + ' restored.';
    }).catch(function () { st.classList.add('err'); st.textContent = 'That file is not a Songbook backup.'; });
  }

  /* ---------- views and song switching ---------- */
  var view = store.get('view', 'chart');
  function setView(v) {
    if (['chart', 'lyrics', 'takes', 'prep', 'more'].indexOf(v) < 0) v = 'chart';
    if (v !== 'lyrics') { stopScroll(); if (stageOn) setStage(false); }
    view = v; store.set('view', v);
    document.querySelectorAll('.vtab').forEach(function (b) { b.setAttribute('aria-selected', b.getAttribute('data-view') === v ? 'true' : 'false'); });
    ['chart', 'lyrics', 'takes', 'prep', 'more'].forEach(function (n) { $('view-' + n).hidden = n !== v; });
    var top = document.querySelector('.views').offsetTop;
    if (window.scrollY > top) window.scrollTo(0, top);
    if (v === 'lyrics') renderLyricsView();
    if (v === 'takes') { renderTakes(); if (bt.song !== song.id) btLoad(); }
    if (v === 'more') { renderAdmin(); renderStorage(); }
  }
  function setSong(id) {
    var found = null;
    SONGS.forEach(function (s) { if (s.id === id) found = s; });
    song = found || SONGS[0];
    if (!song) return;
    stopM(); stopScroll();
    store.set('song', song.id);
    state.key = store.get(sk('key'), song.key);
    state.capo = store.get(sk('capo'), 0);
    state.pat = store.get(sk('pat'), 0);
    renderSongTabs(); renderHeader(); renderKeySelect(); renderMap(); renderShapes(); renderPattern(); renderPresets(); renderPrep();
    setBpm(store.get(sk('bpm'), song.bpm), false);
    if (!$('lyrEdit').hidden) setEditing(false);
    if (view === 'lyrics') renderLyricsView();
    if (bt.song && bt.song !== song.id && !recording) { btUnload(); bt.song = null; }
    if (view === 'takes') { renderTakes(); if (bt.song !== song.id && !recording) btLoad(); }
    setTakeStatus(recording ? 'Still recording the take you started on another song.' : '');
  }

  /* ---------- wiring ---------- */
  $('songTabs').addEventListener('click', function (e) {
    var b = e.target.closest('.tab'); if (!b) return;
    setSong(SONGS[parseInt(b.getAttribute('data-i'), 10)].id);
  });
  document.querySelector('.views').addEventListener('click', function (e) {
    var b = e.target.closest('.vtab'); if (b) setView(b.getAttribute('data-view'));
  });
  $('keySel').addEventListener('change', function () { state.key = parseInt(this.value, 10); store.set(sk('key'), state.key); renderMap(); renderShapes(); });
  $('capoSel').addEventListener('change', function () { state.capo = parseInt(this.value, 10); store.set(sk('capo'), state.capo); renderMap(); renderShapes(); });
  $('patTabs').addEventListener('click', function (e) {
    var b = e.target.closest('.tab'); if (!b) return;
    state.pat = parseInt(b.getAttribute('data-i'), 10); store.set(sk('pat'), state.pat); renderPattern();
  });
  function toggleM() { playing ? stopM() : startM(); }
  $('playBtn').addEventListener('click', toggleM);
  $('dockPlay').addEventListener('click', toggleM);
  $('tapBtn').addEventListener('click', tap);
  $('bpmRange').addEventListener('input', function () { setBpm(parseInt(this.value, 10)); });
  $('dockMinus').addEventListener('click', function () { setBpm(state.bpm - 2); });
  $('dockPlus').addEventListener('click', function () { setBpm(state.bpm + 2); });
  $('presets').addEventListener('click', function (e) { var b = e.target.closest('[data-bpm]'); if (b) setBpm(parseInt(b.getAttribute('data-bpm'), 10)); });
  $('subOn').checked = store.get('sub', false);
  $('subOn').addEventListener('change', function () { store.set('sub', this.checked); });

  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.matches && t.matches('.check input')) {
      var p = t.getAttribute('data-p'), saved = store.get('ck:' + p, {});
      saved[t.getAttribute('data-i')] = t.checked;
      store.set('ck:' + p, saved);
    }
  });
  $('planReset').addEventListener('click', function () {
    if (!armed(this, 'Tap again to clear')) return;
    store.set('ck:plan:' + song.id, {}); checklist('planList', 'plan:' + song.id, planItems());
  });

  // lyrics
  $('editBtn').addEventListener('click', function () { setEditing($('lyrEdit').hidden); });
  $('lyrDone').addEventListener('click', function () { setEditing(false); });
  var saveT = 0;
  $('lyricsBox').addEventListener('input', function () {
    var v = this.value; clearTimeout(saveT);
    saveT = setTimeout(function () { store.set(sk('lyrics'), v); }, 400);
  });
  $('lyricsBox').addEventListener('blur', function () { clearTimeout(saveT); store.set(sk('lyrics'), this.value); });
  $('lyrClear').addEventListener('click', function () {
    if (!armed(this, 'Tap again to clear')) return;
    $('lyricsBox').value = ''; store.set(sk('lyrics'), '');
  });
  $('lyrKeySel').addEventListener('change', function () { store.set(sk('lyrKey'), parseInt(this.value, 10)); renderLyricsView(); });
  $('fontPlus').addEventListener('click', function () { lyrSize = Math.min(44, lyrSize + 2); store.set('lyrSize', lyrSize); applyFont(); });
  $('fontMinus').addEventListener('click', function () { lyrSize = Math.max(13, lyrSize - 2); store.set('lyrSize', lyrSize); applyFont(); });
  $('scrollSpeed').value = String(store.get('scrollSpeed', 3));
  $('scrollSpeed').addEventListener('input', function () { store.set('scrollSpeed', parseInt(this.value, 10)); });
  $('scrollBtn').addEventListener('click', toggleScroll);
  $('stageScroll').addEventListener('click', toggleScroll);
  $('stageBtn').addEventListener('click', function () { setStage(true); });
  $('stageExit').addEventListener('click', function () { setStage(false); });
  $('lyrRead').addEventListener('click', function (e) { if (stageOn && !e.target.closest('a')) toggleScroll(); });
  window.addEventListener('wheel', function () { if (scrolling) stopScroll(); }, { passive: true });
  window.addEventListener('touchmove', function () { if (scrolling) stopScroll(); }, { passive: true });

  // takes
  var recWithBacking = false;
  $('recBtn').addEventListener('click', function () {
    if (recording || recStarting) { stopRec(); return; }
    /* start the backing track inside this tap, which phones require for sound to play */
    recWithBacking = startBackingForTake();
    startRec(recWithBacking);
  });

  // backing track
  $('btSrcTabs').addEventListener('click', function (e) {
    var b = e.target.closest('[data-src]'); if (!b) return;
    store.set(btKey('src'), b.getAttribute('data-src')); btLoad();
  });
  $('btFileInput').addEventListener('change', function () {
    var file = this.files && this.files[0]; this.value = '';
    if (!file) return;
    var type = file.type || ({ mp3: 'audio/mpeg', m4a: 'audio/mp4', wav: 'audio/wav', aac: 'audio/aac' }[(file.name.split('.').pop() || '').toLowerCase()] || '');
    if (!/^audio\//.test(type)) { setBtStatus('That file is not audio. Pick an MP3, M4A or WAV file.', true); return; }
    setBtStatus('Adding ' + file.name + '…');
    var id = song.id;
    file.arrayBuffer().then(function (buf) {
      return putTrack({ song: id, data: buf, type: type, name: file.name.slice(0, 120), size: buf.byteLength, addedAt: Date.now() });
    }).then(function () {
      askPersist();
      store.set(btKey('loop'), {});
      if (id === song.id) { btLoad(); setBtStatus('Backing track added.'); }
    }).catch(function () { setBtStatus('That file could not be added. The phone may be out of storage.', true); });
  });
  $('btFileRemove').addEventListener('click', function () {
    if (!armed(this, 'Tap again to remove')) return;
    var id = song.id;
    delTrack(id).then(function () { store.set(btKey('loop'), {}); if (id === song.id) { btLoad(); setBtStatus('Backing track removed.'); } });
  });
  $('btYtSet').addEventListener('click', function () {
    var id = parseYt($('btYtUrl').value);
    if (!id) { setBtStatus('That doesn\'t look like a YouTube link. It should start with youtube.com or youtu.be.', true); return; }
    store.set(btKey('yt'), id); store.set(btKey('loop'), {});
    btLoad();
  });
  $('btYtUrl').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); $('btYtSet').click(); } });
  $('btPlay').addEventListener('click', function () { var p = player(); if (!p) return; p.playing() ? p.pause() : p.play(); setTimeout(btTick, 60); });
  $('btBack').addEventListener('click', function () { var p = player(); if (p) { p.seek(p.time() - 5); btTick(); } });
  $('btRate').addEventListener('change', function () { var r = parseFloat(this.value); store.set(btKey('rate'), r); var p = player(); if (p) p.rate(r); });
  $('btSeek').addEventListener('input', function () { btSeeking = true; var p = player(); if (p && p.dur()) $('btTime').textContent = fmtDur(this.value / 1000 * p.dur()) + ' / ' + fmtDur(p.dur()); });
  $('btSeek').addEventListener('change', function () { var p = player(); if (p && p.dur()) p.seek(this.value / 1000 * p.dur()); btSeeking = false; btTick(); });
  $('btSetA').addEventListener('click', function () { var p = player(); if (!p) return; bt.a = Math.round(p.time() * 10) / 10; if (bt.b != null && bt.b <= bt.a) bt.b = null; btSaveLoop(); paintLoop(); });
  $('btSetB').addEventListener('click', function () {
    var p = player(); if (!p) return;
    var t = Math.round(p.time() * 10) / 10;
    if (bt.a == null) bt.a = 0;
    if (t <= bt.a) { setBtStatus('The loop end has to come after the loop start.', true); return; }
    bt.b = t; bt.loop = true; setBtStatus(''); btSaveLoop(); paintLoop();
  });
  $('btLoop').addEventListener('click', function () {
    if (!bt.loop && (bt.a == null || bt.b == null)) { setBtStatus('Set a loop start and end first: play to each spot and tap the button.'); return; }
    bt.loop = !bt.loop; btSaveLoop(); paintLoop();
    if (bt.loop) { var p = player(); if (p && (p.time() < bt.a || p.time() > bt.b)) p.seek(bt.a); }
  });
  $('btWithRec').addEventListener('change', function () { store.set('btWithRec', this.checked); });
  $('countIn').checked = store.get('countIn', true);
  $('countIn').addEventListener('change', function () { store.set('countIn', this.checked); });
  $('takeFile').addEventListener('change', function () { importTake(this.files && this.files[0]); this.value = ''; });
  $('takeList').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-act]'); if (!b) return;
    var id = b.closest('.take').getAttribute('data-id');
    if (b.getAttribute('data-act') === 'share') { getTake(id).then(function (t) { if (t) shareTake(t, b); }); }
    if (b.getAttribute('data-act') === 'del') {
      if (!armed(b, 'Tap again to delete')) return;
      delTake(id).then(function () { setTakeStatus('Take deleted.'); renderTakes(); }).catch(function () { setTakeStatus('That take could not be deleted.', true); });
    }
  });
  $('takeList').addEventListener('change', function (e) {
    var t = e.target;
    if (t.matches('select[data-act="rate"]')) {
      var m = t.closest('.take').querySelector('audio,video');
      if (m) { try { m.preservesPitch = true; m.webkitPreservesPitch = true; m.playbackRate = parseFloat(t.value); } catch (err) {} }
    } else if (t.matches('input[type="text"]')) {
      var id = t.closest('.take').getAttribute('data-id'), note = t.value.trim().slice(0, 200);
      getTake(id).then(function (rec) { if (rec) { rec.note = note; return putTake(rec); } }).then(function () { setTakeStatus('Note saved.'); }).catch(function () { setTakeStatus('That note could not be saved.', true); });
    }
  });

  // more
  $('songFile').addEventListener('change', function () { importSongFile(this.files && this.files[0]); this.value = ''; });
  $('songAdmin').addEventListener('click', function (e) {
    var b = e.target.closest('[data-remove]'); if (!b) return;
    if (!armed(b, 'Tap again to confirm')) return;
    var id = b.getAttribute('data-remove');
    store.set('imported', imported().filter(function (s) { return s.id !== id; }));
    SONGS = allSongs();
    setSong(SONGS.some(function (s) { return s.id === song.id; }) ? song.id : SONGS[0].id);
    renderAdmin();
    $('songStatus').classList.remove('err');
    $('songStatus').textContent = 'Done. Lyrics and takes for that song stay on the phone in case you add it again.';
  });
  $('backupBtn').addEventListener('click', backup);
  $('restoreFile').addEventListener('change', function () { restore(this.files && this.files[0]); this.value = ''; });
  $('appVersion').textContent = APP_VERSION;

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { stopM(); stopScroll(); if (recording) stopRec(); var bp = player(); if (bp && bt.kind === 'file') bp.pause(); }
    else if (stageOn || scrolling) wakeOn();
  });

  /* ---------- install hint and offline ---------- */
  var standalone = window.navigator.standalone === true || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
  var ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (ios && !standalone && !store.get('installHintDone', false)) $('installHint').hidden = false;
  $('installClose').addEventListener('click', function () { store.set('installHintDone', true); $('installHint').hidden = true; });

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    var reloading = false;
    navigator.serviceWorker.register('sw.js').then(function (reg) {
      var offer = function (w) {
        toast('A new version of the app is ready.', 'Update', function () { w.postMessage('skipWaiting'); });
      };
      if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
      reg.addEventListener('updatefound', function () {
        var w = reg.installing;
        if (!w) return;
        w.addEventListener('statechange', function () { if (w.state === 'installed' && navigator.serviceWorker.controller) offer(w); });
      });
    }).catch(function () {});
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (reloading || recording) return;
      reloading = true; location.reload();
    });
  }

  /* ---------- start ---------- */
  if (!song) { $('songTitle').textContent = 'No songs yet'; return; }
  setSong(store.get('song', song.id));
  setView(view);
})();
