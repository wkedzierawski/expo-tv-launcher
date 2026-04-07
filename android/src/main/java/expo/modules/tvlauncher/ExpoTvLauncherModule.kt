package expo.modules.tvlauncher

import android.content.Context
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoTvLauncherModule : Module() {
  private val context: Context
    get() = requireNotNull(appContext.reactContext) {
      "React context is not available"
    }

  override fun definition() = ModuleDefinition {
    Name("ExpoTvLauncher")

    Function("setTargetPackage") { packageName: String? ->
      LauncherController.setTargetPackage(context, packageName)
    }

    Function("getTargetPackage") {
      return@Function LauncherController.getTargetPackage(context)
    }

    Function("isLauncherEnabled") {
      return@Function LauncherController.isLauncherEnabled(context)
    }

    AsyncFunction("enableLauncher") {
      return@AsyncFunction LauncherController.enableLauncher(context)
    }

    AsyncFunction("disableLauncher") {
      return@AsyncFunction LauncherController.disableLauncher(context)
    }

    Function("getCurrentHomePackage") {
      return@Function LauncherController.getCurrentHomePackage(context)
    }

    Function("launchTargetApp") {
      return@Function LauncherController.launchTargetApp(context)
    }

    Function("openTargetApp") { packageName: String ->
      return@Function LauncherController.launchPackage(context, packageName)
    }

    Function("openHomeSettings") {
      return@Function LauncherController.openHomeSettings(context)
    }

    Function("getStatus") {
      return@Function LauncherController.getStatus(context)
    }
  }
}
