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

## Auto-update

Every build is signed with the stable demo keystore in `keystore/bao-demo.jks.b64` (decoded at configuration time). This is required so Android will accept an in-place update.

On launch (throttled to 6 hours) and from **Me → Check for updates**, the app:

1. Reads `https://api.github.com/repos/LordGrimTaken/bao-chinese/releases/latest`.
2. Picks the `.apk` asset and downloads it to app-private `filesDir/updates`.
3. Verifies the GitHub SHA-256 digest, `com.baochinese.app`, and a higher `versionCode`.
4. Commits a `PackageInstaller` session; Android shows the install confirmation.
5. The first time, the user must allow “Install unknown apps” for Bao.

To ship an update:

1. Bump `versionCode` and `versionName` in `app/build.gradle.kts`.
2. Merge to `main`; wait for the `Android APK` workflow to pass.
3. Download the artifact and create a release tagged `vX.Y.Z` with `app-debug.apk`.
4. Existing v0.1.1+ installs will see it on next check.

Do **not** change the signing key for normal updates. The demo key is public; replace it with a private key before production.

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
