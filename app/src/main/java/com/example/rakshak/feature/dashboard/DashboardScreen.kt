package com.example.rakshak.feature.dashboard

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.rakshak.core.designsystem.components.SafetyStatus
import com.example.rakshak.core.designsystem.components.SafetyStatusCard
import com.example.rakshak.core.designsystem.theme.RakshakColors

data class FieldUnit(
    val id: String,
    val name: String,
    val status: SafetyStatus,
    val location: String,
    val lastUpdate: String,
)

val demoUnits = listOf(
    FieldUnit("1", "Alpha Team", SafetyStatus.SAFE, "Sector A-3", "2 min ago"),
    FieldUnit("2", "Bravo Team", SafetyStatus.WARNING, "Sector B-1", "5 min ago"),
    FieldUnit("3", "Charlie Team", SafetyStatus.CRITICAL, "Sector C-7", "1 min ago"),
    FieldUnit("4", "Delta Team", SafetyStatus.OFFLINE, "Sector D-2", "12 min ago"),
    FieldUnit("5", "Echo Team", SafetyStatus.SAFE, "Sector E-5", "3 min ago"),
)

@Composable
fun DashboardScreen(
    isDemo: Boolean,
    modifier: Modifier = Modifier,
) {
    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            if (isDemo) DemoBadge()
        }
        item {
            Text(
                text = "Command Overview",
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.onBackground,
                fontWeight = FontWeight.Bold,
            )
        }
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                SafetyStatusCard(
                    label = "Safe",
                    status = SafetyStatus.SAFE,
                    modifier = Modifier.weight(1f),
                )
                SafetyStatusCard(
                    label = "Warning",
                    status = SafetyStatus.WARNING,
                    modifier = Modifier.weight(1f),
                )
            }
        }
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                SafetyStatusCard(
                    label = "Critical",
                    status = SafetyStatus.CRITICAL,
                    modifier = Modifier.weight(1f),
                )
                SafetyStatusCard(
                    label = "Offline",
                    status = SafetyStatus.OFFLINE,
                    modifier = Modifier.weight(1f),
                )
            }
        }
        item {
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Field Units (${demoUnits.size})",
                style = MaterialTheme.typography.titleLarge,
                color = MaterialTheme.colorScheme.onBackground,
            )
        }
        items(demoUnits) { unit ->
            FieldUnitCard(unit = unit)
        }
    }
}

@Composable
private fun DemoBadge() {
    Surface(
        shape = RoundedCornerShape(8.dp),
        color = RakshakColors.accent.copy(alpha = 0.15f),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Text(
            text = "DEMO MODE",
            style = MaterialTheme.typography.labelMedium,
            color = RakshakColors.accent,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
        )
    }
}

@Composable
private fun FieldUnitCard(unit: FieldUnit) {
    val color = when (unit.status) {
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
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = unit.name,
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onSurface,
                    fontWeight = FontWeight.SemiBold,
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "${unit.location}  -  ${unit.lastUpdate}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            Surface(
                shape = RoundedCornerShape(8.dp),
                color = color.copy(alpha = 0.15f),
            ) {
                Text(
                    text = unit.status.name.lowercase().replaceFirstChar { it.uppercase() },
                    style = MaterialTheme.typography.labelSmall,
                    color = color,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                )
            }
        }
    }
}
