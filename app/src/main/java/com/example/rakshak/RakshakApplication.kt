package com.example.rakshak

import android.app.Application
import timber.log.Timber

/**
 * Application entry point. Hilt graph will be wired up in M3.
 * Debug-only Timber tree so no PII leaks in release.
 */
class RakshakApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        if (BuildConfig.DEBUG) {
            Timber.plant(Timber.DebugTree())
        }
    }
}
