package com.example.rakshak.feature.map

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.rakshak.core.designsystem.components.SafetyStatus
import com.example.rakshak.core.designsystem.theme.RakshakColors

data class MapUnit(
    val name: String,
    val status: SafetyStatus,
    val x: Float,
    val y: Float,
)

val mapUnits = listOf(
    MapUnit("Alpha", SafetyStatus.SAFE, 0.25f, 0.3f),
    MapUnit("Bravo", SafetyStatus.WARNING, 0.55f, 0.25f),
    MapUnit("Charlie", SafetyStatus.CRITICAL, 0.7f, 0.65f),
    MapUnit("Delta", SafetyStatus.OFFLINE, 0.4f, 0.7f),
    MapUnit("Echo", SafetyStatus.SAFE, 0.8f, 0.4f),
)

@Composable
fun MapScreen(modifier: Modifier = Modifier) {
    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = androidx.compose.foundation.layout.Arrangement.spacedBy(12.dp),
    ) {
        item {
            Text(
                text = "Tactical Map",
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.onBackground,
                fontWeight = FontWeight.Bold,
            )
        }
        item {
            TacticalMapCanvas(units = mapUnits, modifier = Modifier.fillMaxWidth().height(280.dp))
        }
        item {
            Text(
                text = "Units on Map",
                style = MaterialTheme.typography.titleLarge,
                color = MaterialTheme.colorScheme.onBackground,
            )
        }
        items(mapUnits) { unit ->
            MapLegendRow(unit = unit)
        }
    }
}

@Composable
private fun TacticalMapCanvas(units: List<MapUnit>, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = RakshakColors.background),
    ) {
        Canvas(modifier = Modifier.fillMaxSize().padding(12.dp)) {
            val w = size.width
            val h = size.height
            // Grid lines
            val gridColor = RakshakColors.outline.copy(alpha = 0.4f)
            for (i in 0..4) {
                val x = w * i / 4f
                drawLine(gridColor, Offset(x, 0f), Offset(x, h), strokeWidth = 1f)
                val y = h * i / 4f
                drawLine(gridColor, Offset(0f, y), Offset(w, y), strokeWidth = 1f)
            }
            // Sector labels
            // Unit markers
            units.forEach { unit ->
                val pos = Offset(unit.x * w, unit.y * h)
                val color = when (unit.status) {
                    SafetyStatus.SAFE -> RakshakColors.statusSafe
                    SafetyStatus.WARNING -> RakshakColors.statusWarning
                    SafetyStatus.CRITICAL -> RakshakColors.statusCritical
                    SafetyStatus.OFFLINE -> RakshakColors.statusOffline
                }
                drawCircle(color.copy(alpha = 0.15f), radius = 18f, center = pos)
                drawCircle(
                    color = color,
                    radius = 8f,
                    center = pos,
                    style = Stroke(width = 3f, cap = StrokeCap.Round),
                )
                if (unit.status == SafetyStatus.CRITICAL) {
                    drawCircle(color.copy(alpha = 0.3f), radius = 28f, center = pos)
                }
            }
        }
    }
}

@Composable
private fun MapLegendRow(unit: MapUnit) {
    val color = when (unit.status) {
        SafetyStatus.SAFE -> RakshakColors.statusSafe
        SafetyStatus.WARNING -> RakshakColors.statusWarning
        SafetyStatus.CRITICAL -> RakshakColors.statusCritical
        SafetyStatus.OFFLINE -> RakshakColors.statusOffline
    }
    Row(
        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Surface(
            shape = RoundedCornerShape(4.dp),
            color = color,
            modifier = Modifier.size(12.dp),
        ) {}
        Spacer(Modifier.size(10.dp))
        Text(
            text = unit.name,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurface,
            fontWeight = FontWeight.Medium,
        )
        Spacer(Modifier.weight(1f))
        Text(
            text = unit.status.name.lowercase().replaceFirstChar { it.uppercase() },
            style = MaterialTheme.typography.labelMedium,
            color = color,
        )
    }
}
