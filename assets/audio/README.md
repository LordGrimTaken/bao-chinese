# Bundled audio

596 Mandarin clips generated with Microsoft Edge neural TTS:

| Folder | Files | Content |
| --- | ---: | --- |
| `words/` | 314 | every course + HSK 1 deck word |
| `sentences/` | 246 | every course example sentence |
| `tones/` | 36 | every tone-pair minimal-pair word |

- Voice: `zh-CN-XiaoxiaoNeural`
- Rate: `-8%`
- Format: MP3, mono, 24 kHz

File names are stable content IDs: `words/<word-id>.mp3`,
`sentences/<lesson-id>s<n>.mp3`, `tones/<syllable>-<tone>.mp3`. The app resolves
a clip by looking up the Chinese text in the course data; if a clip is missing
or fails to load, it falls back to Android TTS / Web Speech.

## Important: not human recordings

These are high-quality **neural TTS**, not studio recordings by a native
speaker. They are a large improvement over device TTS for consistency and
offline playback, but a paid release should use human voice actors and verify
the TTS provider's commercial terms.

## Regenerate

```bash
python -m pip install -r tools/requirements-audio.txt
python tools/generate-audio.py
```

The generator writes to `%LOCALAPPDATA%\BaoAudio` by default, then the publish
script uploads those files into `assets/audio/`. This keeps binary assets out
of the authoring workspace while still shipping them in the repo and APK.
