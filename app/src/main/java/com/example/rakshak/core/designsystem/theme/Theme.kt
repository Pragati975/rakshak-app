package com.example.rakshak.core.designsystem.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

object RakshakColors {
    val background = Color(0xFF0A0E13)
    val surface = Color(0xFF10161D)
    val surfaceElevated = Color(0xFF16202A)
    val outline = Color(0xFF263341)
    val textPrimary = Color(0xFFE8EEF5)
    val textSecondary = Color(0xFF93A1B3)
    val primary = Color(0xFF2DD4A7)
    val onPrimary = Color(0xFF06231B)
    val primaryContainer = Color(0xFF0F3B31)
    val secondary = Color(0xFF3B82F6)
    val accent = Color(0xFFF59E0B)
    val statusSafe = Color(0xFF34D399)
    val statusWarning = Color(0xFFFBBF24)
    val statusCritical = Color(0xFFF43F5E)
    val statusOffline = Color(0xFF64748B)
}

private val DarkColorScheme = darkColorScheme(
    primary = RakshakColors.primary,
    onPrimary = RakshakColors.onPrimary,
    primaryContainer = RakshakColors.primaryContainer,
    secondary = RakshakColors.secondary,
    background = RakshakColors.background,
    surface = RakshakColors.surface,
    surfaceVariant = RakshakColors.surfaceElevated,
    outline = RakshakColors.outline,
    error = RakshakColors.statusCritical,
    onBackground = RakshakColors.textPrimary,
    onSurface = RakshakColors.textPrimary,
    onSurfaceVariant = RakshakColors.textSecondary,
)

private val LightColorScheme = lightColorScheme(
    primary = RakshakColors.primary,
    onPrimary = RakshakColors.onPrimary,
    primaryContainer = RakshakColors.primaryContainer,
    secondary = RakshakColors.secondary,
    error = RakshakColors.statusCritical,
)

private val RakshakTypography = Typography(
    displayLarge = TextStyle(fontWeight = FontWeight.Bold, fontSize = 32.sp, lineHeight = 40.sp),
    displayMedium = TextStyle(fontWeight = FontWeight.Bold, fontSize = 28.sp, lineHeight = 36.sp),
    headlineMedium = TextStyle(fontWeight = FontWeight.SemiBold, fontSize = 24.sp, lineHeight = 32.sp),
    headlineSmall = TextStyle(fontWeight = FontWeight.SemiBold, fontSize = 20.sp, lineHeight = 28.sp),
    titleLarge = TextStyle(fontWeight = FontWeight.SemiBold, fontSize = 18.sp, lineHeight = 24.sp),
    titleMedium = TextStyle(fontWeight = FontWeight.Medium, fontSize = 16.sp, lineHeight = 22.sp),
    bodyLarge = TextStyle(fontWeight = FontWeight.Normal, fontSize = 16.sp, lineHeight = 24.sp),
    bodyMedium = TextStyle(fontWeight = FontWeight.Normal, fontSize = 14.sp, lineHeight = 20.sp),
    bodySmall = TextStyle(fontWeight = FontWeight.Normal, fontSize = 12.sp, lineHeight = 16.sp),
    labelLarge = TextStyle(fontWeight = FontWeight.Medium, fontSize = 14.sp, lineHeight = 20.sp),
    labelMedium = TextStyle(fontWeight = FontWeight.Medium, fontSize = 12.sp, lineHeight = 16.sp),
    labelSmall = TextStyle(fontWeight = FontWeight.Medium, fontSize = 11.sp, lineHeight = 14.sp),
)

@Composable
fun RakshakTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme,
        typography = RakshakTypography,
        content = content,
    )
}
