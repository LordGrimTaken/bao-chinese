# Android shell

A thin native wrapper around the Bao web app. It serves the app from a secure fake origin (`https://appassets.androidplatform.net/assets/www/`) via `shouldInterceptRequest`, so ES modules and `localStorage` work without a local server.

## What is native

- `WebView` with JavaScript, DOM storage, and media playback.
- Android `TextToSpeech` for Mandarin audio (`BaoNative.speak`).
- Vibration (`BaoNative.vibrate`).
- Back button → `BaoApp.handleBack()`.
- Blocking external navigation and file/content access.

Everything else — UI, lesson engine, SRS, progress — is the same web app in `../`.

## Build

Requirements: JDK 17, Android SDK 35, Gradle 8.9+.

```bash
gradle -p android :app:assembleDebug
# android/app/build/outputs/apk/debug/app-debug.apk
```

The `syncWeb` Gradle task copies `index.html`, `manifest.webmanifest`, `sw.js`, `assets/`, and `src/` from the repo root into `app/src/main/assets/www` at build time. The generated `www/` directory is gitignored, so there is no duplicated source.

There is **no Gradle wrapper jar** in the repo (binaries are not hand-authored here). Use Android Studio’s Gradle, a local Gradle 8.9+, or the `Android APK` GitHub Actions workflow, which installs Gradle and uploads the debug APK as an artifact.

## Release

For a Play Store build:

1. Create a release keystore and add it as GitHub Actions secrets.
2. Add a signing config to `app/build.gradle.kts`.
3. Build `:app:bundleRelease` and upload the `.aab`.
4. Replace the placeholder launcher vector with a designed adaptive icon.

## Known gaps

- Blob downloads (progress export) may not work in WebView.
- The file picker for progress import is not wired.
- TTS quality depends on the device’s Chinese voice data. The bridge falls back to `Locale.CHINESE` and queues one pending utterance while initializing.
