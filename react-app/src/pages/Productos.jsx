import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import ProductCard from "../components/ProductCard";
import "../styles/productos.css";

function Productos({ productos, agregarAlCarrito }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const categoriaUrl =
    searchParams.get("categoria") || "todos";

  const [busqueda, setBusqueda] = useState("");

  const categoriasValidas = [
    "todos",
    "tops",
    "bottoms",
    "accesorios",
    "outerwear"
  ];

  const categoriaActual =
    categoriasValidas.includes(categoriaUrl)
      ? categoriaUrl
      : "todos";

  const normalizarTexto = (texto) => {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  const productosFiltrados = productos.filter((producto) => {
    const coincideCategoria =
      categoriaActual === "todos" ||
      producto.categoria === categoriaActual;

    const textoProducto = normalizarTexto(
      `${producto.nombre} ${producto.categoriaLabel} ${producto.descripcion}`
    );

    const coincideBusqueda =
      textoProducto.includes(
        normalizarTexto(busqueda)
      );

    return coincideCategoria && coincideBusqueda;
  });

  const cambiarCategoria = (categoria) => {
    if (categoria === "todos") {
      setSearchParams({});
    } else {
      setSearchParams({
        categoria: categoria
      });
    }
  };

  return (
    <>
      <main className="products-page">

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
              </span>
              {" "}
              PIEZAS DISPONIBLES
            </p>

          </div>

        </section>

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
                setBusqueda(event.target.value)
              }
            />

          </div>

          <div className="product-filters">

            {[
              ["todos", "TODOS"],
              ["tops", "TOPS"],
              ["bottoms", "BOTTOMS"],
              ["accesorios", "ACCESORIOS"],
              ["outerwear", "OUTERWEAR"]
            ].map(([valor, texto]) => (
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
            ))}

          </div>

        </section>

        <section className="products-catalog">

          {productosFiltrados.length === 0 ? (
            <p className="empty-products">
              NO SE ENCONTRARON PRODUCTOS EN EL ARCHIVO.
            </p>
          ) : (
            <div className="products-grid">

              {productosFiltrados.map((producto) => (
                <ProductCard
                  key={producto.id}
                  producto={producto}
                  agregarAlCarrito={agregarAlCarrito}
                />
              ))}

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