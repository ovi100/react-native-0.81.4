package com.operations

object ESCUtil {
  const val ESC: Byte = 0x1B // Escape
  const val FS: Byte = 0x1C // Text separator
  const val GS: Byte = 0x1D // Group separator
  const val DLE: Byte = 0x10 // Data connection escape
  const val EOT: Byte = 0x04 // End of transmission
  const val ENQ: Byte = 0x05 // Inquiry character
  const val SP: Byte = 0x20 // Space
  const val HT: Byte = 0x09 // Horizontal list
  const val LF: Byte = 0x0A // Print and line feed (horizontal positioning)
  const val CR: Byte = 0x0D // Home key
  const val FF: Byte = 0x0C // Paper feed control (print and return to standard mode (in page mode))
  const val CAN: Byte = 0x18 // Cancel (cancel print data in page mode)

  /**
    * Bold font
    */
  fun boldOn(): ByteArray = byteArrayOf(ESC, 69, 0xF)

  /**
    * Cancel bold font
    */
  fun boldOff(): ByteArray = byteArrayOf(ESC, 69, 0)
}