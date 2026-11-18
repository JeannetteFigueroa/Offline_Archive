/**
 * CollectionCard.jsx
 *
 * Tarjeta de colección que se muestra en la página /colecciones.
 * Genera un enlace a /productos con el filtro de categoría correspondiente.
 *
 * Props recibidas:
 *   coleccion → objeto con { id, nombre, categoria, imagen, destacada? }
 *   index     → posición en el array (0-based), usada para el número visual (01, 02…)
 *
 * La prop `destacada: true` agrega la clase "collection-card--featured"
 * que aplica un estilo visual diferente (usada en la colección OFERTAS).
 */

import { Link } from "react-router-dom";

function CollectionCard({ coleccion, index }) {
  // Formatea el índice como número de 2 dígitos: 0 → "01", 4 → "05"
  const numero = String(index + 1).padStart(2, "0");

  return (
    // Enlace que aplica el filtro de categoría al ir a la página de productos
    <Link
      to={`/productos?categoria=${coleccion.categoria}`}
      className={`collection-card ${coleccion.destacada ? "collection-card--featured" : ""}`}
    >
      {/* Imagen de fondo de la colección */}
      <img
        src={coleccion.imagen}
        alt={`Colección ${coleccion.nombre}`}
      />

      {/* Overlay oscuro decorativo (oculto para lectores de pantalla) */}
      <div
        className="collection-overlay"
        aria-hidden="true"
      ></div>

      {/* Número correlativo de la colección (01, 02, 03…) */}
      <span className="collection-number">
        {numero}
      </span>

      {/* Nombre de la colección */}
      <h2 className="collection-name">
        {coleccion.nombre}
      </h2>

      {/* Flecha decorativa */}
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
