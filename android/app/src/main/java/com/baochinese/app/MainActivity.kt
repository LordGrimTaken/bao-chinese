package com.baochinese.app

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Context
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.speech.tts.TextToSpeech
import android.util.Log
import android.view.View
import android.view.WindowManager
import android.webkit.ConsoleMessage
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import java.util.Locale
import java.util.UUID

class MainActivity : Activity() {
    private lateinit var webView: WebView
    private val updater by lazy { Updater(this, webView) }
    private var tts: TextToSpeech? = null
    private var ttsReady = false
    private var pendingSpeech: Pair<String, Float>? = null

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.statusBarColor = Color.parseColor("#FFF9F0")
        window.navigationBarColor = Color.parseColor("#FFF9F0")
        window.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            window.decorView.systemUiVisibility =
                View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR or View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
        }

        webView = WebView(this)
        webView.setBackgroundColor(Color.parseColor("#FFF9F0"))
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            mediaPlaybackRequiresUserGesture = false
            mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            allowFileAccess = false
            allowContentAccess = false
            cacheMode = WebSettings.LOAD_DEFAULT
            userAgentString = "$userAgentString BaoAndroid/0.1"
        }
        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView,
                request: WebResourceRequest
            ): WebResourceResponse? {
                val url = request.url
                if (url.host != "appassets.androidplatform.net") return null
                val path = url.path?.removePrefix("/assets/www/") ?: return null
                if (path.contains("..")) return null
                return try {
                    WebResourceResponse(mimeFor(path), "utf-8", assets.open("www/$path"))
                } catch (error: Exception) {
                    Log.w("BaoWeb", "Asset miss: $path", error)
                    null
                }
            }

            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                // Keep the app self-contained: no external browsing inside the shell.
                return request.url.host != "appassets.androidplatform.net"
            }
        }
        webView.webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(message: ConsoleMessage): Boolean {
                Log.d("BaoWeb", "${message.message()} (${message.sourceId()}:${message.lineNumber()})")
                return true
            }
        }
        webView.addJavascriptInterface(BaoBridge(), "BaoNative")
        setContentView(webView)

        initTts()
        webView.loadUrl("https://appassets.androidplatform.net/assets/www/index.html")
    }

    private fun initTts() {
        tts = TextToSpeech(this) { status ->
            if (status == TextToSpeech.SUCCESS) {
                val engine = tts
                if (engine != null) {
                    val result = engine.setLanguage(Locale.SIMPLIFIED_CHINESE)
                    ttsReady = result != TextToSpeech.LANG_MISSING_DATA &&
                        result != TextToSpeech.LANG_NOT_SUPPORTED
                    if (!ttsReady) {
                        val fallback = engine.setLanguage(Locale.CHINESE)
                        ttsReady = fallback != TextToSpeech.LANG_MISSING_DATA &&
                            fallback != TextToSpeech.LANG_NOT_SUPPORTED
                    }
                    engine.setSpeechRate(0.9f)
                    pendingSpeech?.let { (text, rate) ->
                        pendingSpeech = null
                        speak(text, rate)
                    }
                }
            } else {
                Log.w("BaoTts", "Text-to-speech unavailable")
            }
        }
    }

    private fun speak(text: String, rate: Float) {
        if (!ttsReady) {
            pendingSpeech = text to rate
            return
        }
        tts?.setSpeechRate(rate.coerceIn(0.4f, 1.3f))
        tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, UUID.randomUUID().toString())
    }

    private fun mimeFor(path: String): String = when {
        path.endsWith(".html") -> "text/html"
        path.endsWith(".js") -> "application/javascript"
        path.endsWith(".css") -> "text/css"
        path.endsWith(".json") -> "application/json"
        path.endsWith(".webmanifest") -> "application/manifest+json"
        path.endsWith(".svg") -> "image/svg+xml"
        path.endsWith(".png") -> "image/png"
        path.endsWith(".mp3") -> "audio/mpeg"
        else -> "application/octet-stream"
    }

    inner class BaoBridge {
        @JavascriptInterface
        fun speak(text: String, rate: Float) {
            runOnUiThread { this@MainActivity.speak(text, rate) }
        }

        @JavascriptInterface
        fun stopSpeaking() {
            runOnUiThread { tts?.stop() }
        }

        @JavascriptInterface
        fun vibrate(milliseconds: Int) {
            runOnUiThread {
                val vibrator = getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator ?: return@runOnUiThread
                if (!vibrator.hasVibrator()) return@runOnUiThread
                val duration = milliseconds.coerceIn(1, 80).toLong()
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createOneShot(duration, VibrationEffect.DEFAULT_AMPLITUDE))
                } else {
                    @Suppress("DEPRECATION")
                    vibrator.vibrate(duration)
                }
            }
        }

        @JavascriptInterface
        fun isReady(): Boolean = ttsReady

        @JavascriptInterface
        fun checkForUpdates(force: Boolean) {
            runOnUiThread { updater.check(force) }
        }

        @JavascriptInterface
        fun installUpdate(url: String, version: String, digest: String, size: String) {
            val info = UpdateInfo(
                version = version,
                notes = "",
                downloadUrl = url,
                size = size.toLongOrNull() ?: 0L,
                digest = digest.takeIf { it.isNotBlank() },
                pageUrl = ""
            )
            runOnUiThread { updater.downloadAndInstall(info) }
        }

        @JavascriptInterface
        fun openInstallSettings() {
            runOnUiThread { updater.openInstallSettings() }
        }

        @JavascriptInterface
        fun getVersionName(): String = updater.currentVersionName()
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        webView.evaluateJavascript("window.BaoApp ? Boolean(BaoApp.handleBack()) : false") { result ->
            if (result != "true") finish()
        }
    }

    override fun onDestroy() {
        tts?.stop()
        tts?.shutdown()
        tts = null
        webView.destroy()
        super.onDestroy()
    }
}
