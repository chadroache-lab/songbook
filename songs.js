/* Open Mic Songbook: built-in songs.

   Each song is one object. Fields:
     id        short unique slug (letters, digits, dashes)
     short     name shown on the set-list tab
     title, artist, year, writers
     key       recorded key as a pitch class: C=0 C#=1 D=2 Eb=3 E=4 F=5 F#=6 G=7 Ab=8 A=9 Bb=10 B=11
     bpm, time, tuning, alt (optional: another way to play it)
     lyricsKey key the linked lyrics-and-chords chart is written in (same numbers as key)
     sections  [{name, note, lines:[[degree, ...], ...]}]
               Degrees are Nashville-style Roman numerals relative to the home key:
               I ii iii IV V vi, a leading b or # (bVII), and a suffix
               (7, maj7, m7, sus2, sus4, dim, 6, add9). Lowercase means minor.
     patterns  optional song-specific strum patterns, shown before the standard three
     chartNote, patNote, lyricsUrl, lyricsHelp (plain text)
     links     [{h: group name, items:[{t: text, u: https URL, d: optional detail}]}]

   Lyrics are never stored here. Each person pastes their own in the app, and they stay on that device. */

window.SONGBOOK_SONGS = [
  {
    id: 'nstr', short: 'No Stranger to the Rain', title: "I'm No Stranger to the Rain", artist: 'Keith Whitley', year: 1989,
    writers: 'Sonny Curtis & Ron Hellard',
    key: 4, bpm: 88, time: '4/4', tuning: 'Standard', alt: 'Capo 2, D shapes', lyricsKey: 0,
    sections: [
      { name: 'Verse 1', note: 'Start soft.', lines: [['I', 'IV'], ['I'], ['V', 'bVII'], ['IV', 'V']] },
      { name: 'Verse 2', note: 'Same changes, then one extra line that settles on the home chord.', lines: [['I', 'IV'], ['I'], ['V', 'bVII'], ['IV', 'V'], ['I']] },
      { name: 'Bridge', note: 'A short minor turn, then it climbs back toward V.', lines: [['IV'], ['I', 'IV', 'I'], ['vi', 'iii'], ['IV', 'II7'], ['bVII', 'V']] },
      { name: 'Verse 3', note: 'Same four lines as the verses, plus a turnaround to the end.', lines: [['I', 'IV'], ['I'], ['V', 'bVII'], ['IV', 'V'], ['vi', 'II7', 'IV', 'V', 'I']] },
      { name: 'Verse 4 and ending', note: 'Repeat Verse 3. Take the last line again to finish, and let the home chord ring.', lines: [['I', 'IV'], ['I'], ['V', 'bVII'], ['IV', 'V'], ['vi', 'II7', 'IV', 'V', 'I']] }
    ],
    chartNote: 'Assembled from the classic-country-song-lyrics.com chart (written in C) and E-key charts on Chordu and Ultimate Guitar. Charts differ in small ways: the V chord is often played as a V7, and some versions end on C#m then E. Trust the record and your ear.',
    patNote: 'Reviews describe the record opening with picked arpeggios, so try this feel for the intro and first verse.',
    lyricsUrl: 'https://www.classic-country-song-lyrics.com/imnostrangertotherainlyricschords.html',
    lyricsHelp: 'That chart is written in C. Paste it as it is and set "Chart written in" to C. The app moves the chords to your key.',
    links: [
      { h: 'The record', items: [
        { t: 'Keith Whitley, official video', u: 'https://www.youtube.com/watch?v=GwOfWwo5WIw', d: 'The version to learn from.' },
        { t: 'Chordu jam-along', u: 'https://chordu.com/chords-tabs-keith-whitley-i-m-no-stranger-to-the-rain-official-video--id_GwOfWwo5WIw', d: 'Chords scroll in time with the video. About 88 BPM, key of E.' },
        { t: 'Live versions', u: 'https://www.youtube.com/results?search_query=Keith+Whitley+I%27m+No+Stranger+to+the+Rain+live', d: 'Hear how he phrases it on stage.' }] },
      { h: 'Backing tracks', items: [
        { t: 'Karaoke version', u: 'https://www.youtube.com/results?search_query=I%27m+No+Stranger+to+the+Rain+karaoke+Keith+Whitley', d: 'Vocals removed, so you can sing over it.' },
        { t: 'Backing track', u: 'https://www.youtube.com/results?search_query=I%27m+No+Stranger+to+the+Rain+backing+track', d: 'Check the key in the title before you practice.' },
        { t: 'Instrumental', u: 'https://www.youtube.com/results?search_query=I%27m+No+Stranger+to+the+Rain+instrumental' }] },
      { h: 'Lessons', items: [
        { t: 'Guitar lessons', u: 'https://www.youtube.com/results?search_query=I%27m+No+Stranger+to+the+Rain+guitar+lesson' },
        { t: 'Strumming pattern videos', u: 'https://www.youtube.com/results?search_query=I%27m+No+Stranger+to+the+Rain+strumming+pattern' },
        { t: 'Intro and fingerpicking', u: 'https://www.youtube.com/results?search_query=I%27m+No+Stranger+to+the+Rain+fingerstyle+intro' }] },
      { h: 'Charts', items: [
        { t: 'Lyrics and chords (key of C)', u: 'https://www.classic-country-song-lyrics.com/imnostrangertotherainlyricschords.html', d: 'Plain chart with lyrics.' },
        { t: 'Ultimate Guitar, key of E', u: 'https://pt.ultimate-guitar.com/tab/keith-whitley/im-no-stranger-to-the-rain-chords-983286', d: 'Capo 2, D shapes. Read the comments for fixes.' },
        { t: 'Hal Leonard chord sheet', u: 'https://www.virtualsheetmusic.com/keithwhitley/chords', d: 'Licensed easy guitar edition for purchase.' }] }
    ]
  },
  {
    id: 'ltlyd', short: 'Love to Lay You Down', title: "I'd Love to Lay You Down", artist: 'Conway Twitty', year: 1980,
    writers: 'Johnny MacRae',
    key: 2, bpm: 78, time: '4/4 (assumed)', tuning: 'Standard', lyricsKey: 0,
    sections: [
      { name: 'Verse 1', note: 'Only three chords. Keep it easy and unhurried.', lines: [['I', 'V7', 'IV', 'I'], ['V7', 'I']] },
      { name: 'Chorus', note: 'Comes back after each verse and after the bridge.', lines: [['I', 'V7', 'IV', 'I'], ['V7', 'IV', 'I'], ['V7', 'I']] },
      { name: 'Verse 2', note: 'Same changes as the chorus.', lines: [['I', 'V7', 'IV', 'I'], ['V7', 'IV', 'I'], ['V7', 'I']] },
      { name: 'Bridge', note: 'The home chord sits for a bar before each turn.', lines: [['I'], ['V7', 'IV', 'I'], ['I'], ['V7', 'IV', 'I']] },
      { name: 'Final chorus', note: 'Two sources show the last chorus dropping a whole step. The letters are real chords; the small numbers are measured from the home key. Check the record to hear whether it moves.', lines: [['bVII', 'IV', 'bIII', 'bVII'], ['IV', 'bVII']] }
    ],
    chartNote: 'Built from the classic-country-song-lyrics.com chart (written in C, with no bridge or key change), a key-of-D chart on Ultimate Guitar, and Chordu\'s analysis of a lyric video. Charts differ on how many times the chorus repeats. Trust the record and your ear.',
    lyricsUrl: 'https://www.classic-country-song-lyrics.com/idjustlovetolayyoudownlyricschords.html',
    lyricsHelp: 'That chart is written in C. Paste it as it is and set "Chart written in" to C. The app moves the chords to your key.',
    links: [
      { h: 'The record', items: [
        { t: 'Lyric video on YouTube', u: 'https://www.youtube.com/watch?v=428JcxureSo', d: 'Audio of the record with words on screen.' },
        { t: 'Chordu jam-along', u: 'https://chordu.com/chords-tabs-i-d-love-to-lay-you-down-conway-twitty-with-lyrics-id_428JcxureSo', d: 'Chords scroll in time with the video. About 78 BPM, key of D.' },
        { t: 'Live versions', u: 'https://www.youtube.com/results?search_query=Conway+Twitty+I%27d+Love+to+Lay+You+Down+live', d: 'Hear how he phrases it on stage.' }] },
      { h: 'Backing tracks', items: [
        { t: 'Karaoke version', u: 'https://www.youtube.com/results?search_query=I%27d+Love+to+Lay+You+Down+karaoke+Conway+Twitty', d: 'Vocals removed, so you can sing over it.' },
        { t: 'Backing track', u: 'https://www.youtube.com/results?search_query=I%27d+Love+to+Lay+You+Down+backing+track', d: 'Check the key in the title before you practice.' },
        { t: 'Instrumental', u: 'https://www.youtube.com/results?search_query=I%27d+Love+to+Lay+You+Down+instrumental' }] },
      { h: 'Lessons', items: [
        { t: 'Guitar lessons', u: 'https://www.youtube.com/results?search_query=I%27d+Love+to+Lay+You+Down+Conway+Twitty+guitar+lesson' },
        { t: 'Strumming pattern videos', u: 'https://www.youtube.com/results?search_query=I%27d+Love+to+Lay+You+Down+strumming+pattern' }] },
      { h: 'Charts', items: [
        { t: 'Lyrics and chords (key of C)', u: 'https://www.classic-country-song-lyrics.com/idjustlovetolayyoudownlyricschords.html', d: 'Plain chart with lyrics.' },
        { t: 'Ultimate Guitar, key of D', u: 'https://pt.ultimate-guitar.com/tab/conway-twitty/id-love-to-lay-you-down-chords-1708515', d: 'Includes the bridge and the key change.' },
        { t: 'Conway Twitty chord sheets', u: 'https://www.virtualsheetmusic.com/conwaytwitty/chords', d: 'Licensed editions for purchase.' }] }
    ]
  },
  {
    id: 'black', short: 'Black', title: 'Black', artist: 'Pearl Jam', year: 1991,
    writers: 'Stone Gossard (music) & Eddie Vedder (lyrics)',
    key: 4, bpm: 78, time: '4/4', tuning: 'Standard', lyricsKey: 4,
    patterns: [
      { name: 'Black (easy)', cells: ['D', '', 'D', '', 'D', 'U', 'D', ''],
        how: 'Down on 1, down on 2, down-up on 3, down on 4. From Lauren Bateman\'s lesson. Keep it light in the verses and add strums in the chorus. For a more authentic chorus, change to the next chord on the last upstrum, slightly ahead of the beat.',
        legend: '↓ = downstrum · ↑ = upstrum · blank = hand keeps moving, no strings hit. The lesson also gives a 16th-note version: D DDU DU D DDU.' }
    ],
    sections: [
      { name: 'Intro', note: 'Let the open E ring. Lift two fingers off the A to get Asus2.', lines: [['I', 'IVsus2', 'I', 'IVsus2'], ['I', 'IV', 'I']] },
      { name: 'Verse 1', note: 'The same rocking E to Asus2 under each line, then two lines that lean on C and Em.', lines: [['I', 'IVsus2', 'I', 'IVsus2'], ['I', 'IV', 'I'], ['I', 'IVsus2', 'I', 'IVsus2'], ['I', 'IV', 'I'], ['bVI', 'i'], ['bVI', 'i']] },
      { name: 'Chorus', note: 'The song turns dark here. D, C, Em carries the rest of the song.', lines: [['bVII', 'bVI', 'i'], ['bVII', 'bVI', 'i']] },
      { name: 'Verse 2', note: 'Same as Verse 1, shorter.', lines: [['I', 'IVsus2', 'I', 'IVsus2'], ['I', 'IV', 'I'], ['bVI', 'i'], ['bVI', 'i']] },
      { name: 'Chorus 2', note: 'Plays once more, with an extra turn on D and C at the end.', lines: [['bVII', 'bVI', 'i'], ['bVII', 'bVI', 'i'], ['bVII', 'bVI']] },
      { name: 'Bridge', note: 'Builds in intensity. Dig in here.', lines: [['bVII', 'bVI', 'i'], ['bVII', 'bVI']] },
      { name: 'Outro', note: 'Repeat this line about eight times, building, then let it fade or end on Em.', lines: [['i', 'bVII', 'bVI']] }
    ],
    chartNote: 'Built from chord charts on ChordsEasy and GuitarPlayerBox (both in E), with the key, tempo (78 BPM) and time signature from the Musicnotes sheet music. Some charts use plain A instead of Asus2, and an audio analysis on Klangio also hears C#m and Dm passing chords. The record is a full band, so a solo version will sound sparser. Trust the record and your ear.',
    patNote: 'For a solo acoustic version, try this for the intro and verses, then the steady ballad pattern from the chorus on.',
    lyricsUrl: 'https://chordseasy.com/song/32682/black',
    lyricsHelp: 'That chart is in E, the same key as the record. Inline chords like [E] and [Asus2] are recognized.',
    links: [
      { h: 'The record', items: [
        { t: 'Studio recording (from Ten)', u: 'https://www.youtube.com/results?search_query=Pearl+Jam+Black+Ten+audio', d: 'The band never made an official video for this song.' },
        { t: 'Live and unplugged versions', u: 'https://www.youtube.com/results?search_query=Pearl+Jam+Black+live+unplugged', d: 'Closer to a solo arrangement.' },
        { t: 'Klangio chord analysis', u: 'https://songs.klang.io/en/s/Pearl%20Jam/Black/sbkE56QVK0I', d: 'Machine analysis of a recording: about 77 BPM.' }] },
      { h: 'Backing tracks', items: [
        { t: 'Karaoke version', u: 'https://www.youtube.com/results?search_query=Pearl+Jam+Black+karaoke', d: 'Vocals removed, so you can sing over it.' },
        { t: 'Backing track', u: 'https://www.youtube.com/results?search_query=Pearl+Jam+Black+backing+track', d: 'Check the key in the title before you practice.' },
        { t: 'Acoustic instrumental', u: 'https://www.youtube.com/results?search_query=Pearl+Jam+Black+acoustic+instrumental' }] },
      { h: 'Lessons', items: [
        { t: 'JustinGuitar lesson', u: 'https://justinguitar.com/songs/pearl-jam-black-chords-tabs-guitar-lesson-sg-050', d: 'Explains why there is no fixed strum pattern.' },
        { t: 'Lauren Bateman lesson', u: 'https://www.laurenbateman.com/?p=4005', d: 'Easy and intermediate strum patterns.' },
        { t: 'More guitar lessons', u: 'https://www.youtube.com/results?search_query=Pearl+Jam+Black+acoustic+guitar+lesson' }] },
      { h: 'Charts', items: [
        { t: 'ChordsEasy chart', u: 'https://chordseasy.com/song/32682/black', d: 'Key of E, with Asus2 in the verses.' },
        { t: 'GuitarPlayerBox chart', u: 'https://www.guitarplayerbox.com/tabs/Pearl-Jam/Black/449', d: 'Key of E, shows the long outro.' },
        { t: 'Musicnotes sheet music', u: 'https://www.musicnotes.com/sheetmusic/pearl-jam/black/MN0138329', d: 'Licensed piano, vocal and guitar edition for purchase.' }] }
    ]
  },
  {
    id: 'sbm-swj', short: 'Stand By Me', title: 'Stand By Me (Live at the Print Shop)', artist: 'Stephen Wilson Jr.', year: 2024,
    writers: 'Ben E. King, Jerry Leiber & Mike Stoller',
    key: 0, bpm: 106, time: '4/4', tuning: 'Standard', lyricsKey: 0,
    sections: [
      { name: 'Intro', note: 'Sets up the sound of the whole cover: the home chord turns minor (Cm7) for a moment before resolving.', lines: [['I', 'vi', 'im7', 'I', 'IV', 'V'], ['I', 'vi', 'I', 'vi']] },
      { name: 'Verse 1', note: 'Starts on C and Am, then walks down through G and F and lands on Am.', lines: [['I', 'vi'], ['vi', 'V', 'IV', 'V', 'vi']] },
      { name: 'Chorus', note: 'Rocks between Am and C. Watch the Cm7 on the second line; it is the signature move of this version.', lines: [['vi', 'I', 'vi', 'I', 'IV', 'V', 'vi'], ['vi', 'I', 'im7', 'vi', 'I', 'IV', 'V', 'I']] },
      { name: 'Verse 2', note: 'Shorter than the first verse.', lines: [['I', 'vi'], ['I', 'IV', 'V', 'vi']] },
      { name: 'Chorus 2', note: 'Same as the first chorus, with an extra Am at the end leading into the next part.', lines: [['vi', 'I', 'vi', 'I', 'IV', 'V', 'vi'], ['vi', 'I', 'im7', 'vi', 'I', 'IV', 'V', 'I', 'vi']] },
      { name: 'Turn', note: 'A short passage the charts leave unlabeled. It works like a bridge back into the last verse.', lines: [['I', 'im7', 'IV', 'V', 'vi', 'I']] },
      { name: 'Verse 3', note: 'Resolves to C this time instead of Am.', lines: [['I', 'vi', 'V', 'IV', 'V', 'I']] },
      { name: 'Outro', note: 'Long final run. Hold the F for an extra beat near the end, then finish on C.', lines: [['I', 'vi', 'I', 'IV', 'V', 'vi'], ['I', 'vi', 'I', 'IV', 'IV', 'V', 'vi', 'I']] }
    ],
    chartNote: 'Chords from the GuitarTabsExplorer and GoTabs charts of the live acoustic version, which agree with each other (they may share one source). Key of C and about 106 BPM from Karaoke Version, which notes the tempo varies because it is a live recording, so treat the metronome as a guide. This is a reworked cover: the Cm7 and the Am-led verses are what set it apart from the familiar Ben E. King version. Trust the record and your ear.',
    patNote: 'No source gives his strum pattern. Try this for the intro and first verse, then the steady ballad feel as it builds.',
    lyricsUrl: 'https://www.gotabs.com/stephen-wilson-jr/stand-by-me-chords',
    lyricsHelp: 'That chart is in C, the same key as the record. Paste it as it is; chords on their own line above the words are recognized.',
    links: [
      { h: 'The record', items: [
        { t: 'Live at the Print Shop (YouTube)', u: 'https://www.youtube.com/watch?v=9kn7E-OauJI', d: 'The version this chart follows. Released November 2024.' },
        { t: 'CMA Awards performance', u: 'https://www.youtube.com/results?search_query=Stephen+Wilson+Jr+Stand+By+Me+CMA+Awards', d: 'A bigger live performance of his arrangement.' },
        { t: 'Ben E. King original (1961)', u: 'https://www.youtube.com/results?search_query=Ben+E+King+Stand+By+Me+1961', d: 'Hear what he changed.' }] },
      { h: 'Backing tracks', items: [
        { t: 'Karaoke Version backing track', u: 'https://www.karaoke-version.com/karaoke/stephen-wilson-jr/stand-by-me-live-at-the-print-shop.html', d: 'Licensed track of this exact version, key of C. About $2.99. Download the MP3 and load it on the Play tab.' },
        { t: 'Karaoke on YouTube', u: 'https://www.youtube.com/results?search_query=Stephen+Wilson+Jr+Stand+By+Me+karaoke', d: 'Check that it is his version, not the original.' }] },
      { h: 'Lessons', items: [
        { t: 'Guitar lessons', u: 'https://www.youtube.com/results?search_query=Stephen+Wilson+Jr+Stand+By+Me+guitar+lesson' },
        { t: 'Strumming pattern videos', u: 'https://www.youtube.com/results?search_query=Stephen+Wilson+Jr+Stand+By+Me+strumming' }] },
      { h: 'Charts', items: [
        { t: 'GoTabs chart (key of C)', u: 'https://www.gotabs.com/stephen-wilson-jr/stand-by-me-chords', d: 'Chords with lyrics, live acoustic version.' },
        { t: 'GuitarTabsExplorer chart', u: 'https://guitartabsexplorer.com/stephen-wilson-jr./stand-by-me-acoustic-live-chords', d: 'Same chords, rated intermediate.' }] }
    ]
  }
];
