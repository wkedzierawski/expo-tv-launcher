package expo.modules.tvlauncher

import android.content.Context
import android.util.Base64
import com.tananaev.adblib.AdbBase64
import com.tananaev.adblib.AdbConnection
import com.tananaev.adblib.AdbCrypto
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.IOException
import java.net.InetSocketAddress
import java.net.Socket
import java.security.spec.InvalidKeySpecException
import java.util.concurrent.TimeUnit

internal object AdbShellClient {
  private const val HOST = "127.0.0.1"
  private const val PORT = 5555
  private const val CONNECT_TIMEOUT_MS = 5_000
  private const val KEY_DIRECTORY = "expo-tv-launcher-adb"
  private const val PRIVATE_KEY_FILE = "adbkey"
  private const val PUBLIC_KEY_FILE = "adbkey.pub"

  private val adbBase64 = AdbBase64 { payload ->
    Base64.encodeToString(payload, Base64.NO_WRAP)
  }

  fun executeScript(context: Context, commands: List<String>): String {
    require(commands.isNotEmpty()) {
      "ADB command list must not be empty"
    }

    val crypto = loadOrCreateCrypto(context)
    val script = buildString {
      commands.forEach { command ->
        append(command)
        append('\n')
      }
      append("exit\n")
    }

    Socket().use { socket ->
      socket.connect(InetSocketAddress(HOST, PORT), CONNECT_TIMEOUT_MS)

      AdbConnection.create(socket, crypto).use { connection ->
        val connected = connection.connect(CONNECT_TIMEOUT_MS.toLong(), TimeUnit.MILLISECONDS, false)
        if (!connected) {
          throw IOException("Unable to connect to local ADB daemon at $HOST:$PORT")
        }

        connection.open("shell:").use { stream ->
          stream.write(script.toByteArray())

          val output = ByteArrayOutputStream()
          while (true) {
            try {
              output.write(stream.read())
            } catch (_: IOException) {
              break
            }
          }
          return output.toString(Charsets.UTF_8.name())
        }
      }
    }
  }

  private fun loadOrCreateCrypto(context: Context): AdbCrypto {
    val keyDirectory = File(context.filesDir, KEY_DIRECTORY).apply {
      mkdirs()
    }
    val privateKey = File(keyDirectory, PRIVATE_KEY_FILE)
    val publicKey = File(keyDirectory, PUBLIC_KEY_FILE)

    return try {
      if (privateKey.exists() && publicKey.exists()) {
        AdbCrypto.loadAdbKeyPair(adbBase64, privateKey, publicKey)
      } else {
        generateAndStoreCrypto(privateKey, publicKey)
      }
    } catch (_: InvalidKeySpecException) {
      generateAndStoreCrypto(privateKey, publicKey)
    }
  }

  private fun generateAndStoreCrypto(privateKey: File, publicKey: File): AdbCrypto {
    val crypto = AdbCrypto.generateAdbKeyPair(adbBase64)
    crypto.saveAdbKeyPair(privateKey, publicKey)
    return crypto
  }
}
