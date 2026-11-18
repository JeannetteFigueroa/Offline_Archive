-- =============================================================================
--  OFFLINE ARCHIVE · Datos Semilla y Maestros · PostgreSQL 14+
--  V2__seed_master_data.sql
--  Derivado de productos.js, tienda.js, auth.js y Checkout.jsx
-- =============================================================================

-- 1. Estados de Pedido
INSERT INTO estado_pedido (codigo, nombre, orden, es_final) VALUES
  ('PENDIENTE',  'Pendiente',  1, false),
  ('PAGADA',     'Pagada',     2, false),
  ('CONFIRMADO', 'Confirmado', 3, false),
  ('PREPARADO',  'Preparado',  4, false),
  ('CANCELADO',  'Cancelado',  5, true)
ON CONFLICT (codigo) DO NOTHING;

-- 2. Tipos de Entrega
INSERT INTO tipo_entrega (codigo, nombre, costo) VALUES
  ('DOMICILIO', 'Despacho a domicilio', 3990),
  ('RETIRO',    'Retiro en tienda',        0)
ON CONFLICT (codigo) DO NOTHING;

-- 3. Métodos de Pago
INSERT INTO metodo_pago (codigo, nombre) VALUES
  ('DEBITO',        'Tarjeta de débito'),
  ('CREDITO',       'Tarjeta de crédito'),
  ('TRANSFERENCIA', 'Transferencia bancaria')
ON CONFLICT (codigo) DO NOTHING;

-- 4. Categorías del Sistema
INSERT INTO categoria (slug, nombre, es_sistema) VALUES
  ('tops',       'Tops',       true),
  ('bottoms',    'Bottoms',    true),
  ('accesorios', 'Accesorios', true),
  ('outerwear',  'Outerwear',  true)
ON CONFLICT (slug) DO NOTHING;

-- 5. Regiones de Chile
INSERT INTO region (nombre) VALUES
  ('Arica y Parinacota'),
  ('Tarapacá'),
  ('Antofagasta'),
  ('Atacama'),
  ('Coquimbo'),
  ('Valparaíso'),
  ('Metropolitana de Santiago'),
  ('O''Higgins'),
  ('Maule'),
  ('Ñuble'),
  ('Biobío'),
  ('La Araucanía'),
  ('Los Ríos'),
  ('Los Lagos'),
  ('Aysén'),
  ('Magallanes y de la Antártica Chilena')
ON CONFLICT (nombre) DO NOTHING;

-- 6. Comunas por Región
INSERT INTO comuna (region_id, nombre)
SELECT r.id, v.comuna
FROM (VALUES
  ('Arica y Parinacota', 'Arica'),
  ('Arica y Parinacota', 'Putre'),
  ('Arica y Parinacota', 'Camarones'),
  ('Tarapacá', 'Iquique'),
  ('Tarapacá', 'Alto Hospicio'),
  ('Tarapacá', 'Pozo Almonte'),
  ('Antofagasta', 'Antofagasta'),
  ('Antofagasta', 'Calama'),
  ('Antofagasta', 'Tocopilla'),
  ('Atacama', 'Copiapó'),
  ('Atacama', 'Caldera'),
  ('Atacama', 'Vallenar'),
  ('Coquimbo', 'La Serena'),
  ('Coquimbo', 'Coquimbo'),
  ('Coquimbo', 'Ovalle'),
  ('Valparaíso', 'Valparaíso'),
  ('Valparaíso', 'Viña del Mar'),
  ('Valparaíso', 'Quilpué'),
  ('Metropolitana de Santiago', 'Santiago'),
  ('Metropolitana de Santiago', 'Maipú'),
  ('Metropolitana de Santiago', 'Puente Alto'),
  ('O''Higgins', 'Rancagua'),
  ('O''Higgins', 'Machalí'),
  ('O''Higgins', 'San Fernando'),
  ('Maule', 'Talca'),
  ('Maule', 'Curicó'),
  ('Maule', 'Linares'),
  ('Ñuble', 'Chillán'),
  ('Ñuble', 'San Carlos'),
  ('Ñuble', 'Bulnes'),
  ('Biobío', 'Concepción'),
  ('Biobío', 'Talcahuano'),
  ('Biobío', 'Los Ángeles'),
  ('La Araucanía', 'Temuco'),
  ('La Araucanía', 'Angol'),
  ('La Araucanía', 'Villarrica'),
  ('Los Ríos', 'Valdivia'),
  ('Los Ríos', 'La Unión'),
  ('Los Ríos', 'Panguipulli'),
  ('Los Lagos', 'Puerto Montt'),
  ('Los Lagos', 'Osorno'),
  ('Los Lagos', 'Castro'),
  ('Aysén', 'Coyhaique'),
  ('Aysén', 'Aysén'),
  ('Aysén', 'Chile Chico'),
  ('Magallanes y de la Antártica Chilena', 'Punta Arenas'),
  ('Magallanes y de la Antártica Chilena', 'Puerto Natales'),
  ('Magallanes y de la Antártica Chilena', 'Porvenir')
) AS v(region, comuna)
JOIN region r ON r.nombre = v.region
ON CONFLICT DO NOTHING;

-- 7. Catálogo Inicial de Productos
-- Nota: stock inicial en 0; el stock entra mediante movimiento_stock para trazabilidad y disparo del trigger
INSERT INTO producto (codigo, categoria_id, nombre, descripcion, precio, imagen_url)
SELECT v.codigo, c.id, v.nombre, v.descripcion, v.precio, v.imagen
FROM (VALUES
  ('ITEM_001', 'tops', 'Baby Tee Static', 'Baby tee negra de algodón lavado con estampado abstracto.', 19990, '/img/camisetaBabyTeeNegraStatic.png'),
  ('ITEM_002', 'tops', 'Mesh Top Signal', 'Top de malla negra con paneles y costuras verdes.', 22990, '/img/TopDeMallaNegraConDetallesVerdes.png'),
  ('ITEM_003', 'bottoms', 'Cargo Rupture', 'Pantalón cargo negro de pierna ancha con correas metálicas.', 34990, '/img/pantalonCargoNegroDePiernaAncha.png'),
  ('ITEM_004', 'bottoms', 'Falda Circuit', 'Mini falda negra plisada con capas y cadena plateada.', 26990, '/img/miniFaldaNegraPlisadaConCadena.png'),
  ('ITEM_005', 'accesorios', 'Cinturón Chrome-03', 'Cinturón negro con hebilla cromada, tachas y ojales.', 14990, '/img/cinturonNegroConHebillaCromada.png'),
  ('ITEM_006', 'accesorios', 'Collar System', 'Choker negro de cuero con aros y piezas metálicas.', 12990, '/img/chokerNegroConAroPlateado.png'),
  ('ITEM_007', 'outerwear', 'Chaqueta Archive 2003', 'Chaqueta negra desgastada con cierre y correas laterales.', 49990, '/img/chaquetaNegraArchive2003.png'),
  ('ITEM_008', 'outerwear', 'Hoodie Noise', 'Hoodie oversize color carbón con acabado industrial.', 39990, '/img/sudaderaCarbonDeEsteticaIndustrial.png')
) AS v(codigo, categoria, nombre, descripcion, precio, imagen)
JOIN categoria c ON c.slug = v.categoria
ON CONFLICT (codigo) DO NOTHING;

-- 8. Ingreso Inicial de Inventario
-- Dispara automáticamente el trigger fn_aplicar_movimiento_stock(), actualizando el stock de cada producto
INSERT INTO movimiento_stock (producto_id, tipo, cantidad, nota)
SELECT p.id, 'INGRESO', v.unidades, 'Stock inicial'
FROM (VALUES
  ('ITEM_001', 8),
  ('ITEM_002', 6),
  ('ITEM_003', 10),
  ('ITEM_004', 7),
  ('ITEM_005', 12),
  ('ITEM_006', 9),
  ('ITEM_007', 5),
  ('ITEM_008', 6)
) AS v(codigo, unidades)
JOIN producto p ON p.codigo = v.codigo
WHERE NOT EXISTS (
    SELECT 1 FROM movimiento_stock m WHERE m.producto_id = p.id AND m.tipo = 'INGRESO' AND m.nota = 'Stock inicial'
);

-- 9. Usuario Administrador Inicial
-- Email: admin@gmail.com
-- Contraseña plana: Admin123
-- Hash BCrypt: $2a$10$7R3UuFqRsh7sDkglK9R1g.qC7f5aZqJ7k.gHw8wL6u/ZJz3fMpm1W
INSERT INTO usuario (nombre, apellidos, correo, telefono, password_hash, rol, activo)
SELECT
  'Admin',
  'Offline',
  'admin@gmail.com',
  '912345678',
  '$2a$10$7R3UuFqRsh7sDkglK9R1g.qC7f5aZqJ7k.gHw8wL6u/ZJz3fMpm1W',
  'ADMIN',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM usuario WHERE lower(correo) = 'admin@gmail.com'
);
