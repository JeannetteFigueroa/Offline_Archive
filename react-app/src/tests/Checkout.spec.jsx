import {
  cleanup,
  fireEvent,
  render,
  screen
} from "@testing-library/react";

import {
  MemoryRouter,
  Route,
  Routes
} from "react-router-dom";

import Checkout from "../pages/Checkout.jsx";

// Producto utilizado solamente durante las pruebas.
const productoPrueba = {
  id: 1,
  codigo: "ITEM_TEST",
  nombre: "Baby Tee Test",
  precio: 19990,
  cantidad: 1,
  stock: 5,
  imagen: "/img/producto-test.png"
};

// Limpia el DOM y el almacenamiento entre pruebas.
afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("Página Checkout", () => {
  it("debería mostrar un mensaje cuando el carrito está vacío", () => {
    render(
      <MemoryRouter>
        <Checkout
          carrito={[]}
          totalCarrito={0}
          vaciarCarrito={() => {}}
        />
      </MemoryRouter>
    );

    expect(
      screen.getByText("NO HAY PRODUCTOS.")
    ).toBeTruthy();

    expect(
      screen.getByRole("link", {
        name: /ver productos/i
      }).getAttribute("href")
    ).toBe("/productos");
  });

  it("debería mostrar errores al enviar el formulario vacío", () => {
    render(
      <MemoryRouter>
        <Checkout
          carrito={[productoPrueba]}
          totalCarrito={19990}
          vaciarCarrito={() => {}}
        />
      </MemoryRouter>
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /confirmar compra/i
      })
    );

    expect(
      screen.getByText(
        "Ingresa el nombre del comprador."
      )
    ).toBeTruthy();

    expect(
      screen.getByText(
        "Ingresa un correo electrónico."
      )
    ).toBeTruthy();

    expect(
      screen.getByText(
        "Selecciona un método de pago."
      )
    ).toBeTruthy();
  });

  it("debería guardar la orden y vaciar el carrito", () => {
    const vaciarCarrito = jasmine.createSpy(
      "vaciarCarrito"
    );

    render(
      <MemoryRouter initialEntries={["/checkout"]}>
        <Routes>
          <Route
            path="/checkout"
            element={
              <Checkout
                carrito={[productoPrueba]}
                totalCarrito={19990}
                vaciarCarrito={vaciarCarrito}
              />
            }
          />

          <Route
            path="/compra-exitosa"
            element={
              <p>COMPRA FINALIZADA</p>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(
      screen.getByLabelText("NOMBRE COMPLETO"),
      {
        target: {
          value: "Misael Rojas"
        }
      }
    );

    fireEvent.change(
      screen.getByLabelText("CORREO"),
      {
        target: {
          value: "misael@gmail.com"
        }
      }
    );

    fireEvent.change(
      screen.getByLabelText("TELÉFONO"),
      {
        target: {
          value: "912345678"
        }
      }
    );

    fireEvent.change(
      screen.getByLabelText("REGIÓN"),
      {
        target: {
          value: "Metropolitana de Santiago"
        }
      }
    );

    fireEvent.change(
      screen.getByLabelText("COMUNA"),
      {
        target: {
          value: "Santiago"
        }
      }
    );

    fireEvent.change(
      screen.getByLabelText("DIRECCIÓN"),
      {
        target: {
          value: "Avenida Principal 123"
        }
      }
    );

    fireEvent.change(
      screen.getByLabelText("MÉTODO DE PAGO"),
      {
        target: {
          value: "Débito"
        }
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /confirmar compra/i
      })
    );

    const ordenGuardada = JSON.parse(
      localStorage.getItem(
        "offlineArchiveLastOrder"
      )
    );

    expect(ordenGuardada).toBeTruthy();
    expect(ordenGuardada.estado).toBe("PAGADA");
    expect(ordenGuardada.total).toBe(23980);

    expect(
      vaciarCarrito
    ).toHaveBeenCalled();

    expect(
      screen.getByText("COMPRA FINALIZADA")
    ).toBeTruthy();
  });

  it("debería conservar el carrito al simular un pago rechazado", () => {
    const vaciarCarrito = jasmine.createSpy(
      "vaciarCarrito"
    );

    render(
      <MemoryRouter initialEntries={["/checkout"]}>
        <Routes>
          <Route
            path="/checkout"
            element={
              <Checkout
                carrito={[productoPrueba]}
                totalCarrito={19990}
                vaciarCarrito={vaciarCarrito}
              />
            }
          />

          <Route
            path="/pago-rechazado"
            element={
              <p>PAGO RECHAZADO DE PRUEBA</p>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /pago rechazado/i
      })
    );

    expect(
      screen.getByText(
        "PAGO RECHAZADO DE PRUEBA"
      )
    ).toBeTruthy();

    expect(
      vaciarCarrito
    ).not.toHaveBeenCalled();
  });
});