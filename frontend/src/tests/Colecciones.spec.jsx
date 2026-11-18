import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Colecciones from "../pages/Colecciones.jsx";

afterEach(() => {
  cleanup();
});

describe("Página Colecciones (Pruebas de Renderizado de Listas)", () => {
  it("renderiza todos los elementos de la lista de colecciones (5 colecciones)", () => {
    render(
      <MemoryRouter>
        <Colecciones />
      </MemoryRouter>
    );

    // Debe renderizar el título de la página
    expect(screen.getByText("COLLECTIONS.")).toBeTruthy();

    // Debe renderizar cada una de las 5 colecciones del conjunto de datos
    expect(screen.getByText("TOPS")).toBeTruthy();
    expect(screen.getByText("BOTTOMS")).toBeTruthy();
    expect(screen.getByText("ACCESSORIES")).toBeTruthy();
    expect(screen.getByText("OUTERWEAR")).toBeTruthy();
    expect(screen.getByText("OFERTAS")).toBeTruthy();

    // Debe renderizar los 5 números correlativos formateados
    expect(screen.getByText("01")).toBeTruthy();
    expect(screen.getByText("02")).toBeTruthy();
    expect(screen.getByText("03")).toBeTruthy();
    expect(screen.getByText("04")).toBeTruthy();
    expect(screen.getByText("05")).toBeTruthy();
  });

  it("incluye la colección de OFERTAS con redirección al catálogo con filtro de ofertas", () => {
    render(
      <MemoryRouter>
        <Colecciones />
      </MemoryRouter>
    );

    const enlaces = screen.getAllByRole("link");
    const enlaceOfertas = enlaces.find((link) =>
      link.getAttribute("href") === "/productos?categoria=ofertas"
    );

    expect(enlaceOfertas).toBeTruthy();
    expect(enlaceOfertas.textContent).toContain("OFERTAS");
    expect(enlaceOfertas.className).toContain("collection-card--featured");
  });
});
