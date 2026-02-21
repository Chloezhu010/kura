/**
 * Returns true for HEIC/HEIF files regardless of whether the browser
 * reports the MIME type correctly (some report '' or 'application/octet-stream').
 */
function isHeic(file: File): boolean {
  return (
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    /\.heic$/i.test(file.name) ||
    /\.heif$/i.test(file.name)
  )
}

/**
 * Resize and compress an image File to a JPEG data URL.
 * Supports HEIC/HEIF via heic2any conversion before canvas rendering.
 * Keeps the longest edge ≤ maxPx and applies JPEG quality.
 * Typical phone photo (4 MB) → ~120 KB after compression.
 */
export async function compressImage(
  file: File,
  maxPx = 1200,
  quality = 0.82
): Promise<string> {
  // Convert HEIC/HEIF → JPEG blob first (browsers can't decode HEIC on canvas).
  // Dynamic import keeps heic2any out of the SSR bundle — it uses `window` at
  // module load time and will crash Node.js if imported statically.
  let source: File | Blob = file
  if (isHeic(file)) {
    const heic2any = (await import('heic2any')).default
    const result = await heic2any({ blob: file, toType: 'image/jpeg' })
    source = Array.isArray(result) ? result[0] : result
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(source)

    img.onload = () => {
      URL.revokeObjectURL(url)

      const { naturalWidth: w, naturalHeight: h } = img
      const scale = Math.min(1, maxPx / Math.max(w, h))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(w * scale)
      canvas.height = Math.round(h * scale)

      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas context unavailable'))

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}
