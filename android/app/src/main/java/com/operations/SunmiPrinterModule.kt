package com.operations

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.RemoteException
import android.util.Base64
import android.util.Log
import com.facebook.react.bridge.*
import com.sunmi.peripheral.printer.*
import com.facebook.react.module.annotations.ReactModule
import com.operations.ESCUtil

@ReactModule(name = SunmiPrinterModule.NAME)
class SunmiPrinterModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  private var printerService: SunmiPrinterService? = null
  private var p: Promise? = null

  companion object {
    const val NAME = "SunmiPrinter"
    private const val TAG = "SunmiPrinter_Error"
  }

  private val innerResultCallback = object : InnerResultCallback() {
    override fun onRunResult(isSuccess: Boolean) {
      if (isSuccess) {
        p?.resolve(200)
      } else {
        p?.reject("0", "Printing failed")
      }
    }

    override fun onReturnString(result: String) {}
    override fun onRaiseException(code: Int, msg: String) {}
    override fun onPrintResult(code: Int, msg: String) {}
  }

  private val innerPrinterCallback = object : InnerPrinterCallback() {
    override fun onConnected(service: SunmiPrinterService) {
      printerService = service
    }

    override fun onDisconnected() {
      // Handle service disconnection
    }
  }

  init {
    try {
      InnerPrinterManager.getInstance().bindService(reactContext, innerPrinterCallback)
    } catch (e: RemoteException) {
      Log.i(TAG, "ERROR: ${e.message}")
    }
  }

  override fun getName(): String = NAME

  @ReactMethod
  @Throws(RemoteException::class)
  fun printerInit() {
    printerService?.printerInit(innerResultCallback)
  }

  @ReactMethod
  @Throws(RemoteException::class)
  fun printerSelfChecking() {
    printerService?.printerSelfChecking(innerResultCallback)
  }

  @ReactMethod
  fun getPrinterSerialNo(promise: Promise) {
    try {
      promise.resolve(printerService?.printerSerialNo)
    } catch (e: RemoteException) {
      Log.i(TAG, "ERROR: ${e.message}")
      promise.reject("0", e.message)
    }
  }

  @ReactMethod
  fun getPrinterVersion(promise: Promise) {
    try {
      promise.resolve(printerService?.printerVersion)
    } catch (e: RemoteException) {
      Log.i(TAG, "ERROR: ${e.message}")
      promise.reject("0", e.message)
    }
  }

  @ReactMethod
  fun getPrinterModal(promise: Promise) {
    try {
      promise.resolve(printerService?.printerModal)
    } catch (e: RemoteException) {
      Log.i(TAG, "ERROR: ${e.message}")
      promise.reject("0", e.message)
    }
  }

  @ReactMethod
  fun getPrinterPaper(promise: Promise) {
    try {
      promise.resolve(if (printerService?.printerPaper == 1) "58mm" else "80mm")
    } catch (e: RemoteException) {
      Log.i(TAG, "ERROR: ${e.message}")
      promise.reject("0", e.message)
    }
  }

  @ReactMethod
  fun updatePrinterState(promise: Promise) {
    try {
      promise.resolve(printerService?.updatePrinterState())
    } catch (e: RemoteException) {
      Log.i(TAG, "ERROR: ${e.message}")
      promise.reject("0", e.message)
    }
  }

  @ReactMethod
  fun getServiceVersion(promise: Promise) {
    try {
      promise.resolve(printerService?.serviceVersion)
    } catch (e: RemoteException) {
      Log.i(TAG, "ERROR: ${e.message}")
      promise.reject("0", e.message)
    }
  }

  @ReactMethod
  @Throws(RemoteException::class)
  fun getPrintedLength() {
    printerService?.getPrintedLength(innerResultCallback)
  }

  @ReactMethod
  fun hasPrinter(promise: Promise) {
    promise.resolve(printerService != null)
  }

  @ReactMethod
  @Throws(RemoteException::class)
  fun sendRAWData(base64Data: String) {
    val d = Base64.decode(base64Data, Base64.DEFAULT)
    printerService?.sendRAWData(d, innerResultCallback)
  }

  @ReactMethod
  @Throws(RemoteException::class)
  fun setFontName(typeface: String) {
    printerService?.setFontName(typeface, innerResultCallback)
  }

  @ReactMethod
  @Throws(RemoteException::class)
  fun setPrinterStyle(key: Int, value: Int) {
    printerService?.setPrinterStyle(key, value)
  }

  @ReactMethod
  @Throws(RemoteException::class)
  fun setAlignment(alignment: Int) {
    printerService?.setAlignment(alignment, innerResultCallback)
  }

  @ReactMethod
  @Throws(RemoteException::class)
  fun setFontSize(fontSize: Float) {
    printerService?.setFontSize(fontSize, innerResultCallback)
  }

  @ReactMethod
  @Throws(RemoteException::class)
  fun setFontWeight(isWeight: Boolean) {
    if (isWeight) {
      printerService?.sendRAWData(ESCUtil.boldOn(), null)
    } else {
      printerService?.sendRAWData(ESCUtil.boldOff(), null)
    }
  }

  @ReactMethod
  @Throws(RemoteException::class)
  fun printerText(text: String) {
    printerService?.printText(text, null)
  }

  @ReactMethod
  @Throws(RemoteException::class)
  fun printTextWithFont(text: String, typeface: String, fontsize: Float) {
    printerService?.printTextWithFont(text, typeface, fontsize, null)
  }

  @ReactMethod
  @Throws(RemoteException::class)
  fun printOriginalText(text: String) {
    printerService?.printOriginalText(text, null)
  }

  @ReactMethod
  @Throws(RemoteException::class)
  fun printColumnsText(colrsTextAir: ReadableArray, colsWidthArr: ReadableArray, colsAlign: ReadableArray) {
    val texts = Array(colrsTextAir.size()) { colrsTextAir.getString(it) ?: "" }
    val widths = IntArray(colsWidthArr.size()) { colsWidthArr.getInt(it) }
    val aligns = IntArray(colsAlign.size()) { colsAlign.getInt(it) }
    
    printerService?.printColumnsText(texts, widths, aligns, null)
  }

  @ReactMethod
  @Throws(RemoteException::class)
  fun printColumnsString(colsTextArr: ReadableArray, colsWidthArr: ReadableArray, colsAlign: ReadableArray) {
    val texts = Array(colsTextArr.size()) { colsTextArr.getString(it) ?: "" }
    val widths = IntArray(colsWidthArr.size()) { colsWidthArr.getInt(it) }
    val aligns = IntArray(colsAlign.size()) { colsAlign.getInt(it) }
    
    printerService?.printColumnsString(texts, widths, aligns, null)
  }

  @ReactMethod
  @Throws(RemoteException::class)
  fun printBitmap(encodedString: String, pixelWidth: Int) {
    val pureBase64Encoded = encodedString.substringAfter(",")
    val decodedBytes = Base64.decode(pureBase64Encoded, Base64.DEFAULT)
    val decodedBitmap = BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)
    val w = decodedBitmap.width
    val h = decodedBitmap.height
    val scaledImage = Bitmap.createScaledBitmap(decodedBitmap, pixelWidth, (pixelWidth / w) * h, false)
    printerService?.printBitmap(scaledImage, innerResultCallback)
  }

  @ReactMethod
  @Throws(RemoteException::class)
  fun printBitmapCustom(bitmap: Bitmap, type: Int) {
    printerService?.printBitmapCustom(bitmap, type, innerResultCallback)
  }

  @ReactMethod
  @Throws(RemoteException::class)
  fun printBitmapBase64Custom(encodedString: String, pixelWidth: Int, type: Int) {
    val pureBase64Encoded = encodedString.substringAfter(",")
    val decodedBytes = Base64.decode(pureBase64Encoded, Base64.DEFAULT)
    val decodedBitmap = BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)
    val w = decodedBitmap.width
    val h = decodedBitmap.height
    val scaledImage = Bitmap.createScaledBitmap(decodedBitmap, pixelWidth, (pixelWidth / w) * h, false)
    printerService?.printBitmapCustom(scaledImage, type, innerResultCallback)
  }

  @ReactMethod
  @Throws(RemoteException::class)
  fun printBarCode(data: String, symbology: Int, height: Int, width: Int, textPosition: Int) {
    printerService?.printBarCode(data, symbology, height, width, textPosition, innerResultCallback)
  }

  @ReactMethod
  @Throws(RemoteException::class)
  fun printQRCode(data: String, modulesize: Int, errorlevel: Int) {
    printerService?.printQRCode(data, modulesize, errorlevel, innerResultCallback)
  }

  @ReactMethod
  @Throws(RemoteException::class)
  fun print2DCode(data: String, symbology: Int, modulesize: Int, errorlevel: Int) {
    printerService?.print2DCode(data, symbology, modulesize, errorlevel, innerResultCallback)
  }

  @ReactMethod
  @Throws(RemoteException::class)
  fun commitPrint(tranBean: Array<TransBean>) {
    printerService?.commitPrint(tranBean, innerResultCallback)
  }

  @ReactMethod
  @Throws(RemoteException::class)
  fun enterPrinterBuffer(clear: Boolean) {
    printerService?.enterPrinterBuffer(clear)
  }

  @ReactMethod
  @Throws(RemoteException::class)
  fun exitPrinterBuffer(commit: Boolean) {
    printerService?.exitPrinterBuffer(commit)
  }

  @ReactMethod
  @Throws(RemoteException::class)
  fun commitPrinterBuffer() {
    printerService?.commitPrinterBuffer()
  }

  @ReactMethod
  @Throws(RemoteException::class)
  fun commitPrinterBufferWithCallbacka() {
    printerService?.commitPrinterBufferWithCallback(innerResultCallback)
  }

  @ReactMethod
  @Throws(RemoteException::class)
  fun lineWrap(n: Int) {
    printerService?.lineWrap(n, innerResultCallback)
  }

  @ReactMethod
  @Throws(RemoteException::class)
  fun cutPaper() {
    printerService?.cutPaper(innerResultCallback)
  }

  @ReactMethod
  @Throws(RemoteException::class)
  fun openDrawer() {
    printerService?.openDrawer(innerResultCallback)
  }

  @ReactMethod
  fun getDrawerStatus(promise: Promise) {
    try {
      promise.resolve(printerService?.drawerStatus)
    } catch (e: RemoteException) {
      Log.i(TAG, "ERROR: ${e.message}")
      promise.reject("0", e.message)
    }
  }
}