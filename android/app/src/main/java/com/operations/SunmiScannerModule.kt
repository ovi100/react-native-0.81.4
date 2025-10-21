package com.operations

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class SunmiScannerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private val reactContext: ReactApplicationContext = reactContext
    private var isBroadcastReceiverRegistered = false
    private var broadcastReceiver: BroadcastReceiver? = null

    override fun getName(): String = "SunmiScanner"

    @ReactMethod
    fun startScan() {
      if (!isBroadcastReceiverRegistered) {
        registerBroadcastReceiver()
      }
    }

    @ReactMethod
    fun stopScan() {
      if (isBroadcastReceiverRegistered) {
        unregisterBroadcastReceiver()
      }
    }

    private fun registerBroadcastReceiver() {
      if (broadcastReceiver == null) {
        broadcastReceiver = object : BroadcastReceiver() {
          override fun onReceive(context: Context, intent: Intent) {
            val data = intent.getStringExtra("data")
            sendEvent("ScanDataReceived", data)
          }
        }
      }

      IntentFilter().apply {
        addAction("com.sunmi.scanner.ACTION_DATA_CODE_RECEIVED")
        reactContext.registerReceiver(broadcastReceiver, this)
      }
      isBroadcastReceiverRegistered = true
    }

    private fun unregisterBroadcastReceiver() {
      if (broadcastReceiver != null && isBroadcastReceiverRegistered) {
        reactContext.unregisterReceiver(broadcastReceiver)
        isBroadcastReceiverRegistered = false
      }
    }

    private fun sendEvent(eventName: String, data: String?) {
      val params = Arguments.createMap().apply {
        putString("code", data)
      }
      reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(eventName, params)
    }
}