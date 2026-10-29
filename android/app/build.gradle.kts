import org.gradle.api.tasks.Copy
import java.util.Base64

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

/**
 * A stable demo signing key is required for in-place APK updates: Android
 * refuses to install an update signed by a different certificate. The key is
 * stored as base64 text so the build is reproducible on CI and locally.
 *
 * This key is public and for demos only. See keystore/README.md.
 */
val demoKeystore = layout.buildDirectory.file("keystore/bao-demo.jks").get().asFile
if (!demoKeystore.exists()) {
    demoKeystore.parentFile.mkdirs()
    val encoded = rootProject.file("keystore/bao-demo.jks.b64").readText().trim()
    demoKeystore.writeBytes(Base64.getDecoder().decode(encoded))
}

android {
    namespace = "com.baochinese.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.baochinese.app"
        minSdk = 26
        targetSdk = 35
        versionCode = 8
        versionName = "0.5.0"
    }

    signingConfigs {
        create("demo") {
            storeFile = demoKeystore
            storePassword = "baochinese"
            keyAlias = "bao"
            keyPassword = "baochinese"
        }
    }

    buildTypes {
        debug {
            signingConfig = signingConfigs.getByName("demo")
        }
        release {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("demo")
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

/**
 * Bundle the web app into the APK at build time. The single source of truth
 * stays at the repository root, so there is no duplicated www/ directory.
 */
val syncWeb by tasks.registering(Copy::class) {
    from(rootProject.file("../")) {
        include("index.html")
        include("manifest.webmanifest")
        include("sw.js")
        include("assets/**")
        include("src/**")
        exclude("**/*.md")
    }
    into(layout.projectDirectory.dir("src/main/assets/www"))
}

tasks.named("preBuild") {
    dependsOn(syncWeb)
}
