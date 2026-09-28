import { Link } from "react-router-dom";
import "../styles/collection.css";

function Colecciones() {
  const colecciones = [
    {
      id: 1,
      nombre: "TOPS",
      categoria: "tops",
      imagen: "/img/Photo_1.jpg"
    },
    {
      id: 2,
      nombre: "BOTTOMS",
      categoria: "bottoms",
      imagen: "/img/Photo_2.jpg"
    },
    {
      id: 3,
      nombre: "ACCESSORIES",
      categoria: "accesorios",
      imagen: "/img/Photo_3.jpg"
    },
    {
      id: 4,
      nombre: "OUTERWEAR",
      categoria: "outerwear",
      imagen: "/img/Photo_4.jpg"
    }
  ];

  return (
    <main>
      <section
        className="collections"
        aria-labelledby="collections-title"
      >
        <h1
          id="collections-title"
          className="collections-title"
        >
          COLLECTIONS.
        </h1>

        <div className="collections-grid">
          {colecciones.map((coleccion, index) => (
            <Link
              key={coleccion.id}
              to={`/productos?categoria=${coleccion.categoria}`}
              className="collection-card"
            >
              <img
                src={coleccion.imagen}
                alt={`Colección ${coleccion.nombre}`}
              />

              <div
                className="collection-overlay"
                aria-hidden="true"
              ></div>

              <span className="collection-number">
                {String(index + 1).padStart(2, "0")}
              </span>

              <h2 className="collection-name">
                {coleccion.nombre}
              </h2>

              <span
                className="collection-arrow"
                aria-hidden="true"
              >
                ↗
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Colecciones;