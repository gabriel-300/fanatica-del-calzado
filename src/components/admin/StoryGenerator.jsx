import { useEffect, useRef, useState } from 'react'

const W = 1080
const H = 1920

function formatPrecio(p) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(p)
}

async function cargarImagen(src) {
  try {
    const res = await fetch(src, { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const blob    = await res.blob()
    const blobUrl = URL.createObjectURL(blob)
    return await new Promise((resolve, reject) => {
      const img = new Image()
      img.onload  = () => resolve(img)
      img.onerror = () => { URL.revokeObjectURL(blobUrl); reject() }
      img.src = blobUrl
    })
  } catch {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload  = () => resolve(img)
      img.onerror = () => reject(new Error('imagen no disponible'))
      img.src = src + (src.includes('?') ? '&' : '?') + '_nc=' + Date.now()
    })
  }
}

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
  let cy = y
  for (let i = 0; i < words.length; i++) {
    const test = line + words[i] + ' '
    if (ctx.measureText(test).width > maxWidth && i > 0) {
      ctx.fillText(line.trim(), x, cy)
      line = words[i] + ' '
      cy += lineHeight
    } else {
      line = test
    }
  }
  ctx.fillText(line.trim(), x, cy)
  return cy
}

function dibujarStory(canvas, producto, imagen) {
  const ctx = canvas.getContext('2d')
  canvas.width  = W
  canvas.height = H

  // ── Fondo ──────────────────────────────────────────────────────────
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H)
  bgGrad.addColorStop(0,    '#FDF9F5')
  bgGrad.addColorStop(0.45, '#FAF0E6')
  bgGrad.addColorStop(1,    '#F2DFCC')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, W, H)

  // Círculos decorativos sutiles
  ctx.beginPath()
  ctx.arc(W + 80, 460, 540, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(245,130,31,0.06)'
  ctx.fill()

  ctx.beginPath()
  ctx.arc(-80, H - 340, 480, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(245,130,31,0.06)'
  ctx.fill()

  // ── Banda superior ─────────────────────────────────────────────────
  const topGrad = ctx.createLinearGradient(0, 0, W, 225)
  topGrad.addColorStop(0,   '#E8720F')
  topGrad.addColorStop(0.5, '#F5821F')
  topGrad.addColorStop(1,   '#C85E0A')
  ctx.fillStyle = topGrad
  ctx.fillRect(0, 0, W, 225)

  // Líneas decorativas flanqueando el título
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.fillRect(52, 98, 130, 2)
  ctx.fillRect(W - 182, 98, 130, 2)

  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 56px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.fillText('Fanática del Calzado', W / 2, 114)

  ctx.font = '31px Georgia, serif'
  ctx.fillStyle = '#FFE8D0'
  ctx.fillText('@fanaticadelcalzado_', W / 2, 170)

  // Línea inferior banda
  ctx.fillStyle = 'rgba(255,255,255,0.12)'
  ctx.fillRect(0, 220, W, 5)

  // ── Imagen del producto ─────────────────────────────────────────────
  const imgSize = 770
  const imgX    = (W - imgSize) / 2
  const imgY    = 250

  // Sombra suave del contenedor
  ctx.shadowColor   = 'rgba(92,58,30,0.16)'
  ctx.shadowBlur    = 55
  ctx.shadowOffsetY = 22
  ctx.fillStyle = '#FFFFFF'
  roundRect(ctx, imgX - 24, imgY - 16, imgSize + 48, imgSize + 38, 50)
  ctx.fill()
  ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0

  // Contenedor imagen con fondo cálido
  ctx.save()
  roundRect(ctx, imgX, imgY, imgSize, imgSize, 34)
  ctx.clip()
  const imgBg = ctx.createLinearGradient(imgX, imgY, imgX + imgSize, imgY + imgSize)
  imgBg.addColorStop(0, '#FEFCFA')
  imgBg.addColorStop(1, '#F8EFEA')
  ctx.fillStyle = imgBg
  ctx.fillRect(imgX, imgY, imgSize, imgSize)
  if (imagen) {
    const escala = Math.min(imgSize / imagen.naturalWidth, imgSize / imagen.naturalHeight)
    const dw = imagen.naturalWidth  * escala
    const dh = imagen.naturalHeight * escala
    ctx.drawImage(imagen, imgX + (imgSize - dw) / 2, imgY + (imgSize - dh) / 2, dw, dh)
  }
  ctx.restore()

  // ── Zona de info ───────────────────────────────────────────────────
  const BADGE_Y  = 1482
  let cy = imgY + imgSize + 42   // ~1062

  // Separador
  const sepW = 100
  ctx.fillStyle = '#F5821F'
  ctx.fillRect(W / 2 - sepW / 2, cy, sepW, 5)
  cy += 50

  // Categoría
  if (producto.categoria) {
    ctx.font = '27px Arial, sans-serif'
    ctx.fillStyle = '#A07050'
    ctx.textAlign = 'center'
    ctx.letterSpacing = '3px'
    ctx.fillText(producto.categoria.toUpperCase(), W / 2, cy)
    ctx.letterSpacing = '0px'
    cy += 50
  }

  // Etiqueta (Nuevo / Últimas unidades)
  if (producto.etiqueta) {
    ctx.font = 'bold 30px Arial, sans-serif'
    ctx.fillStyle = '#F5821F'
    ctx.textAlign = 'center'
    ctx.fillText(`✦  ${producto.etiqueta.toUpperCase()}  ✦`, W / 2, cy)
    cy += 52
  }

  // Nombre del producto
  ctx.fillStyle = '#1C1208'
  ctx.font = 'bold 68px Georgia, serif'
  ctx.textAlign = 'center'
  cy = wrapText(ctx, producto.nombre, W / 2, cy, W - 110, 78)
  cy += 42

  // Precio con tarjeta
  ctx.font = 'bold 90px Georgia, serif'
  ctx.fillStyle = '#F5821F'
  ctx.textAlign = 'center'
  ctx.fillText(formatPrecio(producto.precio), W / 2, cy)
  cy += 34

  ctx.font = '26px Arial, sans-serif'
  ctx.fillStyle = '#C09878'
  ctx.fillText('con tarjeta', W / 2, cy)
  cy += 52

  // Línea divisora suave
  ctx.strokeStyle = 'rgba(245,130,31,0.2)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(W / 2 - 200, cy); ctx.lineTo(W / 2 + 200, cy)
  ctx.stroke()
  cy += 40

  // Precio efectivo / transferencia
  const precioEfectivo = Math.round(producto.precio * 0.85)
  ctx.font = 'bold 66px Georgia, serif'
  ctx.fillStyle = '#1B7A3E'
  ctx.textAlign = 'center'
  ctx.fillText(formatPrecio(precioEfectivo), W / 2, cy)
  cy += 34

  ctx.font = '26px Arial, sans-serif'
  ctx.fillStyle = '#2A9E55'
  ctx.fillText('efectivo  /  transferencia  (−15%)', W / 2, cy)
  cy += 48

  // Talles disponibles (desde stock real)
  const tallesDisponibles = (producto.talles?.length > 0)
    ? producto.talles
    : (producto.stock || [])
        .filter(s => s.cantidad > 0)
        .sort((a, b) => a.talle.localeCompare(b.talle, undefined, { numeric: true }))
        .map(s => s.talle)

  if (tallesDisponibles.length > 0 && cy + 90 < BADGE_Y - 20) {
    ctx.font = '25px Arial, sans-serif'
    ctx.fillStyle = '#9B8070'
    ctx.textAlign = 'center'
    ctx.fillText('TALLES DISPONIBLES', W / 2, cy)
    cy += 45
    ctx.font = 'bold 38px Arial, sans-serif'
    ctx.fillStyle = '#3C2010'
    ctx.fillText(tallesDisponibles.slice(0, 9).join('  ·  '), W / 2, cy)
  }

  // ── Badge descuento ────────────────────────────────────────────────
  const badgeH = 122
  const badgeW = 870
  const badgeX = (W - badgeW) / 2

  ctx.shadowColor   = 'rgba(27,140,78,0.28)'
  ctx.shadowBlur    = 22
  ctx.shadowOffsetY = 8
  ctx.fillStyle = '#1B8C4E'
  roundRect(ctx, badgeX, BADGE_Y, badgeW, badgeH, badgeH / 2)
  ctx.fill()
  ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0

  ctx.strokeStyle = 'rgba(255,255,255,0.22)'
  ctx.lineWidth = 2
  roundRect(ctx, badgeX + 7, BADGE_Y + 7, badgeW - 14, badgeH - 14, (badgeH - 14) / 2)
  ctx.stroke()

  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 42px Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('15% DESCUENTO', W / 2, BADGE_Y + 55)
  ctx.font = '28px Arial, sans-serif'
  ctx.fillStyle = '#C8F7DC'
  ctx.fillText('EFECTIVO  /  TRANSFERENCIA', W / 2, BADGE_Y + 97)

  // ── Banda inferior ─────────────────────────────────────────────────
  const bandaY = 1642
  const botGrad = ctx.createLinearGradient(0, bandaY, 0, H)
  botGrad.addColorStop(0, '#C4610A')
  botGrad.addColorStop(1, '#F5821F')
  ctx.fillStyle = botGrad
  ctx.fillRect(0, bandaY, W, H - bandaY)

  // Patrón decorativo translúcido
  ctx.fillStyle = 'rgba(255,255,255,0.05)'
  for (let i = 0; i < 9; i++) {
    ctx.beginPath()
    ctx.arc(120 * i, bandaY + 140, 90, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 52px Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Consultá por WhatsApp 👇', W / 2, bandaY + 120)

  ctx.font = '38px Arial, sans-serif'
  ctx.fillStyle = '#FFE8D0'
  ctx.fillText('375 446-0575', W / 2, bandaY + 192)

  ctx.font = '24px Arial, sans-serif'
  ctx.fillStyle = 'rgba(255,235,210,0.55)'
  ctx.fillText('fanaticadelcalzado.com.ar', W / 2, bandaY + 244)
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
    try {
      const link = document.createElement('a')
      link.download = `story-${producto.nombre.replace(/\s+/g, '-').toLowerCase()}.png`
      link.href = canvasRef.current.toDataURL('image/png')
      link.click()
    } catch {
      alert('No se pudo descargar. Probá clic derecho → Guardar imagen en el canvas.')
    }
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
            style={{ width: '315px', height: '560px', borderRadius: '12px', border: '1px solid #E8D5C0', display: 'block' }}
          />
        </div>

        {error && <p className="font-inter text-xs text-red-500 text-center">{error}</p>}

        <p className="font-inter text-xs text-stone-400 text-center -mt-1">
          Preview · La imagen descargada es 1080×1920px
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
