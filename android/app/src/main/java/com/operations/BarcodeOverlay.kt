package com.operations

import android.content.Context
import android.graphics.*
import android.view.View

class BarcodeOverlay(context: Context) : View(context) {

    private val paint = Paint().apply {
        color = Color.GREEN
        style = Paint.Style.STROKE
        strokeWidth = 8f
    }

    private var boundingBox: Rect? = null
    private var imageWidth: Int = 0
    private var imageHeight: Int = 0

    fun updateBoundingBox(box: Rect?, imgWidth: Int, imgHeight: Int) {
        boundingBox = box
        imageWidth = imgWidth
        imageHeight = imgHeight
        invalidate()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        val box = boundingBox ?: return
        if (imageWidth == 0 || imageHeight == 0) return

        // Calculate scale factors between image and view
        val scaleX = width.toFloat() / imageWidth
        val scaleY = height.toFloat() / imageHeight

        // Apply scale to bounding box
        val scaledBox = RectF(
            box.left * scaleX,
            box.top * scaleY,
            box.right * scaleX,
            box.bottom * scaleY
        )

        canvas.drawRect(scaledBox, paint)
    }
}
