package com.operations

import android.content.Context
import android.graphics.*
import android.view.View

class OverlayView(context: Context) : View(context) {
    private val darkPaint = Paint().apply {
        color = Color.parseColor("#88000000")
    }

    private val clearPaint = Paint().apply {
        color = Color.TRANSPARENT
        xfermode = PorterDuffXfermode(PorterDuff.Mode.CLEAR)
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        val width = canvas.width.toFloat()
        val height = canvas.height.toFloat()

        canvas.drawRect(0f, 0f, width, height, darkPaint)

        val rectWidth = width * 0.8f
        val rectHeight = height * 0.25f
        val left = (width - rectWidth) / 2
        val top = (height - rectHeight) / 2
        val right = left + rectWidth
        val bottom = top + rectHeight

        canvas.drawRect(left, top, right, bottom, clearPaint)
    }
}
