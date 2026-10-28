/**
 * tienda.spec.js
 *
 * Pruebas unitarias de las funciones de persistencia de la tienda.
 * Todas estas funciones son de "lógica pura" — no usan componentes React,
 * solo trabajan con arrays y localStorage.
 *
 * Bloques de prueba:
 *   1. CRUD de productos (crear, actualizar, eliminar, leer órdenes).
 *   2. Gestión de categorías (crear, detectar duplicados, eliminar, persistencia).
 *   3. Visibilidad de productos (campo oculto, alternar estado).
 */

import {
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  leerOrdenes,
  guardarOrdenes,
  leerCategorias,
  crearCategoria,
  eliminarCategoria,
  alternarVisibilidadProducto,
  CATEGORIAS_KEY,
  CATEGORIAS_INICIALES
} from "../data/tienda.js";

// ─────────────────────────────────────────────────────────────────────────────
// Bloque 1 — CRUD de productos (lógica pura)
// ─────────────────────────────────────────────────────────────────────────────
describe("Persistencia local de la tienda", () => {
  // Catálogo base de prueba con un solo producto
  const base = [{ id: 1, nombre: "Prueba", precio: 1000, stock: 2 }];

  // Limpia localStorage después de cada prueba para evitar contaminación entre ellas
  afterEach(() => localStorage.clear());

  it("agrega un producto nuevo al catálogo", () => {
    const resultado = crearProducto(base, { id: 2, nombre: "Nuevo", precio: 2000, stock: 4 });
    expect(resultado.length).toBe(2);
    expect(resultado[1].nombre).toBe("Nuevo");
  });

  it("actualiza atributos de un producto sin modificar los demás", () => {
    const resultado = actualizarProducto(base, 1, { stock: 9 });
    // El nuevo array tiene el stock actualizado
    expect(resultado[0].stock).toBe(9);
    // El array original no fue mutado (inmutabilidad)
    expect(base[0].stock).toBe(2);
  });

  it("elimina el producto solicitado", () => {
    expect(eliminarProducto(base, 1).length).toBe(0);
  });

  it("guarda y recupera pedidos del almacenamiento local", () => {
    guardarOrdenes([{ id: "OFF-1", total: 12000 }]);
    expect(leerOrdenes()[0].id).toBe("OFF-1");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Bloque 2 — Gestión de categorías
// Prueba la lógica de crear, duplicar y eliminar categorías con persistencia
// ─────────────────────────────────────────────────────────────────────────────
describe("Gestión de categorías", () => {
  afterEach(() => localStorage.clear());

  it("retorna las categorías iniciales cuando no hay datos guardados", () => {
    // Sin datos previos en localStorage → devuelve las 4 categorías base del sistema
    const cats = leerCategorias();
    expect(cats.length).toBe(CATEGORIAS_INICIALES.length);
    expect(cats[0].id).toBe("tops");
  });

  it("crea una nueva categoría y la persiste en localStorage", () => {
    const base = leerCategorias();
    const actualizado = crearCategoria(base, { id: "calzado", label: "Calzado" });

    // La categoría debe estar en el array retornado
    expect(actualizado.some((c) => c.id === "calzado")).toBeTrue();

    // Y también persisted en localStorage
    const guardado = JSON.parse(localStorage.getItem(CATEGORIAS_KEY));
    expect(Array.isArray(guardado)).toBeTrue();
    expect(guardado.some((c) => c.id === "calzado")).toBeTrue();
  });

  it("no crea una categoría duplicada (misma id)", () => {
    // "tops" ya existe en las categorías iniciales → no debe duplicarse
    const base = leerCategorias();
    const primerIntento = crearCategoria(base, { id: "tops", label: "Tops Duplicado" });
    expect(primerIntento.filter((c) => c.id === "tops").length).toBe(1);
  });

  it("elimina una categoría existente y actualiza localStorage", () => {
    const base = leerCategorias();
    const conNueva = crearCategoria(base, { id: "joyeria", label: "Joyería" });
    const sinJoyeria = eliminarCategoria(conNueva, "joyeria");
    expect(sinJoyeria.some((c) => c.id === "joyeria")).toBeFalse();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Bloque 3 — Visibilidad de productos
// Prueba el campo `oculto` y la función que lo alterna
// ─────────────────────────────────────────────────────────────────────────────
describe("Visibilidad de productos en el catálogo", () => {
  // Catálogo de prueba con un producto visible y uno oculto
  const catalogo = [
    { id: 1, nombre: "Visible", precio: 10000, oculto: false },
    { id: 2, nombre: "Oculto",  precio: 20000, oculto: true  }
  ];

  it("crearProducto incluye el campo oculto como false por defecto", () => {
    // Si no se pasa el campo oculto, el producto debe ser visible por defecto
    const nuevo = crearProducto([], { nombre: "SinOculto", precio: 5000 });
    expect(nuevo[0].oculto).toBe(false);
  });

  it("crearProducto respeta el campo oculto cuando se pasa explícitamente", () => {
    // El admin puede crear un producto ya oculto desde el formulario
    const nuevo = crearProducto([], { nombre: "OcultoManual", precio: 5000, oculto: true });
    expect(nuevo[0].oculto).toBe(true);
  });

  it("alternarVisibilidadProducto invierte el estado oculto del producto indicado", () => {
    // El producto 1 era false → debe pasar a true
    const resultado = alternarVisibilidadProducto(catalogo, 1);
    expect(resultado[0].oculto).toBe(true);
    // El producto 2 no debe verse afectado
    expect(resultado[1].oculto).toBe(true);
  });

  it("alternarVisibilidadProducto no modifica otros productos del catálogo", () => {
    // El producto 2 era true → debe pasar a false
    const resultado = alternarVisibilidadProducto(catalogo, 2);
    // El producto 1 no debe verse afectado
    expect(resultado[0].oculto).toBe(false);
    expect(resultado[1].oculto).toBe(false);
  });
});
