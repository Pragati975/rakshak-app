package com.example.rakshak.navigation

import kotlinx.serialization.Serializable

object Routes {
    @Serializable data object Splash
    @Serializable data object Auth
    @Serializable data object Dashboard
    @Serializable data object Map
    @Serializable data object Alerts
}
