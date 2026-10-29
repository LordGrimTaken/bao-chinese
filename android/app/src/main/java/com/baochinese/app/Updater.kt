package com.baochinese.app

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageInstaller
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.webkit.WebView
import org.json.JSONObject
import java.io.File
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL
import java.security.MessageDigest
import java.util.Locale
import java.util.concurrent.Executors

/** Metadata for the latest GitHub release that contains an APK. */
data class UpdateInfo(
    val version: String,
    val notes: String,
    val downloadUrl: String,
    val size: Long,
    val digest: String?,
    val pageUrl: String
)

/**
 * Checks the public GitHub Releases API for a newer APK, downloads it into
 * app-private storage, verifies its checksum and package/version, then hands
 * it to Android's PackageInstaller.
 *
 * No external storage permission or FileProvider is required.
 */
class Updater(
    private val context: Context,
    private val webView: WebView
) {
    private val main = Handler(Looper.getMainLooper())
    private val executor = Executors.newSingleThreadExecutor()
    private val preferences = context.getSharedPreferences("bao_updater", Context.MODE_PRIVATE)

    private fun js(script: String) {
        main.post {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
                webView.evaluateJavascript(script, null)
            }
        }
    }

    private fun notifyLatest(version: String) {
        js("window.BaoUpdate && BaoUpdate.onLatest(${JSONObject.quote(version)})")
    }

    private fun notifyError(message: String) {
        js("window.BaoUpdate && BaoUpdate.onError(${JSONObject.quote(message)})")
    }

    fun check(force: Boolean) {
        val currentVersion = currentVersionName()
        val now = System.currentTimeMillis()
        if (!force && now - preferences.getLong("last_check", 0L) < CHECK_INTERVAL_MS) {
            notifyLatest(currentVersion)
            return
        }
        executor.execute {
            try {
                val info = fetchLatest(currentVersion)
                preferences.edit().putLong("last_check", System.currentTimeMillis()).apply()
                if (info == null) {
                    notifyLatest(currentVersion)
                } else {
                    val json = JSONObject().apply {
                        put("version", info.version)
                        put("notes", info.notes)
                        put("url", info.downloadUrl)
                        put("size", info.size)
                        put("digest", info.digest ?: "")
                        put("pageUrl", info.pageUrl)
                    }.toString()
                    js("window.BaoUpdate && BaoUpdate.onUpdate($json)")
                }
            } catch (error: Exception) {
                notifyError(error.message ?: "Could not check for updates")
            }
        }
    }

    private fun fetchLatest(currentVersion: String): UpdateInfo? {
        val connection = URL(API_URL).openConnection() as HttpURLConnection
        connection.requestMethod = "GET"
        connection.connectTimeout = 15_000
        connection.readTimeout = 20_000
        connection.setRequestProperty("Accept", "application/vnd.github+json")
        connection.setRequestProperty("User-Agent", "BaoChinese/$currentVersion")
        try {
            val code = connection.responseCode
            if (code != HttpURLConnection.HTTP_OK) {
                throw IOException("GitHub returned HTTP $code")
            }
            val body = connection.inputStream.bufferedReader(Charsets.UTF_8).use { it.readText() }
            val release = JSONObject(body)
            val tag = release.optString("tag_name").removePrefix("v").trim()
            if (tag.isEmpty() || !isNewer(tag, currentVersion)) return null
            val assets = release.optJSONArray("assets") ?: return null
            var apk: JSONObject? = null
            for (index in 0 until assets.length()) {
                val asset = assets.optJSONObject(index) ?: continue
                if (asset.optString("name").endsWith(".apk", ignoreCase = true)) {
                    apk = asset
                    break
                }
            }
            val asset = apk ?: return null
            val downloadUrl = asset.optString("browser_download_url")
            if (downloadUrl.isEmpty()) return null
            return UpdateInfo(
                version = tag,
                notes = release.optString("body").trim(),
                downloadUrl = downloadUrl,
                size = asset.optLong("size", 0L),
                digest = asset.optString("digest").takeIf { it.startsWith("sha256:") },
                pageUrl = release.optString("html_url")
            )
        } finally {
            connection.disconnect()
        }
    }

    fun downloadAndInstall(info: UpdateInfo) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O &&
            !context.packageManager.canRequestPackageInstalls()
        ) {
            js("window.BaoUpdate && BaoUpdate.onPermissionNeeded()")
            return
        }
        val currentCode = currentVersionCode()
        executor.execute {
            var connection: HttpURLConnection? = null
            try {
                val directory = File(context.filesDir, "updates").apply { mkdirs() }
                directory.listFiles()?.forEach { it.delete() }
                val partial = File(directory, "update-${info.version}.apk.part")
                val target = File(directory, "update-${info.version}.apk")

                var url = URL(info.downloadUrl)
                var responseCode = 0
                for (redirect in 0 until 6) {
                    connection = url.openConnection() as HttpURLConnection
                    connection.instanceFollowRedirects = false
                    connection.connectTimeout = 20_000
                    connection.readTimeout = 90_000
                    connection.setRequestProperty("User-Agent", "BaoChinese/Android")
                    responseCode = connection.responseCode
                    if (responseCode in 300..399) {
                        val location = connection.getHeaderField("Location")
                            ?: throw IOException("Download redirect had no location")
                        url = URL(url, location)
                        connection.disconnect()
                        connection = null
                        continue
                    }
                    break
                }
                if (responseCode != HttpURLConnection.HTTP_OK) {
                    throw IOException("Download failed with HTTP $responseCode")
                }
                val active = connection ?: throw IOException("Download connection was not opened")
                val total = active.contentLengthLong
                active.inputStream.use { input ->
                    partial.outputStream().use { output ->
                        val buffer = ByteArray(64 * 1024)
                        var downloaded = 0L
                        var lastPercent = -1
                        while (true) {
                            val read = input.read(buffer)
                            if (read < 0) break
                            output.write(buffer, 0, read)
                            downloaded += read
                            if (total > 0) {
                                val percent = ((downloaded * 100) / total).toInt().coerceIn(0, 100)
                                if (percent != lastPercent && percent % 2 == 0) {
                                    lastPercent = percent
                                    js("window.BaoUpdate && BaoUpdate.onProgress($percent)")
                                }
                            }
                        }
                        output.fd.sync()
                    }
                }
                active.disconnect()
                connection = null

                if (info.size > 0 && partial.length() != info.size) {
                    throw IOException("Downloaded size did not match the release")
                }
                info.digest?.removePrefix("sha256:")?.lowercase(Locale.US)?.let { expected ->
                    val actual = sha256(partial)
                    if (actual != expected) {
                        throw IOException("Checksum verification failed")
                    }
                }
                val archive = context.packageManager.getPackageArchiveInfo(partial.absolutePath, 0)
                    ?: throw IOException("The downloaded file is not a valid APK")
                if (archive.packageName != context.packageName) {
                    throw IOException("The downloaded APK is not Bao Chinese")
                }
                val newCode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                    archive.longVersionCode
                } else {
                    @Suppress("DEPRECATION")
                    archive.versionCode.toLong()
                }
                if (newCode <= currentCode) {
                    throw IOException("The downloaded APK is not newer")
                }
                if (!partial.renameTo(target)) {
                    throw IOException("Could not prepare the update")
                }
                js("window.BaoUpdate && BaoUpdate.onInstalling()")
                installOnMain(target)
            } catch (error: Exception) {
                js(
                    "window.BaoUpdate && BaoUpdate.onInstallError(${
                        JSONObject.quote(error.message ?: "Update failed")
                    })"
                )
            } finally {
                connection?.disconnect()
            }
        }
    }

    private fun installOnMain(file: File) {
        main.post {
            try {
                val installer = context.packageManager.packageInstaller
                val params = PackageInstaller.SessionParams(
                    PackageInstaller.SessionParams.MODE_FULL_INSTALL
                ).apply {
                    setAppPackageName(context.packageName)
                    setSize(file.length())
                }
                val sessionId = installer.createSession(params)
                installer.openSession(sessionId).use { session ->
                    file.inputStream().use { input ->
                        session.openWrite("base.apk", 0, file.length()).use { output ->
                            input.copyTo(output)
                            session.fsync(output)
                        }
                    }
                    val intent = Intent(context, InstallResultReceiver::class.java)
                    val flags = PendingIntent.FLAG_UPDATE_CURRENT or
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) PendingIntent.FLAG_MUTABLE else 0
                    val pending = PendingIntent.getBroadcast(context, sessionId, intent, flags)
                    session.commit(pending.intentSender)
                }
            } catch (error: Exception) {
                js(
                    "window.BaoUpdate && BaoUpdate.onInstallError(${
                        JSONObject.quote(error.message ?: "Could not start the installer")
                    })"
                )
            }
        }
    }

    fun openInstallSettings() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val intent = Intent(
                android.provider.Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                android.net.Uri.parse("package:${context.packageName}")
            )
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(intent)
        }
    }

    fun currentVersionName(): String {
        return try {
            context.packageManager.getPackageInfo(context.packageName, 0).versionName ?: "0"
        } catch (error: Exception) {
            "0"
        }
    }

    private fun currentVersionCode(): Long {
        return try {
            val info = context.packageManager.getPackageInfo(context.packageName, 0)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                info.longVersionCode
            } else {
                @Suppress("DEPRECATION")
                info.versionCode.toLong()
            }
        } catch (error: Exception) {
            0
        }
    }

    private fun sha256(file: File): String {
        val digest = MessageDigest.getInstance("SHA-256")
        file.inputStream().use { input ->
            val buffer = ByteArray(64 * 1024)
            while (true) {
                val read = input.read(buffer)
                if (read < 0) break
                digest.update(buffer, 0, read)
            }
        }
        return digest.digest().joinToString("") { "%02x".format(it.toInt() and 0xff) }
    }

    companion object {
        private const val API_URL = "https://api.github.com/repos/LordGrimTaken/bao-chinese/releases/latest"
        private const val CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000L

        /** Compare dotted numeric versions; "0.1.10" is newer than "0.1.9". */
        fun isNewer(latest: String, current: String): Boolean {
            val a = latest.split("-").first().split(".").map { it.toIntOrNull() ?: 0 }
            val b = current.split("-").first().split(".").map { it.toIntOrNull() ?: 0 }
            val size = maxOf(a.size, b.size)
            for (index in 0 until size) {
                val left = a.getOrElse(index) { 0 }
                val right = b.getOrElse(index) { 0 }
                if (left != right) return left > right
            }
            return false
        }
    }
}
