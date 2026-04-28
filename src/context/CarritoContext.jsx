import { createContext, useContext, useReducer, useEffect } from 'react'

const STORAGE_KEY = 'fanatica_carrito'

const CarritoContext = createContext(null)

function reducer(state, action) {
  switch (action.type) {
    case 'AGREGAR': {
      const { producto, talle, cantidad } = action
      const idx = state.items.findIndex(
        i => i.producto.id === producto.id && i.talle === talle
      )
      if (idx >= 0) {
        const items = [...state.items]
        items[idx] = { ...items[idx], cantidad: items[idx].cantidad + cantidad }
        return { ...state, items }
      }
      return { ...state, items: [...state.items, { producto, talle, cantidad }] }
    }
    case 'QUITAR':
      return {
        ...state,
        items: state.items.filter(
          i => !(i.producto.id === action.productoId && i.talle === action.talle)
        ),
      }
    case 'ACTUALIZAR':
      return {
        ...state,
        items: state.items.map(i =>
          i.producto.id === action.productoId && i.talle === action.talle
            ? { ...i, cantidad: Math.max(1, action.cantidad) }
            : i
        ),
      }
    case 'VACIAR':
      return { ...state, items: [] }
    case 'ABRIR':
      return { ...state, abierto: true }
    case 'CERRAR':
      return { ...state, abierto: false }
    default:
      return state
  }
}

function cargarStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function CarritoProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, {
    items: cargarStorage(),
    abierto: false,
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items))
  }, [state.items])

  const total = state.items.reduce((s, i) => s + i.producto.precio * i.cantidad, 0)
  const cantidadTotal = state.items.reduce((s, i) => s + i.cantidad, 0)

  return (
    <CarritoContext.Provider value={{
      items: state.items,
      abierto: state.abierto,
      total,
      cantidadTotal,
      agregar:   (producto, talle, cantidad = 1) => dispatch({ type: 'AGREGAR', producto, talle, cantidad }),
      quitar:    (productoId, talle)             => dispatch({ type: 'QUITAR',  productoId, talle }),
      actualizar:(productoId, talle, cantidad)   => dispatch({ type: 'ACTUALIZAR', productoId, talle, cantidad }),
      vaciar:    ()                              => dispatch({ type: 'VACIAR' }),
      abrir:     ()                              => dispatch({ type: 'ABRIR' }),
      cerrar:    ()                              => dispatch({ type: 'CERRAR' }),
    }}>
      {children}
    </CarritoContext.Provider>
  )
}

export const useCarrito = () => useContext(CarritoContext)
