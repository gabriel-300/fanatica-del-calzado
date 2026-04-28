-- ============================================================
-- FANÁTICA DEL CALZADO — Schema Supabase
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- Tabla categorías (gestión dinámica desde el admin)
create table if not exists categorias (
  id uuid primary key default gen_random_uuid(),
  nombre text unique not null,
  created_at timestamptz default now()
);

-- Tabla productos (sin CHECK en categoria — se valida contra la tabla categorias)
create table if not exists productos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  categoria text,
  precio numeric not null,
  imagen_url text,
  etiqueta text check (etiqueta in ('Nuevo','Últimas unidades') or etiqueta is null),
  activo boolean default true,
  created_at timestamptz default now()
);

-- Tabla stock (un registro por producto + talle)
create table if not exists stock (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid references productos(id) on delete cascade,
  talle text not null,
  cantidad integer default 0,
  unique(producto_id, talle)
);

-- Tabla pedidos
create table if not exists pedidos (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid references productos(id),
  producto_nombre text,
  talle text,
  cliente_nombre text,
  cliente_telefono text,
  estado text default 'pendiente'
    check (estado in ('pendiente','confirmado','entregado','cancelado')),
  created_at timestamptz default now()
);

-- Tabla clientes
create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  nombre text,
  telefono text unique,
  instagram text,
  notas text,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- La app usa contraseña propia (no Supabase Auth), por eso
-- todas las operaciones llegan con rol 'anon'. Se permiten
-- todas las operaciones — la seguridad la da el login de la app.
-- ============================================================

alter table productos enable row level security;
alter table stock enable row level security;
alter table pedidos enable row level security;
alter table clientes enable row level security;

-- Categorías: lectura y escritura libre
alter table categorias enable row level security;
create policy "categorias_all" on categorias for all using (true) with check (true);

-- Permitir todo en productos y stock (anon = admin de la app)
create policy "productos_all" on productos for all using (true) with check (true);
create policy "stock_all" on stock for all using (true) with check (true);

-- Pedidos: inserción pública (clientes) + gestión total (admin)
create policy "pedidos_all" on pedidos for all using (true) with check (true);

-- Clientes: inserción pública + gestión total
create policy "clientes_all" on clientes for all using (true) with check (true);

-- ============================================================
-- STORAGE — Bucket para imágenes de productos
-- ============================================================

-- Crear bucket público para imágenes
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'productos',
  'productos',
  true,
  5242880,  -- 5 MB máximo por imagen
  array['image/jpeg','image/jpg','image/png','image/webp']
)
on conflict (id) do nothing;

-- Política: cualquiera puede leer (imágenes públicas en la tienda)
create policy "storage_public_read" on storage.objects
  for select using (bucket_id = 'productos');

-- Política: cualquiera puede subir (el acceso lo controla la app)
create policy "storage_public_insert" on storage.objects
  for insert with check (bucket_id = 'productos');

-- Política: cualquiera puede reemplazar/eliminar
create policy "storage_public_update" on storage.objects
  for update using (bucket_id = 'productos');

create policy "storage_public_delete" on storage.objects
  for delete using (bucket_id = 'productos');

-- Categorías por defecto
insert into categorias (nombre) values
  ('Zapatillas'), ('Sandalias'), ('Botas'), ('Accesorios')
on conflict (nombre) do nothing;

-- ============================================================
-- DATOS DE EJEMPLO — 8 productos con stock variado
-- ============================================================

do $$
declare
  p1 uuid; p2 uuid; p3 uuid; p4 uuid;
  p5 uuid; p6 uuid; p7 uuid; p8 uuid;
begin

  -- Producto 1
  insert into productos (nombre, descripcion, categoria, precio, imagen_url, etiqueta, activo)
  values ('Zapatilla Air Comfort', 'Zapatilla urbana ultraliviana con suela antideslizante. Perfecta para el día a día.', 'Zapatillas', 35000, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', 'Nuevo', true)
  returning id into p1;
  insert into stock (producto_id, talle, cantidad) values
    (p1,'35',0),(p1,'36',3),(p1,'37',5),(p1,'38',2),(p1,'39',4),(p1,'40',1),(p1,'41',0);

  -- Producto 2
  insert into productos (nombre, descripcion, categoria, precio, imagen_url, etiqueta, activo)
  values ('Sandalia Toscana', 'Sandalia de cuero vegano con tiras cruzadas. Estilo mediterráneo para el verano.', 'Sandalias', 22000, 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600', null, true)
  returning id into p2;
  insert into stock (producto_id, talle, cantidad) values
    (p2,'35',2),(p2,'36',1),(p2,'37',0),(p2,'38',3),(p2,'39',2),(p2,'40',0),(p2,'41',1);

  -- Producto 3
  insert into productos (nombre, descripcion, categoria, precio, imagen_url, etiqueta, activo)
  values ('Bota Patagonia', 'Bota de caña alta con cierre lateral. Ideal para temporadas frías con estilo.', 'Botas', 58000, 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600', 'Últimas unidades', true)
  returning id into p3;
  insert into stock (producto_id, talle, cantidad) values
    (p3,'35',0),(p3,'36',1),(p3,'37',1),(p3,'38',0),(p3,'39',0),(p3,'40',1),(p3,'41',0);

  -- Producto 4
  insert into productos (nombre, descripcion, categoria, precio, imagen_url, etiqueta, activo)
  values ('Zapatilla Retro 90s', 'Diseño chunky inspirado en los 90s. Suela gruesa y colores vibrantes.', 'Zapatillas', 42000, 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600', 'Nuevo', true)
  returning id into p4;
  insert into stock (producto_id, talle, cantidad) values
    (p4,'35',4),(p4,'36',5),(p4,'37',3),(p4,'38',6),(p4,'39',4),(p4,'40',2),(p4,'41',1);

  -- Producto 5
  insert into productos (nombre, descripcion, categoria, precio, imagen_url, etiqueta, activo)
  values ('Sandalia Ibiza', 'Sandalia plana con detalles dorados. Liviana y cómoda para todo el día.', 'Sandalias', 18500, 'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=600', null, true)
  returning id into p5;
  insert into stock (producto_id, talle, cantidad) values
    (p5,'35',3),(p5,'36',4),(p5,'37',5),(p5,'38',3),(p5,'39',2),(p5,'40',1),(p5,'41',2);

  -- Producto 6
  insert into productos (nombre, descripcion, categoria, precio, imagen_url, etiqueta, activo)
  values ('Cartera Mini Croco', 'Mini cartera texturada en estampado croco. El accesorio que transforma cualquier look.', 'Accesorios', 15000, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600', 'Nuevo', true)
  returning id into p6;
  insert into stock (producto_id, talle, cantidad) values
    (p6,'Único',8);

  -- Producto 7
  insert into productos (nombre, descripcion, categoria, precio, imagen_url, etiqueta, activo)
  values ('Bota Texana', 'Bota estilo western con bordados florales. Moda que nunca pasa de moda.', 'Botas', 67000, 'https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=600', null, true)
  returning id into p7;
  insert into stock (producto_id, talle, cantidad) values
    (p7,'35',1),(p7,'36',2),(p7,'37',3),(p7,'38',1),(p7,'39',2),(p7,'40',0),(p7,'41',0);

  -- Producto 8
  insert into productos (nombre, descripcion, categoria, precio, imagen_url, etiqueta, activo)
  values ('Zapatilla Lona Clásica', 'Lona de algodón con suela vulcanizada. El básico que nunca falla.', 'Zapatillas', 28000, 'https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=600', 'Últimas unidades', true)
  returning id into p8;
  insert into stock (producto_id, talle, cantidad) values
    (p8,'35',0),(p8,'36',1),(p8,'37',0),(p8,'38',2),(p8,'39',0),(p8,'40',1),(p8,'41',0);

end $$;

-- ============================================================
-- MIGRACIÓN — Solo si ya corriste el schema anterior
-- Ejecutar por separado si las tablas ya existen
-- ============================================================
-- alter table productos drop constraint if exists productos_categoria_check;
--
-- create table if not exists categorias (
--   id uuid primary key default gen_random_uuid(),
--   nombre text unique not null,
--   created_at timestamptz default now()
-- );
-- alter table categorias enable row level security;
-- create policy "categorias_all" on categorias for all using (true) with check (true);
-- insert into categorias (nombre) values ('Zapatillas'),('Sandalias'),('Botas'),('Accesorios')
-- on conflict (nombre) do nothing;
