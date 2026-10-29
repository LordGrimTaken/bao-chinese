import org.gradle.api.tasks.Copy

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.baochinese.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.baochinese.app"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "0.1.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
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
