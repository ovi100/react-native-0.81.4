package com.operations

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Context
import android.graphics.*
import android.graphics.drawable.GradientDrawable
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleOwner
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.common.InputImage
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

class BarcodeScannerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        var isCameraOpen = false
        var containerLayoutRef: FrameLayout? = null
    }

    private var previewView: PreviewView? = null
    private var barcodeOverlay: BarcodeOverlay? = null
    private var cameraExecutor: ExecutorService = Executors.newSingleThreadExecutor()
    private var listenerCount = 0

    override fun getName(): String = "BarcodeScanner"

    @ReactMethod
    fun addListener(eventName: String) {
        listenerCount += 1
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        listenerCount -= count
        if (listenerCount < 0) listenerCount = 0
    }

    @ReactMethod
    fun startCameraScan() {
        val activity = reactContext.currentActivity ?: return
        isCameraOpen = true

        Handler(Looper.getMainLooper()).post {
            previewView = PreviewView(activity).apply {
                setBackgroundColor(Color.BLACK)
                layoutParams = FrameLayout.LayoutParams(
                    FrameLayout.LayoutParams.MATCH_PARENT,
                    FrameLayout.LayoutParams.MATCH_PARENT
                )
            }

            barcodeOverlay = BarcodeOverlay(activity)

            val containerLayout = FrameLayout(activity).apply {
                layoutParams = FrameLayout.LayoutParams(
                    FrameLayout.LayoutParams.MATCH_PARENT,
                    FrameLayout.LayoutParams.MATCH_PARENT
                )
                setBackgroundColor(Color.BLACK)
                addView(previewView)
                // NOTE: use our field name, not the ViewGroup.overlay
                addView(barcodeOverlay)
            }

            // Buttons layout
            val buttonLayout = LinearLayout(activity).apply {
                orientation = LinearLayout.HORIZONTAL
                gravity = Gravity.TOP or Gravity.END
                val buttonParams = FrameLayout.LayoutParams(
                    FrameLayout.LayoutParams.MATCH_PARENT,
                    FrameLayout.LayoutParams.WRAP_CONTENT
                )
                buttonParams.gravity = Gravity.TOP or Gravity.END
                buttonParams.setMargins(0, 20, 10, 0)
                layoutParams = buttonParams
            }

            val stopBtn = createCircleButton(activity, "✕", "#66000000").apply {
                setOnClickListener { stopCameraScan() }
            }

            buttonLayout.addView(stopBtn)
            containerLayout.addView(buttonLayout)

            val rootView = activity.findViewById<ViewGroup>(android.R.id.content)
            rootView.addView(containerLayout)

            containerLayoutRef = containerLayout

            val lifecycleOwner = (activity as? LifecycleOwner) ?: return@post
            startCamera(lifecycleOwner, previewView!!, barcodeOverlay!!)
        }
    }

    private fun createCircleButton(context: Context, text: String, bg: String): Button {
        val button = Button(context)
        button.text = text
        button.setTextColor(Color.WHITE)
        button.textSize = 20f
        button.gravity = Gravity.CENTER

        val size = 100
        val params = LinearLayout.LayoutParams(size, size)
        params.setMargins(20, 10, 20, 10)
        button.layoutParams = params

        val drawable = GradientDrawable().apply {
            shape = GradientDrawable.OVAL
            setColor(Color.parseColor(bg))
        }

        button.background = drawable
        return button
    }

    @SuppressLint("UnsafeOptInUsageError")
    private fun startCamera(
        lifecycleOwner: LifecycleOwner,
        previewView: PreviewView,
        overlayView: BarcodeOverlay
    ) {
        val context = previewView.context
        val cameraProviderFuture = ProcessCameraProvider.getInstance(context)

        cameraProviderFuture.addListener({
            val cameraProvider = cameraProviderFuture.get()

            val preview = Preview.Builder().build().also {
                it.setSurfaceProvider(previewView.surfaceProvider)
            }

            val imageAnalyzer = ImageAnalysis.Builder()
                .build()
                .also {
                    it.setAnalyzer(
                        cameraExecutor,
                        BarcodeAnalyzer { result: String, box: Rect?, imgWidth: Int, imgHeight: Int ->
                            sendEvent("onBarcodeScanned", result)

                            Handler(Looper.getMainLooper()).post {
                                overlayView.updateBoundingBox(box, imgWidth, imgHeight)
                            }

                            stopCameraScan()
                        }
                    )
                }

            val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA

            try {
                cameraProvider.unbindAll()
                cameraProvider.bindToLifecycle(
                    lifecycleOwner,
                    cameraSelector,
                    preview,
                    imageAnalyzer
                )
            } catch (e: Exception) {
                Log.e("BarcodeScanner", "Camera binding failed", e)
            }
        }, ContextCompat.getMainExecutor(context))
    }

    private fun sendEvent(eventName: String, barcode: String) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, barcode)
    }

    @ReactMethod
    fun stopCameraScan() {
        isCameraOpen = false
        val activity = reactContext.currentActivity ?: return
        Handler(Looper.getMainLooper()).post {
            val rootView = activity.findViewById<ViewGroup>(android.R.id.content)
            containerLayoutRef?.let {
                rootView.removeView(it)
            }
            containerLayoutRef = null
        }
    }

    private class BarcodeAnalyzer(
        private val onScanned: (String, Rect?, Int, Int) -> Unit
    ) : ImageAnalysis.Analyzer {
        @SuppressLint("UnsafeOptInUsageError")
        override fun analyze(imageProxy: ImageProxy) {
            val mediaImage = imageProxy.image ?: run {
                imageProxy.close()
                return
            }

            val rotationDegrees = imageProxy.imageInfo.rotationDegrees
            val image = InputImage.fromMediaImage(mediaImage, rotationDegrees)
            val imgWidth = image.width
            val imgHeight = image.height

            val scanner = BarcodeScanning.getClient()

            scanner.process(image)
                .addOnSuccessListener { barcodes ->
                    for (barcode in barcodes) {
                        val rawValue = barcode.rawValue
                        val boundingBox = barcode.boundingBox
                        if (!rawValue.isNullOrEmpty()) {
                            onScanned(rawValue, boundingBox, imgWidth, imgHeight)
                            break
                        }
                    }
                }
                .addOnFailureListener { e ->
                    Log.e("BarcodeScanner", "Scan failed", e)
                }
                .addOnCompleteListener {
                    imageProxy.close()
                }
        }
    }
}
