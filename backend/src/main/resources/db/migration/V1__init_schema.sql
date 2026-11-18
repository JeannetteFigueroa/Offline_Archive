-- =============================================================================
--  OFFLINE ARCHIVE · Modelo de datos relacional · PostgreSQL 14+
--  V1__init_schema.sql
--  Esquema oficial derivado del MER y frontend de (Off)line Archive
-- =============================================================================

-- =============================================================================
-- 1. UBICACIÓN
-- =============================================================================
CREATE TABLE region (
    id      smallint    GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre  varchar(60) NOT NULL UNIQUE
);

CREATE TABLE comuna (
    id         smallint    GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    region_id  smallint    NOT NULL REFERENCES region (id) ON DELETE RESTRICT,
    nombre     varchar(60) NOT NULL,
    CONSTRAINT uq_comuna_region_nombre UNIQUE (region_id, nombre)
);
CREATE INDEX ix_comuna_region ON comuna (region_id);


-- =============================================================================
-- 2. USUARIOS Y DIRECCIONES
-- =============================================================================
CREATE TABLE usuario (
    id                     bigint       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre                 varchar(50)  NOT NULL,
    apellidos              varchar(100) NOT NULL,
    correo                 varchar(100) NOT NULL,
    telefono               char(9)      NOT NULL,
    password_hash          varchar(255) NOT NULL,
    fecha_nacimiento       date,
    rol                    varchar(10)  NOT NULL DEFAULT 'CLIENTE',
    activo                 boolean      NOT NULL DEFAULT true,
    terminos_aceptados_at  timestamptz,
    created_at             timestamptz  NOT NULL DEFAULT now(),
    updated_at             timestamptz  NOT NULL DEFAULT now(),
    CONSTRAINT ck_usuario_rol      CHECK (rol IN ('CLIENTE', 'ADMIN')),
    CONSTRAINT ck_usuario_correo   CHECK (correo ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
    CONSTRAINT ck_usuario_telefono CHECK (telefono ~ '^9[0-9]{8}$')
);
CREATE UNIQUE INDEX ux_usuario_correo ON usuario (lower(correo));

CREATE TABLE direccion (
    id            bigint       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id    bigint       NOT NULL REFERENCES usuario (id) ON DELETE CASCADE,
    comuna_id     smallint     NOT NULL REFERENCES comuna (id)  ON DELETE RESTRICT,
    direccion     varchar(300) NOT NULL,
    es_principal  boolean      NOT NULL DEFAULT false,
    created_at    timestamptz  NOT NULL DEFAULT now()
);
CREATE INDEX ix_direccion_usuario ON direccion (usuario_id);
CREATE UNIQUE INDEX ux_direccion_principal ON direccion (usuario_id) WHERE es_principal;


-- =============================================================================
-- 3. CATÁLOGO
-- =============================================================================
CREATE TABLE categoria (
    id          smallint    GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    slug        varchar(60) NOT NULL UNIQUE,
    nombre      varchar(60) NOT NULL UNIQUE,
    es_sistema  boolean     NOT NULL DEFAULT false,
    created_at  timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ck_categoria_slug CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

CREATE TABLE producto (
    id             bigint       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo         varchar(30)  NOT NULL UNIQUE,
    categoria_id   smallint     NOT NULL REFERENCES categoria (id) ON DELETE RESTRICT,
    nombre         varchar(120) NOT NULL,
    descripcion    text,
    precio         integer      NOT NULL,
    precio_oferta  integer,
    stock          integer      NOT NULL DEFAULT 0,
    imagen_url     text,
    visible        boolean      NOT NULL DEFAULT true,
    created_at     timestamptz  NOT NULL DEFAULT now(),
    updated_at     timestamptz  NOT NULL DEFAULT now(),
    CONSTRAINT ck_producto_codigo CHECK (codigo = upper(codigo) AND codigo ~ '^[A-Z0-9_-]+$'),
    CONSTRAINT ck_producto_precio CHECK (precio > 0),
    CONSTRAINT ck_producto_stock  CHECK (stock >= 0),
    CONSTRAINT ck_producto_oferta CHECK (
        precio_oferta IS NULL
        OR (precio_oferta > 0
            AND precio_oferta < precio
            AND ROUND((1 - precio_oferta::numeric / precio) * 100) >= 5)
    )
);
CREATE INDEX ix_producto_categoria ON producto (categoria_id);
CREATE INDEX ix_producto_visible   ON producto (visible);


-- =============================================================================
-- 4. CATÁLOGOS DE VENTA
-- =============================================================================
CREATE TABLE tipo_entrega (
    id      smallint    GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo  varchar(20) NOT NULL UNIQUE,
    nombre  varchar(60) NOT NULL,
    costo   integer     NOT NULL DEFAULT 0 CHECK (costo >= 0),
    activo  boolean     NOT NULL DEFAULT true
);

CREATE TABLE metodo_pago (
    id      smallint    GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo  varchar(20) NOT NULL UNIQUE,
    nombre  varchar(60) NOT NULL,
    activo  boolean     NOT NULL DEFAULT true
);

CREATE TABLE estado_pedido (
    id        smallint    GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo    varchar(20) NOT NULL UNIQUE,
    nombre    varchar(60) NOT NULL,
    orden     smallint    NOT NULL,
    es_final  boolean     NOT NULL DEFAULT false
);


-- =============================================================================
-- 5. PEDIDOS
-- =============================================================================
CREATE SEQUENCE seq_numero_pedido START 1;

CREATE TABLE pedido (
    id                bigint       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    numero_pedido     varchar(20)  NOT NULL UNIQUE
                      DEFAULT ('OFF-' || lpad(nextval('seq_numero_pedido')::text, 6, '0')),
    usuario_id        bigint       REFERENCES usuario (id) ON DELETE SET NULL,
    estado_id         smallint     NOT NULL REFERENCES estado_pedido (id),
    tipo_entrega_id   smallint     NOT NULL REFERENCES tipo_entrega (id),
    comuna_id         smallint     NOT NULL REFERENCES comuna (id),
    cliente_nombre    varchar(100) NOT NULL,
    cliente_correo    varchar(100) NOT NULL,
    cliente_telefono  char(9)      NOT NULL,
    direccion_entrega varchar(300) NOT NULL,
    subtotal          integer      NOT NULL,
    costo_envio       integer      NOT NULL DEFAULT 0,
    total             integer      NOT NULL,
    fecha             timestamptz  NOT NULL DEFAULT now(),
    CONSTRAINT ck_pedido_montos   CHECK (subtotal >= 0 AND costo_envio >= 0 AND total = subtotal + costo_envio),
    CONSTRAINT ck_pedido_telefono CHECK (cliente_telefono ~ '^9[0-9]{8}$')
);
CREATE INDEX ix_pedido_usuario ON pedido (usuario_id);
CREATE INDEX ix_pedido_estado  ON pedido (estado_id);
CREATE INDEX ix_pedido_fecha   ON pedido (fecha);

CREATE TABLE detalle_pedido (
    pedido_id        bigint       NOT NULL REFERENCES pedido (id)   ON DELETE CASCADE,
    producto_id      bigint       NOT NULL REFERENCES producto (id) ON DELETE RESTRICT,
    codigo_producto  varchar(30)  NOT NULL,
    nombre_producto  varchar(120) NOT NULL,
    precio_normal    integer      NOT NULL CHECK (precio_normal > 0),
    precio_unitario  integer      NOT NULL CHECK (precio_unitario > 0),
    cantidad         integer      NOT NULL CHECK (cantidad > 0),
    subtotal         integer      GENERATED ALWAYS AS (precio_unitario * cantidad) STORED,
    PRIMARY KEY (pedido_id, producto_id),
    CONSTRAINT ck_detalle_precio CHECK (precio_unitario <= precio_normal)
);
CREATE INDEX ix_detalle_producto ON detalle_pedido (producto_id);

CREATE TABLE pago (
    id                  bigint       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    pedido_id           bigint       NOT NULL REFERENCES pedido (id) ON DELETE CASCADE,
    metodo_pago_id      smallint     NOT NULL REFERENCES metodo_pago (id),
    monto               integer      NOT NULL CHECK (monto > 0),
    estado              varchar(10)  NOT NULL DEFAULT 'PENDIENTE',
    referencia_externa  varchar(100),
    fecha               timestamptz  NOT NULL DEFAULT now(),
    CONSTRAINT ck_pago_estado CHECK (estado IN ('PENDIENTE', 'APROBADO', 'RECHAZADO'))
);
CREATE INDEX ix_pago_pedido ON pago (pedido_id);
CREATE UNIQUE INDEX ux_pago_aprobado ON pago (pedido_id) WHERE estado = 'APROBADO';

CREATE TABLE pedido_historial_estado (
    id          bigint      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    pedido_id   bigint      NOT NULL REFERENCES pedido (id) ON DELETE CASCADE,
    estado_id   smallint    NOT NULL REFERENCES estado_pedido (id),
    usuario_id  bigint      REFERENCES usuario (id) ON DELETE SET NULL,
    fecha       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_historial_pedido ON pedido_historial_estado (pedido_id, fecha);


-- =============================================================================
-- 6. INVENTARIO
-- =============================================================================
CREATE TABLE movimiento_stock (
    id           bigint       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    producto_id  bigint       NOT NULL REFERENCES producto (id) ON DELETE RESTRICT,
    pedido_id    bigint       REFERENCES pedido (id)  ON DELETE SET NULL,
    usuario_id   bigint       REFERENCES usuario (id) ON DELETE SET NULL,
    tipo         varchar(15)  NOT NULL,
    cantidad     integer      NOT NULL,
    nota         varchar(200),
    fecha        timestamptz  NOT NULL DEFAULT now(),
    CONSTRAINT ck_mov_tipo  CHECK (tipo IN ('INGRESO', 'VENTA', 'AJUSTE', 'CANCELACION')),
    CONSTRAINT ck_mov_signo CHECK (
           (tipo IN ('INGRESO', 'CANCELACION') AND cantidad > 0)
        OR (tipo = 'VENTA'  AND cantidad < 0)
        OR (tipo = 'AJUSTE' AND cantidad <> 0)
    )
);
CREATE INDEX ix_mov_producto ON movimiento_stock (producto_id, fecha);
CREATE INDEX ix_mov_pedido   ON movimiento_stock (pedido_id);


-- =============================================================================
-- 7. SOPORTE / CONTACTO
-- =============================================================================
CREATE TABLE mensaje_contacto (
    id          bigint       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id  bigint       REFERENCES usuario (id) ON DELETE SET NULL,
    nombre      varchar(100) NOT NULL,
    correo      varchar(100) NOT NULL,
    asunto      varchar(100) NOT NULL,
    mensaje     varchar(500) NOT NULL,
    leido       boolean      NOT NULL DEFAULT false,
    created_at  timestamptz  NOT NULL DEFAULT now()
);
CREATE INDEX ix_contacto_fecha ON mensaje_contacto (created_at);


-- =============================================================================
-- 8. REGLAS DE NEGOCIO (Triggers)
-- =============================================================================

-- 8.1 updated_at automático
CREATE OR REPLACE FUNCTION fn_set_updated_at() RETURNS trigger AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_usuario_updated  BEFORE UPDATE ON usuario  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
CREATE TRIGGER trg_producto_updated BEFORE UPDATE ON producto FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- 8.2 Actualización de stock ante movimientos
CREATE OR REPLACE FUNCTION fn_aplicar_movimiento_stock() RETURNS trigger AS $$
BEGIN
    UPDATE producto SET stock = stock + NEW.cantidad WHERE id = NEW.producto_id;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_movimiento_stock
    AFTER INSERT ON movimiento_stock
    FOR EACH ROW EXECUTE FUNCTION fn_aplicar_movimiento_stock();

-- 8.3 Descuento automático de stock al registrar detalle_pedido (VENTA)
CREATE OR REPLACE FUNCTION fn_detalle_registra_venta() RETURNS trigger AS $$
BEGIN
    INSERT INTO movimiento_stock (producto_id, tipo, cantidad, pedido_id, nota)
    VALUES (NEW.producto_id, 'VENTA', -NEW.cantidad, NEW.pedido_id, 'Venta');
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_detalle_venta
    AFTER INSERT ON detalle_pedido
    FOR EACH ROW EXECUTE FUNCTION fn_detalle_registra_venta();

-- 8.4 Validación de estado final
CREATE OR REPLACE FUNCTION fn_pedido_validar_estado() RETURNS trigger AS $$
DECLARE
    v_final boolean;
BEGIN
    SELECT es_final INTO v_final FROM estado_pedido WHERE id = OLD.estado_id;
    IF v_final AND NEW.estado_id <> OLD.estado_id THEN
        RAISE EXCEPTION 'El pedido % está en un estado final y no puede cambiar de estado', OLD.numero_pedido;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pedido_validar_estado
    BEFORE UPDATE OF estado_id ON pedido
    FOR EACH ROW WHEN (OLD.estado_id IS DISTINCT FROM NEW.estado_id)
    EXECUTE FUNCTION fn_pedido_validar_estado();

-- 8.5 Reposición de stock ante cancelación
CREATE OR REPLACE FUNCTION fn_pedido_cancelado_repone_stock() RETURNS trigger AS $$
DECLARE
    v_cancelado smallint;
BEGIN
    SELECT id INTO v_cancelado FROM estado_pedido WHERE codigo = 'CANCELADO';
    IF NEW.estado_id = v_cancelado THEN
        INSERT INTO movimiento_stock (producto_id, tipo, cantidad, pedido_id, nota)
        SELECT producto_id, 'CANCELACION', cantidad, pedido_id, 'Reposición por cancelación'
        FROM detalle_pedido
        WHERE pedido_id = NEW.id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pedido_cancelado
    AFTER UPDATE OF estado_id ON pedido
    FOR EACH ROW WHEN (OLD.estado_id IS DISTINCT FROM NEW.estado_id)
    EXECUTE FUNCTION fn_pedido_cancelado_repone_stock();

-- 8.6 Historial automático de estados
CREATE OR REPLACE FUNCTION fn_pedido_historial() RETURNS trigger AS $$
BEGIN
    INSERT INTO pedido_historial_estado (pedido_id, estado_id, usuario_id)
    VALUES (NEW.id, NEW.estado_id, NULLIF(current_setting('app.usuario_id', true), '')::bigint);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pedido_historial_ins
    AFTER INSERT ON pedido
    FOR EACH ROW EXECUTE FUNCTION fn_pedido_historial();

CREATE TRIGGER trg_pedido_historial_upd
    AFTER UPDATE OF estado_id ON pedido
    FOR EACH ROW WHEN (OLD.estado_id IS DISTINCT FROM NEW.estado_id)
    EXECUTE FUNCTION fn_pedido_historial();


-- =============================================================================
-- 9. VISTAS
-- =============================================================================

-- Catálogo con precio final y descuento
CREATE OR REPLACE VIEW v_producto_catalogo AS
SELECT p.id,
       p.codigo,
       p.nombre,
       p.descripcion,
       c.slug                                   AS categoria,
       c.nombre                                 AS categoria_nombre,
       p.precio,
       p.precio_oferta,
       COALESCE(p.precio_oferta, p.precio)      AS precio_final,
       (p.precio_oferta IS NOT NULL)            AS en_oferta,
       CASE WHEN p.precio_oferta IS NULL THEN 0
            ELSE ROUND((1 - p.precio_oferta::numeric / p.precio) * 100)::int
       END                                      AS descuento_pct,
       p.stock,
       p.imagen_url,
       p.visible
FROM producto p
JOIN categoria c ON c.id = p.categoria_id;

-- Colección promocional de Ofertas
CREATE OR REPLACE VIEW v_coleccion_ofertas AS
SELECT * FROM v_producto_catalogo WHERE en_oferta AND visible;

-- Dashboard: productos más vendidos
CREATE OR REPLACE VIEW v_productos_mas_vendidos AS
SELECT p.id,
       p.codigo,
       p.nombre,
       SUM(d.cantidad)::int    AS unidades,
       SUM(d.subtotal)::bigint AS ingresos
FROM detalle_pedido d
JOIN pedido pe        ON pe.id = d.pedido_id
JOIN estado_pedido e  ON e.id  = pe.estado_id
JOIN producto p       ON p.id  = d.producto_id
WHERE e.codigo <> 'CANCELADO'
GROUP BY p.id, p.codigo, p.nombre
ORDER BY unidades DESC;

-- Dashboard: ventas mensuales
CREATE OR REPLACE VIEW v_ventas_mensuales AS
SELECT date_trunc('month', pe.fecha)::date AS mes,
       COUNT(*)                            AS pedidos,
       SUM(pe.total)::bigint               AS total_ventas
FROM pedido pe
JOIN estado_pedido e ON e.id = pe.estado_id
WHERE e.codigo <> 'CANCELADO'
GROUP BY 1
ORDER BY 1;
