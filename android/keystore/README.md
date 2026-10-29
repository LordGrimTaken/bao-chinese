# Demo signing key

`bao-demo.jks.b64` is a base64-encoded **demo** keystore used to sign every CI and local build so Android will accept in-place updates.

| Field | Value |
| --- | --- |
| Store password | `baochinese` |
| Key alias | `bao` |
| Key password | `baochinese` |
| Certificate | `CN=Bao Chinese Demo, O=Bao Chinese, C=US` |

## Warning

This key is **public**. It is fine for a side-loaded prototype and for testing the updater. It is **not** suitable for Google Play or a production app. Before a real release:

1. Generate a private keystore and store it in GitHub Actions secrets.
2. Replace the `demo` signing config in `android/app/build.gradle.kts`.
3. Publish a new application ID or ask testers to uninstall/reinstall once, because the signing certificate will change.

The updater checks the package name and version and relies on Android's signature enforcement. Because this demo key is public, a production build must use a private key.
