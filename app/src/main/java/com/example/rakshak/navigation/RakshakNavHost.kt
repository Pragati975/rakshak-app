package com.example.rakshak.navigation

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavDestination.Companion.hasRoute
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.example.rakshak.core.designsystem.theme.RakshakColors
import com.example.rakshak.feature.alerts.AlertsScreen
import com.example.rakshak.feature.auth.AuthScreen
import com.example.rakshak.feature.dashboard.DashboardScreen
import com.example.rakshak.feature.map.MapScreen
import com.example.rakshak.feature.splash.SplashScreen

private data class BottomDestination(
    val route: Any,
    val label: String,
    val icon: ImageVector,
)

private val bottomDestinations = listOf(
    BottomDestination(Routes.Dashboard, "Dashboard", Icons.Filled.Dashboard),
    BottomDestination(Routes.Map, "Map", Icons.Filled.Map),
    BottomDestination(Routes.Alerts, "Alerts", Icons.Filled.Notifications),
)

@Composable
fun RakshakNavHost() {
    val navController = rememberNavController()
    val backStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = backStackEntry?.destination

    val showBottomBar = bottomDestinations.any { dest ->
        currentDestination?.hasRoute(dest.route::class) == true
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = MaterialTheme.colorScheme.background,
        bottomBar = {
            if (showBottomBar) {
                NavigationBar(
                    containerColor = MaterialTheme.colorScheme.surface,
                ) {
                    bottomDestinations.forEach { dest ->
                        val selected = currentDestination?.hasRoute(dest.route::class) == true
                        NavigationBarItem(
                            selected = selected,
                            onClick = {
                                navController.navigate(dest.route) {
                                    popUpTo(navController.graph.findStartDestination().id) {
                                        saveState = true
                                    }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            icon = { Icon(dest.icon, contentDescription = dest.label) },
                            label = { Text(dest.label) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = RakshakColors.primary,
                                selectedTextColor = RakshakColors.primary,
                                unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                                unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant,
                                indicatorColor = RakshakColors.primary.copy(alpha = 0.12f),
                            ),
                        )
                    }
                }
            }
        },
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Routes.Splash,
            modifier = Modifier.fillMaxSize(),
        ) {
            composable<Routes.Splash> {
                SplashScreen(
                    onTimeout = {
                        navController.navigate(Routes.Auth) {
                            popUpTo(Routes.Splash) { inclusive = true }
                        }
                    },
                    modifier = Modifier.padding(innerPadding),
                )
            }
            composable<Routes.Auth> {
                AuthScreen(
                    onSignIn = {
                        navController.navigate(Routes.Dashboard) {
                            popUpTo(Routes.Auth) { inclusive = true }
                        }
                    },
                    modifier = Modifier.padding(innerPadding),
                )
            }
            composable<Routes.Dashboard> {
                DashboardScreen(
                    isDemo = true,
                    modifier = Modifier.padding(innerPadding),
                )
            }
            composable<Routes.Map> {
                MapScreen(
                    modifier = Modifier.padding(innerPadding),
                )
            }
            composable<Routes.Alerts> {
                AlertsScreen(
                    modifier = Modifier.padding(innerPadding),
                )
            }
        }
    }
}
