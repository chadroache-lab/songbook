# Open Mic Songbook

A small practice app for learning songs to play at open mic nights. It installs to an iPhone home screen and works offline.

For each song it shows:

- **Chart:** key and capo selector, a song map in chords and Nashville numbers, strum patterns that light up with the metronome, chord diagrams and a metronome.
- **Lyrics:** paste your own lyrics and chords. Chords in `[C]` brackets or on their own line above the words are both recognized and moved to your key and capo. Includes auto-scroll and a Stage view for performing.
- **Takes:** record a run-through with the phone's microphone, with an optional count-in. Play takes back at slower speed, add notes, and share them.
- **Prep:** a practice plan, listening links and open mic checklists.

## Install on an iPhone

1. Open the app's address in **Safari**.
2. Tap the **Share** button, then **Add to Home Screen**.
3. Open it from the home screen icon.

## Privacy

Lyrics, notes, ticks and recordings are stored only on the device that made them. Nothing is uploaded. Use **More › Save a backup** for lyrics and settings, and **Share** on each take to keep recordings.

## Adding songs

Built-in songs live in `songs.js`. The comment at the top of that file explains every field. Songs can also be added in the app from a `.json` song file with the same fields (**More › Add a song from a file**).

No lyrics are stored in this repository.

## Releasing a change

Bump `VERSION` in `sw.js` and `APP_VERSION` in `app.js`. Installed copies show an **Update** prompt the next time they open.
