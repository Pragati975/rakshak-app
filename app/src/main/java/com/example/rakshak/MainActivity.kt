package com.example.rakshak

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.example.rakshak.core.designsystem.theme.RakshakTheme
import com.example.rakshak.navigation.RakshakNavHost

/**
 * Single-Activity host. All screens are Compose destinations inside [RakshakNavHost].
 * Will be annotated with @AndroidEntryPoint in M3 when Hilt is wired up.
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            RakshakTheme {
                RakshakNavHost()
            }
        }
    }
}
