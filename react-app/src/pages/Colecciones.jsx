import CollectionCard from "../components/CollectionCard";
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