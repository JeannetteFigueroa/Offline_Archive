import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import CartItem from "../components/CartItem.jsx";

// simulacion con 2 unidades para las pruebas
const productoPrueba = {
  id: 3,
  codigo: "ITEM_003",
  nombre: "Cargo Rupture",
  precio: 34990,
  cantidad: 2,
  stock: 10,
  imagen: "/img/producto-test.png"
};

// para limpiar despues de cada prueba 
afterEach(() => {
  cleanup();
});

describe("Componente CartItem", () => {
  it("debería mostrar los datos del producto", () => {
    render(
      <CartItem
        producto={productoPrueba}
        eliminarDelCarrito={() => {}}
        aumentarCantidad={() => {}}
        disminuirCantidad={() => {}}
      />
    );

    expect(
      screen.getByText("Cargo Rupture")
    ).toBeTruthy();

    expect(
      screen.getByText("ITEM_003")
    ).toBeTruthy();

    expect(
      screen.getByText(/Precio unitario:/i)
    ).toBeTruthy();
  });

  it("debería calcular correctamente el subtotal", () => {
    render(
      <CartItem
        producto={productoPrueba}
        eliminarDelCarrito={() => {}}
        aumentarCantidad={() => {}}
        disminuirCantidad={() => {}}
      />
    );

    // 34.990 multiplicado por 2 es igual a 69.980
    expect(
      screen.getByText("$69.980")
    ).toBeTruthy();
  });

  it("debería solicitar aumentar la cantidad", () => {
    const aumentarCantidad = jasmine.createSpy("aumentarCantidad");

    render(
      <CartItem
        producto={productoPrueba}
        eliminarDelCarrito={() => {}}
        aumentarCantidad={aumentarCantidad}
        disminuirCantidad={() => {}}
      />
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Aumentar cantidad"
      })
    );

    expect(aumentarCantidad).toHaveBeenCalledWith(productoPrueba);
  });

  it("debería solicitar disminuir la cantidad", () => {
    const disminuirCantidad = jasmine.createSpy("disminuirCantidad");

    render(
      <CartItem
        producto={productoPrueba}
        eliminarDelCarrito={() => {}}
        aumentarCantidad={() => {}}
        disminuirCantidad={disminuirCantidad}
      />
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Disminuir cantidad"
      })
    );

    expect(disminuirCantidad).toHaveBeenCalledWith(productoPrueba);
  });

  it("debería enviar el identificador al eliminar el producto", () => {
    const eliminarDelCarrito = jasmine.createSpy("eliminarDelCarrito");

    render(
      <CartItem
        producto={productoPrueba}
        eliminarDelCarrito={eliminarDelCarrito}
        aumentarCantidad={() => {}}
        disminuirCantidad={() => {}}
      />
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "ELIMINAR"
      })
    );

    expect(eliminarDelCarrito).toHaveBeenCalledWith(3);
  });
});