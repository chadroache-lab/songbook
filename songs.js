/* Open Mic Songbook: built-in songs.

   Each song is one object. Fields:
     id        short unique slug (letters, digits, dashes)
     short     name shown on the set-list tab
     title, artist, year, writers
     key       recorded key as a pitch class: C=0 C#=1 D=2 Eb=3 E=4 F=5 F#=6 G=7 Ab=8 A=9 Bb=10 B=11
     minor     optional: true for a minor-key song. Degrees are then relative to the minor home
               chord (i = Bm in B minor, bVII = A, bVI = G, bIII = D, V7 = F#7).
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
  },
  {
    id: 'wondering-why', short: 'Wondering Why', title: 'Wondering Why', artist: 'The Red Clay Strays', year: 2022,
    writers: 'Brandon Coleman, Drew Nix & Dan Couch',
    key: 4, bpm: 50, time: '6/8 (slow, assumed)', tuning: 'Standard', alt: 'Capo 2, D shapes (D, Em, G, A)', lyricsKey: 2,
    sections: [
      { name: 'Verse 1', note: 'Capo 2 shapes: D, Em, then G, A, D, A. Unhurried, a slow rocking six.', lines: [['I', 'ii'], ['IV', 'V', 'I', 'V']] },
      { name: 'Chorus', note: 'Same four chords. The last line stops on the home chord before the next verse.', lines: [['I', 'ii'], ['IV', 'V', 'I', 'V'], ['I', 'ii'], ['IV', 'V', 'I']] },
      { name: 'Verse 2', note: 'Same changes as Verse 1.', lines: [['I', 'ii'], ['IV', 'V', 'I', 'V']] },
      { name: 'Chorus 2', note: 'Same as the first chorus.', lines: [['I', 'ii'], ['IV', 'V', 'I', 'V'], ['I', 'ii'], ['IV', 'V', 'I']] },
      { name: 'Solo', note: 'Rocks between G and D/F# (D with F# in the bass, or just play D), then settles on Em and A. Hold each one for a full bar or more and let it build.', lines: [['IV', 'I', 'IV', 'I'], ['IV'], ['ii'], ['V']] },
      { name: 'Verse 3', note: 'Same changes, one last time before the final chorus.', lines: [['I', 'ii'], ['IV', 'V', 'I', 'V']] },
      { name: 'Final chorus', note: 'Same as the other choruses, then the title line again and a long finish on the home chord.', lines: [['I', 'ii'], ['IV', 'V', 'I', 'V'], ['I', 'ii'], ['IV', 'V', 'I'], ['I']] }
    ],
    chartNote: 'Sections follow the chart you supplied (capo 2, D-shape chords), which sounds in E. Key of E is confirmed by Klangio, Karaoke Version and PaidTabs. Tempo sources disagree: Klangio and Chordu analyse about 149-150 BPM, Karaoke Version says around 50 and variable, and PaidTabs lists 74. Those fit one slow 6/8 feel with the dotted quarter near 50, so the metronome is set to 50 and you should count 1-2-3-4-5-6 (or 1-2 with a lilt). Chordu\'s and Klangio\'s recording analyses also hear a passage on F#, G# and G#m that your chart does not show, and some charts play the home chord as D/F# in the solo. Trust the record and your ear.',
    patNote: 'The strum patterns below are general 4/4 feels, not a transcription. This song is a slow six, so use them only as a starting point and follow the record.',
    lyricsHelp: 'Your chart is written in D (capo 2 shapes). Paste it on the Lyrics tab and set "Chart written in" to D; the app moves the chords to your key and capo. Chords in brackets like [D] and chords on their own line above the words are recognized.',
    links: [
      { h: 'The record', items: [
        { t: 'Official lyric video (YouTube)', u: 'https://www.youtube.com/watch?v=JbxfFKvoAU4', d: 'The studio recording from Moment of Truth.' },
        { t: 'Live AF session', u: 'https://www.youtube.com/results?search_query=The+Red+Clay+Strays+Wondering+Why+Live+AF', d: 'The live version that went viral in 2023.' },
        { t: 'Klangio chord analysis', u: 'https://songs.klang.io/en/s/The%20Red%20Clay%20Strays/Wondering%20Why/GhcMmaUPtrk', d: 'Machine analysis: key of E, about 150 BPM.' }] },
      { h: 'Backing tracks', items: [
        { t: 'Karaoke Version backing track', u: 'https://www.karaoke-version.com/mp3-backingtrack/the-red-clay-strays/wondering-why.html', d: 'Licensed track in the original key of E. Starts a cappella.' },
        { t: 'Karaoke on YouTube', u: 'https://www.youtube.com/results?search_query=Wondering+Why+Red+Clay+Strays+karaoke', d: 'Vocals removed. Check the key in the title.' },
        { t: 'Instrumental', u: 'https://www.youtube.com/results?search_query=Wondering+Why+Red+Clay+Strays+instrumental' }] },
      { h: 'Lessons', items: [
        { t: 'SongNotes lesson', u: 'https://songnotes.net/lessons/557/', d: 'Chords, strumming, power chords and an easy capo 2 version (D, Em, G, A).' },
        { t: 'Guitar lessons', u: 'https://www.youtube.com/results?search_query=Wondering+Why+Red+Clay+Strays+guitar+lesson' },
        { t: 'Acoustic and fingerpicking', u: 'https://www.youtube.com/results?search_query=Wondering+Why+Red+Clay+Strays+acoustic+cover+guitar' }] },
      { h: 'Charts', items: [
        { t: 'Chordu jam-along (key of E)', u: 'https://chordu.com/chords-tabs-the-red-clay-strays-wondering-why-official-lyric-video--id_JbxfFKvoAU4', d: 'Chords scroll in time with the lyric video. About 149 BPM.' },
        { t: 'Songsterr tabs', u: 'https://www.songsterr.com/a/wsa/the-red-clay-strays-tabs-a100585?inst=guitar', d: 'Full tablature, including the resynched and acoustic versions.' },
        { t: 'Songfacts', u: 'https://www.songfacts.com/facts/the-red-clay-strays/wondering-why', d: 'Background on the song.' }] }
    ]
  },
  {
    id: 'hotel-california', short: 'Hotel California', title: 'Hotel California', artist: 'Eagles', year: 1977,
    writers: 'Don Felder, Don Henley & Glenn Frey',
    key: 11, minor: true, bpm: 74, time: '4/4', tuning: 'Standard', alt: 'Capo 7, Em shapes (or capo 2, Am shapes)', lyricsKey: 9,
    sections: [
      { name: 'Intro', note: 'The famous eight-chord cycle, played twice. Each chord gets one bar. On the record this is the roughly one-minute guitar intro.', lines: [['i', 'V7', 'bVII', 'IV'], ['bVI', 'bIII', 'iv', 'V7'], ['i', 'V7', 'bVII', 'IV'], ['bVI', 'bIII', 'iv', 'V7']] },
      { name: 'Verse', note: 'The same eight-chord cycle runs under every verse, usually twice per verse. Keep it steady and let the vocal sit on top.', lines: [['i', 'V7', 'bVII', 'IV'], ['bVI', 'bIII', 'iv', 'V7'], ['i', 'V7', 'bVII', 'IV'], ['bVI', 'bIII', 'iv', 'V7']] },
      { name: 'Chorus', note: 'Opens on G and D, which brightens the song for a moment, then falls back to Bm. Lift the dynamics here.', lines: [['bVI', 'bIII', 'V7', 'i'], ['bVI', 'bIII', 'iv', 'V7']] },
      { name: 'Later verses and choruses', note: 'The song alternates verse and chorus a few more times with the same chords. Follow the chart you paste on the Lyrics tab for the exact order.', lines: [['i', 'V7', 'bVII', 'IV'], ['bVI', 'bIII', 'iv', 'V7']] },
      { name: 'Outro solo', note: 'The two-guitar solo, just over two minutes, runs over the same eight-chord cycle many times. Solo, keep cycling the chords and fade, or stop after two or three passes on Bm.', lines: [['i', 'V7', 'bVII', 'IV'], ['bVI', 'bIII', 'iv', 'V7']] }
    ],
    chartNote: 'Key of B minor and about 74 BPM from Hooktheory and Karaoke Version, which notes the tempo varies slightly. The chord cycle (Bm, F#, A, E, G, D, Em, F#) matches the Ultimate Guitar and GuitarTwitt charts; many charts write F#7, and Hooktheory hears E9 and A(add9) colors. Don Felder said B minor is not a fun key to play guitar in, which is why most players use a capo: capo 7 with Em-shape chords, or capo 2 with Am-shape chords. Trust the record and your ear.',
    patNote: 'GuitarTwitt gives a strum of D U U U UDU DU. The record opens with picked guitar, so this or the arpeggio feel suits the intro and verses.',
    lyricsUrl: 'https://guitartwitt.com/hotel-california-chords-guitar-eagles',
    lyricsHelp: 'That chart uses capo 2 with Am-shape chords, and "Chart written in" is already set to match. With no capo the app shows the real chords (Bm and so on); set the capo to 2 on the Chart tab to see the chart\'s own Am shapes.',
    links: [
      { h: 'The record', items: [
        { t: 'Eagles, Hotel California (studio)', u: 'https://www.youtube.com/results?search_query=Eagles+Hotel+California+2013+remaster', d: 'The version this chart follows.' },
        { t: 'Hell Freezes Over (1994, acoustic)', u: 'https://www.youtube.com/results?search_query=Eagles+Hotel+California+Hell+Freezes+Over', d: 'The slower acoustic arrangement. Closest to a solo open mic version.' },
        { t: 'Behind the song (American Songwriter)', u: 'https://americansongwriter.com/behind-the-song-the-eagles-hotel-california/', d: 'How Don Felder wrote the music and why it ended up in B minor.' }] },
      { h: 'Backing tracks', items: [
        { t: 'Karaoke Version backing track', u: 'https://www.karaoke-version.com/mp3-backingtrack/eagles/hotel-california.html', d: 'Licensed MP3 in B minor, about $1.99, 6:40. Load it on the Play tab.' },
        { t: 'Short (45 edit) backing track', u: 'https://www.karaoke-version.com/mp3-backingtrack/eagles/hotel-california-45-edit.html', d: 'Shorter version, handy for an open mic time slot.' },
        { t: 'Guitar backing track (no guitar)', u: 'https://www.karaoke-version.com/guitar-backing-track/eagles/hotel-california.html', d: 'The full band with the guitar removed, so you play the guitar part.' }] },
      { h: 'Lessons', items: [
        { t: 'Don Felder lesson (Guitar World)', u: 'https://www.guitarworld.com/lessons/don-felders-hotel-california-guitar-lesson-video', d: 'The writer of the music shows how to play it.' },
        { t: 'Hooktheory TheoryTab', u: 'https://hooktheory.com/theorytab/view/eagles/hotel-california', d: 'Chords and melody synced to the song.' },
        { t: 'Guitar lessons on YouTube', u: 'https://www.youtube.com/results?search_query=Hotel+California+acoustic+guitar+lesson+capo+7' }] },
      { h: 'Charts', items: [
        { t: 'GuitarTwitt chart (capo 2)', u: 'https://guitartwitt.com/hotel-california-chords-guitar-eagles', d: 'Am-shape chords with a strum pattern.' },
        { t: 'Ultimate Guitar chords', u: 'https://tabs.ultimate-guitar.com/tab/eagles/hotel-california-chords-1092238', d: 'Open Bm-key chart. Read the comments for fixes.' }] }
    ]
  }
];
