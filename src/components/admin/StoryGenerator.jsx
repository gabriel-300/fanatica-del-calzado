import { useEffect, useRef, useState } from 'react'

const W = 1080
const H = 1920

function formatPrecio(p) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(p)
}

async function cargarImagen(src) {
  // Cargar via fetch → blob local → sin restricción CORS en canvas
  try {
    const res  = await fetch(src)
    const blob = await res.blob()
    const url  = URL.createObjectURL(blob)
    return await new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
      img.onerror = reject
      img.src = url
    })
  } catch {
    return await new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
  }
}

function dibujarStory(canvas, producto, imagen) {
  const ctx = canvas.getContext('2d')
  canvas.width  = W
  canvas.height = H

  // ── Fondo ──────────────────────────────────────────────────────────
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H)
  bgGrad.addColorStop(0,   '#FDF8F3')
  bgGrad.addColorStop(0.5, '#FAEEE0')
  bgGrad.addColorStop(1,   '#F5E6D3')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, W, H)

  // ── Círculo decorativo fondo (top) ─────────────────────────────────
  ctx.beginPath()
  ctx.arc(W / 2, -120, 680, 0, Math.PI * 2)
  ctx.fillStyle = '#F5821F18'
  ctx.fill()

  // ── Banda superior naranja ─────────────────────────────────────────
  const topGrad = ctx.createLinearGradient(0, 0, W, 200)
  topGrad.addColorStop(0, '#F5821F')
  topGrad.addColorStop(1, '#C4610A')
  ctx.fillStyle = topGrad
  ctx.fillRect(0, 0, W, 220)

  // ── Logo / nombre marca ────────────────────────────────────────────
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 52px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.letterSpacing = '2px'
  ctx.fillText('Fanática del Calzado', W / 2, 110)

  ctx.font = '32px Georgia, serif'
  ctx.fillStyle = '#FFE4C4'
  ctx.fillText('@fanaticadelcalzado_', W / 2, 165)

  // ── Imagen del producto ────────────────────────────────────────────
  if (imagen) {
    const imgSize  = 820
    const imgX     = (W - imgSize) / 2
    const imgY     = 270

    // Sombra
    ctx.shadowColor   = 'rgba(0,0,0,0.15)'
    ctx.shadowBlur    = 40
    ctx.shadowOffsetY = 20

    // Fondo blanco redondeado para la imagen
    ctx.fillStyle = '#FFFFFF'
    roundRect(ctx, imgX - 20, imgY - 20, imgSize + 40, imgSize + 40, 40)
    ctx.fill()

    ctx.shadowColor = 'transparent'
    ctx.shadowBlur  = 0

    // Clip y dibujar imagen
    ctx.save()
    roundRect(ctx, imgX, imgY, imgSize, imgSize, 30)
    ctx.clip()

    // Contain: imagen completa sin cortar
    const escala = Math.min(imgSize / imagen.naturalWidth, imgSize / imagen.naturalHeight)
    const dw = imagen.naturalWidth  * escala
    const dh = imagen.naturalHeight * escala
    ctx.drawImage(imagen, imgX + (imgSize - dw) / 2, imgY + (imgSize - dh) / 2, dw, dh)
    ctx.restore()
  }

  // ── Zona de info (parte baja) ──────────────────────────────────────
  const infoY = 1160

  // Separador decorativo
  ctx.fillStyle = '#F5821F'
  ctx.fillRect(W / 2 - 60, infoY - 10, 120, 5)

  // Etiqueta si existe
  if (producto.etiqueta) {
    ctx.fillStyle = '#F5821F'
    ctx.font = 'bold 34px Arial, sans-serif'
    ctx.textAlign = 'center'
    const tag = `✦ ${producto.etiqueta.toUpperCase()} ✦`
    ctx.fillText(tag, W / 2, infoY + 60)
  }

  // Nombre del producto
  ctx.fillStyle = '#1C1208'
  ctx.font = 'bold 68px Georgia, serif'
  ctx.textAlign = 'center'
  const nombreY = producto.etiqueta ? infoY + 160 : infoY + 110
  wrapText(ctx, producto.nombre, W / 2, nombreY, W - 120, 80)

  // Precio
  const precioY = nombreY + (producto.nombre.length > 25 ? 180 : 110)
  ctx.font = 'bold 90px Georgia, serif'
  ctx.fillStyle = '#F5821F'
  ctx.textAlign = 'center'
  ctx.fillText(formatPrecio(producto.precio), W / 2, precioY)

  // Talles
  if (producto.talles?.length > 0) {
    const tallesY = precioY + 100
    ctx.font = '32px Arial, sans-serif'
    ctx.fillStyle = '#6B5B4E'
    ctx.textAlign = 'center'
    ctx.fillText('TALLES DISPONIBLES', W / 2, tallesY)

    const talles = producto.talles.join('  ·  ')
    ctx.font = 'bold 44px Arial, sans-serif'
    ctx.fillStyle = '#1C1208'
    ctx.fillText(talles, W / 2, tallesY + 65)
  }

  // ── Banda inferior ─────────────────────────────────────────────────
  const bandaY = H - 260
  const botGrad = ctx.createLinearGradient(0, bandaY, W, H)
  botGrad.addColorStop(0, '#C4610A')
  botGrad.addColorStop(1, '#F5821F')
  ctx.fillStyle = botGrad
  ctx.fillRect(0, bandaY, W, H - bandaY)

  // WhatsApp CTA
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 50px Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Consultá por WhatsApp 👇', W / 2, bandaY + 110)

  ctx.font = '36px Arial, sans-serif'
  ctx.fillStyle = '#FFE4C4'
  ctx.fillText('375 446-0575', W / 2, bandaY + 185)
}

// Helpers Canvas
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ')
  let line = ''
  let currentY = y
  for (let i = 0; i < words.length; i++) {
    const test = line + words[i] + ' '
    if (ctx.measureText(test).width > maxWidth && i > 0) {
      ctx.fillText(line.trim(), x, currentY)
      line = words[i] + ' '
      currentY += lineHeight
    } else {
      line = test
    }
  }
  ctx.fillText(line.trim(), x, currentY)
}

export default function StoryGenerator({ producto, onCerrar }) {
  const canvasRef = useRef(null)
  const [generando, setGenerando] = useState(true)
  const [error, setError]         = useState(null)

  const imagenUrl = producto.imagen_url ||
    (Array.isArray(producto.imagenes) ? producto.imagenes[0] : null)

  useEffect(() => {
    async function generar() {
      setGenerando(true)
      setError(null)
      try {
        let img = null
        if (imagenUrl) {
          try { img = await cargarImagen(imagenUrl) } catch { /* sin imagen */ }
        }
        dibujarStory(canvasRef.current, producto, img)
      } catch (e) {
        setError('Error generando la story: ' + e.message)
      } finally {
        setGenerando(false)
      }
    }
    generar()
  }, [producto])

  const descargar = () => {
    const link = document.createElement('a')
    link.download = `story-${producto.nombre.replace(/\s+/g, '-').toLowerCase()}.png`
    link.href = canvasRef.current.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/70 backdrop-blur-sm" onClick={onCerrar} />

      <div className="relative bg-white rounded-2xl shadow-xl flex flex-col items-center gap-4 p-6 max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between w-full">
          <div>
            <h2 className="font-playfair text-xl font-bold text-stone-900">Story para Instagram</h2>
            <p className="font-inter text-xs text-stone-400 mt-0.5">{producto.nombre}</p>
          </div>
          <button onClick={onCerrar} className="text-stone-400 hover:text-stone-700 transition-colors ml-4">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Preview del canvas escalado */}
        <div className="relative">
          {generando && (
            <div className="absolute inset-0 flex items-center justify-center bg-cream rounded-xl z-10">
              <svg className="animate-spin w-8 h-8 text-orange" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity=".25"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          )}
          <canvas
            ref={canvasRef}
            style={{ width: '270px', height: '480px', borderRadius: '12px', border: '1px solid #E8D5C0', display: 'block' }}
          />
        </div>

        {error && (
          <p className="font-inter text-xs text-red-500 text-center">{error}</p>
        )}

        <p className="font-inter text-xs text-stone-400 text-center -mt-1">
          Preview. La imagen descargada es 1080×1920px.
        </p>

        <button
          onClick={descargar}
          disabled={generando}
          className="btn-orange w-full flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Descargar Story (1080×1920)
        </button>
      </div>
    </div>
  )
}
