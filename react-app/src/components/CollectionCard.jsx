import { Link } from "react-router-dom";

function CollectionCard({ coleccion, index }) {
  const numero = String(index + 1).padStart(2, "0");

  return (
    <Link
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
        {numero}
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
  );
}

export default CollectionCard;
