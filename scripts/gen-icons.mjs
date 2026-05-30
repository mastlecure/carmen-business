import { createCanvas } from 'canvas'
import { writeFileSync, mkdirSync } from 'fs'

// Si canvas no está disponible, usamos un SVG convertido a PNG básico
// Intentamos con canvas primero, si falla creamos SVGs renombrados

const sizes = [192, 512]

function drawIcon(size) {
  try {
    const canvas = createCanvas(size, size)
    const ctx = canvas.getContext('2d')
    // Fondo rosa carmín
    ctx.fillStyle = '#db2777'
    ctx.beginPath()
    ctx.roundRect(0, 0, size, size, size * 0.2)
    ctx.fill()
    // Emoji 🌸 centrado
    ctx.font = `${size * 0.5}px serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('🌸', size / 2, size / 2)
    return canvas.toBuffer('image/png')
  } catch {
    return null
  }
}

mkdirSync('public/icons', { recursive: true })

for (const size of sizes) {
  const buf = drawIcon(size)
  if (buf) {
    writeFileSync(`public/icons/icon-${size}.png`, buf)
    console.log(`✓ icon-${size}.png generado`)
  } else {
    console.log(`✗ canvas no disponible para icon-${size}.png`)
  }
}
