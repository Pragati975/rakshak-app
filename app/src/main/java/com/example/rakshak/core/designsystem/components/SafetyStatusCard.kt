package com.example.rakshak.core.designsystem.components

import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp
import com.example.rakshak.core.designsystem.theme.RakshakColors

enum class SafetyStatus { SAFE, WARNING, CRITICAL, OFFLINE }

@Composable
fun SafetyStatusCard(
    label: String,
    status: SafetyStatus,
    modifier: Modifier = Modifier,
) {
    val (color, label2) = when (status) {
        SafetyStatus.SAFE -> RakshakColors.statusSafe to "Safe"
        SafetyStatus.WARNING -> RakshakColors.statusWarning to "Warning"
        SafetyStatus.CRITICAL -> RakshakColors.statusCritical to "Critical"
        SafetyStatus.OFFLINE -> RakshakColors.statusOffline to "Offline"
    }
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Column {
                Text(
                    text = label,
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    text = label2,
                    style = MaterialTheme.typography.titleLarge,
                    color = color,
                )
            }
            Spacer(Modifier.width(12.dp))
            StatusPulse(color = color, status = status)
        }
    }
}

@Composable
private fun StatusPulse(color: Color, status: SafetyStatus) {
    val transition = rememberInfiniteTransition(label = "pulse")
    val alpha by transition.animateFloat(
        initialValue = if (status == SafetyStatus.OFFLINE) 0.4f else 0.3f,
        targetValue = if (status == SafetyStatus.OFFLINE) 0.4f else 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(if (status == SafetyStatus.CRITICAL) 800 else 1600),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "pulseAlpha",
    )
    Canvas(modifier = Modifier.size(48.dp).alpha(alpha)) {
        drawCircle(color = color.copy(alpha = 0.2f), radius = size.minDimension / 2f)
        drawCircle(
            color = color,
            radius = size.minDimension / 3f,
            style = Stroke(width = 3.dp.toPx(), cap = StrokeCap.Round),
        )
        drawCircle(color = color, radius = size.minDimension / 5f)
    }
}
