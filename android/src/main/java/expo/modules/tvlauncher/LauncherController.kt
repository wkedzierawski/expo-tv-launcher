package expo.modules.tvlauncher

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.provider.Settings
import android.util.Log

internal object LauncherController {
  private const val TAG = "ExpoTvLauncher"
  private const val PREFERENCES_NAME = "expo_tv_launcher_preferences"
  private const val TARGET_PACKAGE_KEY = "target_package"
  private const val TARGET_PACKAGE_META_DATA_KEY = "expo.modules.tvlauncher.TARGET_PACKAGE"
  private val KNOWN_STOCK_LAUNCHER_PACKAGES = listOf(
    "com.google.android.tvlauncher",
    "com.google.android.apps.tv.launcherx",
    "com.google.android.tungsten.setupwraith"
  )

  private fun preferences(context: Context) =
    context.applicationContext.getSharedPreferences(PREFERENCES_NAME, Context.MODE_PRIVATE)

  fun setTargetPackage(context: Context, packageName: String?) {
    val normalizedPackage = normalizeTargetPackage(context, packageName)

    preferences(context).edit().putString(TARGET_PACKAGE_KEY, normalizedPackage).apply()
  }

  fun getTargetPackage(context: Context): String? {
    return preferences(context).getString(TARGET_PACKAGE_KEY, null)
      ?: getConfiguredTargetPackage(context)
  }

  fun isLauncherEnabled(context: Context): Boolean {
    val packageManager = context.packageManager
    val componentName = ComponentName(context, LauncherActivity::class.java)
    val state = try {
      packageManager.getComponentEnabledSetting(componentName)
    } catch (_: IllegalArgumentException) {
      return false
    }

    return when (state) {
      PackageManager.COMPONENT_ENABLED_STATE_DEFAULT -> {
        val componentInfo = try {
          packageManager.getActivityInfo(componentName, 0)
        } catch (_: Exception) {
          return false
        }
        componentInfo.enabled
      }

      PackageManager.COMPONENT_ENABLED_STATE_ENABLED -> true
      else -> false
    }
  }

  fun setLauncherEnabled(context: Context, enabled: Boolean) {
    val packageManager = context.packageManager
    val componentName = ComponentName(context, LauncherActivity::class.java)
    val newState = if (enabled) {
      PackageManager.COMPONENT_ENABLED_STATE_ENABLED
    } else {
      PackageManager.COMPONENT_ENABLED_STATE_DISABLED
    }

    try {
      packageManager.setComponentEnabledSetting(
        componentName,
        newState,
        PackageManager.DONT_KILL_APP
      )
    } catch (exception: IllegalArgumentException) {
      Log.w(TAG, "Launcher component is not available in manifest", exception)
    }
  }

  fun enableLauncher(context: Context): Boolean {
    setLauncherEnabled(context, true)

    val stockDisabled = disableStockLaunchers(context)
    val homeAssigned = assignHomeActivity(context)

    return stockDisabled && homeAssigned
  }

  fun disableLauncher(context: Context): Boolean {
    val stockEnabled = enableStockLaunchers(context)
    if (!stockEnabled) {
      return false
    }

    setLauncherEnabled(context, false)
    return true
  }

  fun getCurrentHomePackage(context: Context): String? {
    val homeIntent = Intent(Intent.ACTION_MAIN).apply {
      addCategory(Intent.CATEGORY_HOME)
    }

    val resolvedActivity = context.packageManager.resolveActivity(
      homeIntent,
      PackageManager.MATCH_DEFAULT_ONLY
    ) ?: return null

    return resolvedActivity.activityInfo?.packageName
      ?.takeUnless { it == "android" }
  }

  fun canLaunchPackage(context: Context, packageName: String?): Boolean {
    return resolveLaunchIntent(context, normalizeTargetPackage(context, packageName)) != null
  }

  fun launchTargetApp(context: Context): Boolean {
    return launchPackage(context, resolveSavedTargetPackage(context))
  }

  fun launchPackage(context: Context, packageName: String?): Boolean {
    val launchIntent = resolveLaunchIntent(context, normalizeTargetPackage(context, packageName)) ?: return false

    return try {
      context.startActivity(launchIntent)
      true
    } catch (exception: Exception) {
      Log.w(TAG, "Unable to launch package: $packageName", exception)
      false
    }
  }

  fun openHomeSettings(context: Context): Boolean {
    val homeSettingsIntent = Intent(Settings.ACTION_HOME_SETTINGS).apply {
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }
    val fallbackIntent = Intent(Settings.ACTION_SETTINGS).apply {
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }

    val intentToLaunch = when {
      canHandleIntent(context, homeSettingsIntent) -> homeSettingsIntent
      canHandleIntent(context, fallbackIntent) -> fallbackIntent
      else -> null
    } ?: return false

    return try {
      context.startActivity(intentToLaunch)
      true
    } catch (exception: Exception) {
      Log.w(TAG, "Unable to open home settings", exception)
      false
    }
  }

  fun getStatus(context: Context): Map<String, Any?> {
    val targetPackage = getTargetPackage(context)
    val effectiveTargetPackage = targetPackage ?: context.packageName

    return mapOf(
      "targetPackage" to targetPackage,
      "launcherEnabled" to isLauncherEnabled(context),
      "currentHomePackage" to getCurrentHomePackage(context),
      "targetLaunchable" to canLaunchPackage(context, effectiveTargetPackage)
    )
  }

  private fun assignHomeActivity(context: Context): Boolean {
    return executeAdbCommands(
      context,
      listOf("cmd package set-home-activity ${context.packageName}")
    )
  }

  private fun disableStockLaunchers(context: Context): Boolean {
    val commands = installedStockLauncherPackages(context).map {
      "pm disable-user --user 0 $it"
    }

    if (commands.isEmpty()) {
      return true
    }

    return executeAdbCommands(context, commands)
  }

  private fun enableStockLaunchers(context: Context): Boolean {
    val commands = installedStockLauncherPackages(context).map {
      "pm enable $it"
    }

    if (commands.isEmpty()) {
      return true
    }

    return executeAdbCommands(context, commands)
  }

  private fun installedStockLauncherPackages(context: Context): List<String> {
    val packageManager = context.packageManager

    return KNOWN_STOCK_LAUNCHER_PACKAGES.filter { packageName ->
      try {
        val info = packageManager.getApplicationInfo(packageName, PackageManager.MATCH_DISABLED_COMPONENTS)
        (info.flags and ApplicationInfo.FLAG_SYSTEM != 0) ||
          (info.flags and ApplicationInfo.FLAG_UPDATED_SYSTEM_APP != 0)
      } catch (_: Exception) {
        false
      }
    }
  }

  private fun executeAdbCommands(context: Context, commands: List<String>): Boolean {
    return try {
      val output = AdbShellClient.executeScript(context, commands)
      if (containsAdbFailure(output)) {
        Log.w(TAG, "ADB command execution reported failure: $output")
        false
      } else {
        true
      }
    } catch (exception: Exception) {
      Log.w(TAG, "ADB command execution failed", exception)
      false
    }
  }

  private fun containsAdbFailure(output: String): Boolean {
    val lowered = output.lowercase()
    return lowered.contains("exception occurred")
      || lowered.contains("security exception")
      || lowered.contains("permission denial")
      || lowered.contains("unknown package")
      || lowered.contains("can't find")
      || lowered.contains("error:")
  }

  private fun canHandleIntent(context: Context, intent: Intent): Boolean {
    return intent.resolveActivity(context.packageManager) != null
  }

  private fun resolveSavedTargetPackage(context: Context): String {
    return getTargetPackage(context) ?: context.packageName
  }

  private fun getConfiguredTargetPackage(context: Context): String? {
    return try {
      val applicationInfo = context.packageManager.getApplicationInfo(
        context.packageName,
        PackageManager.GET_META_DATA
      )
      applicationInfo.metaData?.getString(TARGET_PACKAGE_META_DATA_KEY)
        ?.trim()
        ?.takeIf { it.isNotEmpty() }
    } catch (_: Exception) {
      null
    }
  }

  private fun normalizeTargetPackage(context: Context, packageName: String?): String? {
    val normalizedPackage = packageName
      ?.trim()
      ?.takeIf { it.isNotEmpty() }
    val configuredTargetPackage = getConfiguredTargetPackage(context)

    if (
      configuredTargetPackage != null &&
      normalizedPackage != null &&
      normalizedPackage != configuredTargetPackage
    ) {
      throw IllegalArgumentException(
        "Only the package configured by the expo plugin can be used: $configuredTargetPackage"
      )
    }

    return normalizedPackage
  }

  private fun resolveLaunchIntent(context: Context, packageName: String?): Intent? {
    val normalizedPackage = packageName
      ?.trim()
      ?.takeIf { it.isNotEmpty() }
      ?: return null

    val packageManager = context.packageManager
    val launchIntent = packageManager.getLeanbackLaunchIntentForPackage(normalizedPackage)
      ?: packageManager.getLaunchIntentForPackage(normalizedPackage)
      ?: return null

    return launchIntent.apply {
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED)
    }
  }
}
