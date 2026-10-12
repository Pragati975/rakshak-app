package com.example.rakshak.feature.alerts

import androidx.compose.foundation.layout.Arrangement
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.rakshak.core.designsystem.components.SafetyStatus
import com.example.rakshak.core.designsystem.theme.RakshakColors

data class Alert(
    val id: String,
    val title: String,
    val description: String,
    val severity: SafetyStatus,
    val time: String,
    val location: String,
)

val demoAlerts = listOf(
    Alert("1", "Perimeter Breach", "Sensor trip detected on north fence line", SafetyStatus.CRITICAL, "1 min ago", "Sector C-7"),
    Alert("2", "Low Battery", "Charlie Team device battery below 15%", SafetyStatus.WARNING, "5 min ago", "Sector C-7"),
    Alert("3", "Unit Offline", "Delta Team has stopped reporting", SafetyStatus.OFFLINE, "12 min ago", "Sector D-2"),
    Alert("4", "Routine Check", "Alpha Team completed scheduled patrol", SafetyStatus.SAFE, "18 min ago", "Sector A-3"),
)

@Composable
fun AlertsScreen(modifier: Modifier = Modifier) {
    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            Text(
                text = "Active Alerts",
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.onBackground,
                fontWeight = FontWeight.Bold,
            )
        }
        if (demoAlerts.isEmpty()) {
            item {
                Box(
                    modifier = Modifier.fillMaxWidth().padding(top = 120.dp),
                    contentAlignment = Alignment.Center,
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = "All clear",
                            style = MaterialTheme.typography.titleLarge,
                            color = RakshakColors.statusSafe,
                        )
                        Spacer(Modifier.height(8.dp))
                        Text(
                            text = "No active alerts. The situation is stable.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
            }
        } else {
            items(demoAlerts) { alert ->
                AlertCard(alert = alert)
            }
        }
    }
}

@Composable
private fun AlertCard(alert: Alert) {
    val color = when (alert.severity) {
        SafetyStatus.SAFE -> RakshakColors.statusSafe
        SafetyStatus.WARNING -> RakshakColors.statusWarning
        SafetyStatus.CRITICAL -> RakshakColors.statusCritical
        SafetyStatus.OFFLINE -> RakshakColors.statusOffline
    }
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
        ) {
            Surface(
                shape = CircleShape,
                color = color.copy(alpha = 0.2f),
                modifier = Modifier.size(40.dp),
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Text(
                        text = when (alert.severity) {
                            SafetyStatus.CRITICAL -> "!"
                            SafetyStatus.WARNING -> "~"
                            SafetyStatus.OFFLINE -> "x"
                            SafetyStatus.SAFE -> "."
                        },
                        style = MaterialTheme.typography.titleMedium,
                        color = color,
                        fontWeight = FontWeight.Bold,
                    )
                }
            }
            Spacer(Modifier.size(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = alert.title,
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onSurface,
                    fontWeight = FontWeight.SemiBold,
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    text = alert.description,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                Spacer(Modifier.height(6.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text(
                        text = alert.location,
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    Text(
                        text = alert.time,
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
        }
    }
}
