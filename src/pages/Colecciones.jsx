/**
 * Colecciones.jsx
 *
 * Página de colecciones de la tienda (Off)line Archive.
 * Muestra una grilla visual de 2 columnas con el siguiente orden estructurado:
 *   1. 01 TOPS
 *   2. 02 BOTTOMS
 *   3. 03 ACCESSORIES
 *   4. 04 OUTERWEAR
 *   5. 05 OFERTAS (con el mismo estilo y tamaño que las demás categorías)
 *   6. Nuevas categorías creadas desde el admin (se posicionan al costado de Ofertas
 *      o debajo de esta según la cantidad existente, respetando el flujo natural del grid).
 */

import CollectionCard from "../components/CollectionCard";
import { leerCategorias } from "../data/tienda";
import "../styles/collection.css";

// Imágenes asignadas a las 4 categorías base del sistema
const IMAGENES_CATEGORIA = {
  tops: "/img/Photo_1.jpg",
  bottoms: "/img/Photo_2.jpg",
  accesorios: "/img/Photo_3.jpg",
  outerwear: "/img/Photo_4.jpg"
};

// Fotos rotativas para nuevas categorías que cree el administrador
const FOTOS_ROTATIVAS = [
  "/img/Photo_1.jpg",
  "/img/Photo_2.jpg",
  "/img/Photo_3.jpg",
  "/img/Photo_4.jpg"
];

const CATEGORIAS_BASE_IDS = ["tops", "bottoms", "accesorios", "outerwear"];

function Colecciones() {
  // Carga las categorías dinámicas almacenadas (incluye las creadas por el admin)
  const categoriasGuardadas = leerCategorias();

  // Función auxiliar para transformar una categoría en objeto de tarjeta
  const mapearColeccion = (cat, idx) => {
    let nombreMostrar = cat.label.toUpperCase();
    if (cat.id === "accesorios") nombreMostrar = "ACCESSORIES";

    return {
      id: cat.id,
      nombre: nombreMostrar,
      categoria: cat.id,
      imagen: IMAGENES_CATEGORIA[cat.id] || FOTOS_ROTATIVAS[idx % FOTOS_ROTATIVAS.length]
    };
  };

  // Separa las categorías del sistema de las creadas por el admin
  const categoriasBase = categoriasGuardadas.filter((c) =>
    CATEGORIAS_BASE_IDS.includes(c.id)
  );

  const categoriasNuevas = categoriasGuardadas.filter(
    (c) => !CATEGORIAS_BASE_IDS.includes(c.id)
  );

  const coleccionesBase = categoriasBase.map((cat, idx) => mapearColeccion(cat, idx));

  /**
   * Tarjeta de OFERTAS:
   * Ocupa la posición fija 05. Tiene el mismo tamaño y estilo de las demás categorías
   * para que al crear una categoría nueva, esta se ubique al costado (posición 06)
   * o debajo si se siguen agregando.
   */
  const coleccionOfertas = {
    id: "ofertas",
    nombre: "OFERTAS",
    categoria: "ofertas",
    imagen: "/img/Photo_1.jpg",
    destacada: true
  };

  const coleccionesNuevas = categoriasNuevas.map((cat, idx) =>
    mapearColeccion(cat, coleccionesBase.length + 1 + idx)
  );

  // Lista en orden: Base (01-04) -> Ofertas (05) -> Nuevas categorías (06 en adelante)
  const listaCompletaColecciones = [
    ...coleccionesBase,
    coleccionOfertas,
    ...coleccionesNuevas
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

        {/* Grilla dinámica de 2 columnas donde las tarjetas fluyen naturalmente */}
        <div className="collections-grid">
          {listaCompletaColecciones.map((coleccion, index) => (
            <CollectionCard
              key={coleccion.id}
              coleccion={coleccion}
              index={index}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

export default Colecciones;
