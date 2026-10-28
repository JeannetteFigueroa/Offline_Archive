import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import ProductCard from "../components/ProductCard.jsx";

// simulacion de un producto para las pruebas
const productoPrueba = {
  id: 1,
  codigo: "ITEM_TEST",
  nombre: "Baby Tee Test",
  categoria: "tops",
  categoriaLabel: "Tops",
  precio: 19990,
  stock: 8,
  imagen: "/img/producto-test.png",
  descripcion: "Producto utilizado para las pruebas."
};

// para limpiar el DOM después de cada prueba y evitar efectos secundarios entre pruebas
afterEach(() => {
  cleanup();
});

describe("Componente ProductCard", () => {
  it("debería mostrar la información recibida mediante props", () => {
    const agregarAlCarrito = jasmine.createSpy("agregarAlCarrito");

    render(
      <MemoryRouter>
        <ProductCard
          producto={productoPrueba}
          agregarAlCarrito={agregarAlCarrito}
        />
      </MemoryRouter>
    );

    expect(
      screen.getByText("Baby Tee Test")
    ).toBeTruthy();

    expect(
      screen.getByText("Tops")
    ).toBeTruthy();

    expect(
      screen.getByText("STOCK: 8")
    ).toBeTruthy();
  });

  it("debería crear un enlace hacia el detalle del producto", () => {
    const agregarAlCarrito = jasmine.createSpy("agregarAlCarrito");

    render(
      <MemoryRouter>
        <ProductCard
          producto={productoPrueba}
          agregarAlCarrito={agregarAlCarrito}
        />
      </MemoryRouter>
    );

    const enlaceDetalle = screen.getByRole("link", {
      name: "VER DETALLE"
    });

    expect(
      enlaceDetalle.getAttribute("href")
    ).toBe("/productos/1");
  });

  it("debería ejecutar agregarAlCarrito al presionar AGREGAR", () => {
    const agregarAlCarrito = jasmine.createSpy("agregarAlCarrito");

    render(
      <MemoryRouter>
        <ProductCard
          producto={productoPrueba}
          agregarAlCarrito={agregarAlCarrito}
        />
      </MemoryRouter>
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /agregar/i
      })
    );

    expect(agregarAlCarrito).toHaveBeenCalledWith(productoPrueba);
  });
});