package expo.modules.tvlauncher

import android.app.Activity
import android.os.Bundle
import android.util.Log

class LauncherActivity : Activity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    val targetPackage = LauncherController.getTargetPackage(this)
    val launched = LauncherController.launchTargetApp(this)

    if (!launched) {
      Log.i(
        "ExpoTvLauncher",
        "Launcher activity finished without launching a target app. targetPackage=$targetPackage"
      )
    }

    finish()
  }
}
