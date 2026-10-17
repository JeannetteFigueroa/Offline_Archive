import { Link } from "react-router-dom";
import "../styles/home.css";

function Home() {
  return (
    <main className="home">
      <section className="hero">
        <div className="hero-content">

          <p className="hero-brand">
            (Off)line Archive
          </p>

          <h1 className="hero-title">
            <span>
              ESTO NO ES
            </span>

            <span>
              EL FUTURO.
            </span>

            <span className="neon-text">
              ES EL ARCHIVO.
            </span>
          </h1>

          <p className="hero-description">
            Ropa seleccionada del archivo.
            Estética underground.
            Piezas que no siguen tendencias.
          </p>

          <Link
            to="/colecciones"
            className="hero-button"
          >
            <span>
              VER COLECCIÓN
            </span>

            <span>
              →
            </span>
          </Link>

        </div>
      </section>
    </main>
  );
}

export default Home;