# Fanática del Calzado 👠

Tienda de calzado online con panel de administración.
Stack: React 18 + Vite + TailwindCSS + Supabase.

## Setup rápido

### 1. Clonar el repositorio

```bash
git clone <url-del-repo>
cd fanatica-del-calzado
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Crear el proyecto en Supabase

1. Ingresá a [supabase.com](https://supabase.com) y creá un nuevo proyecto
2. Anotá la **URL del proyecto** y la **anon key** (Settings → API)

### 4. Ejecutar el schema SQL

1. En el dashboard de Supabase, andá a **SQL Editor**
2. Copiá el contenido de `supabase/schema.sql` y ejecutalo
3. Esto crea las 4 tablas + políticas RLS + 8 productos de ejemplo

### 5. Configurar variables de entorno

Copiá el archivo de ejemplo y completá tus credenciales:

```bash
cp .env.local.example .env.local
```

Editá `.env.local`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
VITE_WHATSAPP_NUMBER=5493764123456   # código país + código área + número (sin 0 ni 15)
VITE_ADMIN_PASSWORD=tu-password-seguro
```

### 6. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abrí [http://localhost:5173](http://localhost:5173)

---

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Tienda pública |
| `/admin` | Panel de administración (requiere contraseña) |

## Panel Admin

**Contraseña por defecto:** `fanática2024` (cambiarla en `.env.local`)

### Secciones:
- **Productos** — CRUD completo con stock por talle
- **Stock** — Gestión de inventario con auto-guardado
- **Pedidos** — Seguimiento y cambio de estado
- **Clientes** — Base de clientes con notas

## Build para producción

```bash
npm run build
```

Los archivos estáticos quedan en `/dist` y pueden deployarse en Vercel, Netlify, etc.

> **Importante:** Nunca subas el archivo `.env.local` al repositorio. Está incluido en `.gitignore`.
