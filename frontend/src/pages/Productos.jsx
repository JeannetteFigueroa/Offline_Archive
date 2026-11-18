/**
 * Productos.jsx
 *
 * Página de catálogo de productos de la tienda (Off)line Archive.
 *
 * Funcionalidades:
 *   — Filtro dinámico por categoría (leída desde localStorage vía leerCategorias).
 *   — Filtro especial "OFERTAS" que muestra solo productos con ≥ 5% de descuento.
 *   — Buscador de texto libre (nombre, categoría, descripción).
 *   — Ocultamiento: los productos marcados como `oculto: true` en el admin
 *     NO se muestran en el catálogo público.
 *   — La categoría activa se sincroniza con el query param ?categoria=<slug>
 *     para que los enlaces desde Colecciones activen el filtro correctamente.
 */

import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import ProductCard from "../components/ProductCard";
import { tieneOferta } from "../utils/precios";
import { leerCategorias } from "../data/tienda";

import "../styles/productos.css";

function Productos({
  productos,
  agregarAlCarrito
}) {
  // Lee el parámetro ?categoria=... de la URL (ej: /productos?categoria=tops)
  const [
    searchParams,
    setSearchParams
  ] = useSearchParams();

  const categoriaUrl =
    searchParams.get("categoria") || "todos";

  // Estado del buscador de texto libre
  const [busqueda, setBusqueda] =
    useState("");

  // Lee las categorías guardadas en localStorage (incluye las creadas desde el admin).
  const categoriasDinamicas = leerCategorias();

  // Construye la lista de filtros válidos combinando "todos", las categorías
  // dinámicas y el filtro especial "ofertas" (no es una categoría real de producto).
  const categoriasValidas = [
    "todos",
    ...categoriasDinamicas.map((c) => c.id),
    "ofertas"
  ];

  // Si la URL trae un parámetro de categoría desconocido, cae a "todos".
  const categoriaActual =
    categoriasValidas.includes(categoriaUrl)
      ? categoriaUrl
      : "todos";

  /**
   * Normaliza un texto para comparación sin importar tildes ni mayúsculas.
   * Ejemplo: "Ñoño" → "nono"
   *
   * @param {string} texto
   * @returns {string}
   */
  const normalizarTexto = (texto = "") => {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  /**
   * Aplica los filtros de categoría y búsqueda sobre el catálogo completo.
   *
   * Reglas de filtrado:
   *   1. Los productos con oculto === true nunca se muestran.
   *   2. Si la categoría es "todos", pasan todos los productos visibles.
   *   3. Si la categoría es "ofertas", pasan solo los que tienen tieneOferta() === true.
   *   4. En cualquier otra categoría, pasan los que coinciden en producto.categoria.
   *   5. Finalmente se aplica el filtro de búsqueda de texto.
   */
  const productosFiltrados =
    productos.filter((producto) => {
      // Excluye productos ocultos desde el panel admin
      if (producto.oculto) return false;

      let coincideCategoria = false;

      // TODOS: sin filtro de categoría
      if (categoriaActual === "todos") {
        coincideCategoria = true;
      }

      // OFERTAS: productos con descuento activo (≥ 5%)
      else if (categoriaActual === "ofertas") {
        coincideCategoria =
          tieneOferta(producto);
      }

      // CATEGORÍAS NORMALES: coincidencia exacta de slug
      else {
        coincideCategoria =
          producto.categoria ===
          categoriaActual;
      }

      // Búsqueda en nombre, categoría y descripción (sin tildes)
      const textoProducto =
        normalizarTexto(
          `${producto.nombre || ""} ${
            producto.categoriaLabel || ""
          } ${producto.descripcion || ""}`
        );

      const coincideBusqueda =
        textoProducto.includes(
          normalizarTexto(busqueda)
        );

      return (
        coincideCategoria &&
        coincideBusqueda
      );
    });

  /**
   * Cambia el filtro de categoría activo actualizando el query param en la URL.
   * "todos" limpia el parámetro para una URL más limpia (/productos en vez de /productos?categoria=todos).
   *
   * @param {string} categoria
   */
  const cambiarCategoria = (categoria) => {
    if (categoria === "todos") {
      setSearchParams({});
    } else {
      setSearchParams({
        categoria
      });
    }
  };

  return (
    <>
      <main className="products-page container-fluid px-3 px-md-5">

        {/* Encabezado con título y conteo de productos filtrados */}
        <section className="products-header">

          <p className="products-code">
            ARCHIVE / PRODUCT_SYSTEM
          </p>

          <div className="products-heading">

            <h1>
              PRODUCTOS.
            </h1>

            <p className="products-summary">
              <span>
                {productosFiltrados.length}
              </span>{" "}
              PIEZAS DISPONIBLES
            </p>

          </div>

        </section>

        {/* Controles: buscador + botones de filtro de categoría */}
        <section
          className="catalog-controls"
          id="catalogControls"
        >

          <div className="product-search">

            <label htmlFor="productSearch">
              BUSCAR EN EL ARCHIVO
            </label>

            <input
              type="search"
              id="productSearch"
              placeholder="Nombre o categoría..."
              value={busqueda}
              onChange={(event) =>
                setBusqueda(
                  event.target.value
                )
              }
            />

          </div>

          {/* Botones de filtro: TODOS + categorías dinámicas + OFERTAS */}
          <div className="product-filters">

            {[
              ["todos", "TODOS"],
              /* Categorías guardadas en localStorage (dinámicas del admin) */
              ...categoriasDinamicas.map((c) => [c.id, c.label.toUpperCase()]),
              /* Filtro especial de ofertas siempre al final */
              ["ofertas", "OFERTAS"]
            ].map(
              ([valor, texto]) => (
                <button
                  key={valor}
                  type="button"
                  className={
                    categoriaActual === valor
                      ? "filter-button active"
                      : "filter-button"
                  }
                  onClick={() =>
                    cambiarCategoria(valor)
                  }
                >
                  {texto}
                </button>
              )
            )}

          </div>

        </section>

        {/* Grilla de productos filtrados o mensaje si no hay resultados */}
        <section className="products-catalog">

          {productosFiltrados.length === 0 ? (
            <p className="empty-products">
              NO SE ENCONTRARON PRODUCTOS EN EL ARCHIVO.
            </p>
          ) : (
            <div className="products-grid row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-3">

              {productosFiltrados.map(
                (producto) => (
                  <div
                    className="col"
                    key={producto.id}
                  >
                    <ProductCard
                      producto={producto}
                      agregarAlCarrito={
                        agregarAlCarrito
                      }
                    />
                  </div>
                )
              )}

            </div>
          )}

        </section>

      </main>

      <footer className="products-footer">

        <span>
          (OFF)LINE ARCHIVE
        </span>

        <span>
          VER_2003 | GRUPO 07
        </span>

      </footer>
    </>
  );
}

export default Productos;
