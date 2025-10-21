package com.operations

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

// For React Native Navigation
import android.os.Bundle;

// For camera scan(Google MLKit)
import com.operations.BarcodeScannerModule
import android.view.ViewGroup

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "operations"

  /** Handle device back button press when the camera scanner is opened **/
  override fun onBackPressed() {
    if (BarcodeScannerModule.isCameraOpen) {
      BarcodeScannerModule.containerLayoutRef?.let {
        val rootView = findViewById<ViewGroup>(android.R.id.content)
        rootView.removeView(it)
      }
      BarcodeScannerModule.isCameraOpen = false
      BarcodeScannerModule.containerLayoutRef = null
    } else {
      super.onBackPressed()
    }
  }

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  /** Handle React Native Navigation screens **/
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
  }
}
