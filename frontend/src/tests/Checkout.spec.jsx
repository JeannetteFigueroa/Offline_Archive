
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor
} from "@testing-library/react";

import {
  MemoryRouter,
  Route,
  Routes
} from "react-router-dom";

import { vi } from "vitest";

import Checkout from "../pages/Checkout.jsx";
import pedidoService from "../services/pedidoService";

// Simula el servicio de pedidos del backend.
vi.mock("../services/pedidoService", () => ({
  default: {
    crearPedido: vi.fn()
  }
}));

// Producto utilizado durante las pruebas.
const productoPrueba = {
  id: 1,
  codigo: "ITEM_TEST",
  nombre: "Baby Tee Test",
  precio: 19990,
  cantidad: 1,
  stock: 5,
  imagen: "/img/producto-test.png"
};

// Simula una respuesta exitosa del backend.
const pedidoPrueba = {
  id: 1,
  numeroPedido: "OFF-000001",
  estadoCodigo: "CONFIRMADO",
  estadoNombre: "Confirmado",
  clienteNombre: "Cliente Test",
  clienteCorreo: "cliente@gmail.com",
  tipoEntregaCodigo: "DOMICILIO",
  subtotal: 19990,
  costoEnvio: 3990,
  total: 23980,
  detalles: [
    {
      productoId: 1,
      nombreProducto: "Baby Tee Test",
      cantidad: 1
    }
  ]
};

// Limpia los datos entre pruebas.
afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
  vi.resetAllMocks();
});

// Completa los campos del formulario.
function completarFormulario() {
  const datos = {
    "NOMBRE COMPLETO": "Cliente Test",
    "CORREO": "cliente@gmail.com",
    "TELÉFONO": "912345678",
    "REGIÓN": "Metropolitana de Santiago",
    "COMUNA": "Santiago",
    "DIRECCIÓN": "Avenida Principal 123",
    "TIPO DE ENTREGA": "domicilio",
    "MÉTODO DE PAGO": "Débito"
  };

  Object.entries(datos).forEach(([campo, valor]) => {
    fireEvent.change(screen.getByLabelText(campo), {
      target: { value: valor }
    });
  });
}

// Renderiza el checkout con sus rutas.
function renderizarCheckout(
  vaciarCarrito,
  descontarStockCompra = vi.fn()
) {
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
              descontarStockCompra={descontarStockCompra}
            />
          }
        />

        <Route
          path="/compra-exitosa"
          element={<p>COMPRA FINALIZADA</p>}
        />

        <Route
          path="/pago-rechazado"
          element={<p>PAGO RECHAZADO DE PRUEBA</p>}
        />
      </Routes>
    </MemoryRouter>
  );
}

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
    renderizarCheckout(vi.fn());

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

    expect(
      pedidoService.crearPedido
    ).not.toHaveBeenCalled();
  });

  it("debería registrar el pedido en el backend y vaciar el carrito", async () => {
    const vaciarCarrito = vi.fn();
    const descontarStockCompra = vi.fn();

    // El backend responde con un pedido confirmado.
    pedidoService.crearPedido.mockResolvedValue(
      pedidoPrueba
    );

    renderizarCheckout(
      vaciarCarrito,
      descontarStockCompra
    );

    completarFormulario();

    fireEvent.click(
      screen.getByRole("button", {
        name: /confirmar compra/i
      })
    );

    // Comprueba los datos enviados al servicio.
    expect(
      pedidoService.crearPedido
    ).toHaveBeenCalledTimes(1);

    expect(
      pedidoService.crearPedido
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: "Cliente Test",
        correo: "cliente@gmail.com",
        tipoEntrega: "domicilio",
        metodoPago: "Débito",
        carrito: [productoPrueba]
      })
    );

    // Espera la confirmación de la compra.
    expect(
      await screen.findByText("COMPRA FINALIZADA")
    ).toBeTruthy();

    expect(vaciarCarrito).toHaveBeenCalledTimes(1);

    expect(
      descontarStockCompra
    ).toHaveBeenCalledWith([productoPrueba]);

    // Ya no se guardan pedidos en localStorage.
    expect(
      localStorage.getItem("offlineArchiveLastOrder")
    ).toBeNull();

    expect(
      localStorage.getItem("offlineArchiveOrders")
    ).toBeNull();
  });

  it("debería conservar el carrito al simular un pago rechazado", () => {
    const vaciarCarrito = vi.fn();

    renderizarCheckout(vaciarCarrito);

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

    expect(
      pedidoService.crearPedido
    ).not.toHaveBeenCalled();
  });

  it("debería conservar el carrito si falla el backend", async () => {
    const vaciarCarrito = vi.fn();
    const descontarStockCompra = vi.fn();

    // Simula un error al registrar el pedido.
    pedidoService.crearPedido.mockRejectedValue(
      new Error("Stock insuficiente")
    );

    renderizarCheckout(
      vaciarCarrito,
      descontarStockCompra
    );

    completarFormulario();

    fireEvent.click(
      screen.getByRole("button", {
        name: /confirmar compra/i
      })
    );

    await waitFor(() => {
      expect(
        screen.getByText("Stock insuficiente")
      ).toBeTruthy();
    });

    expect(
      vaciarCarrito
    ).not.toHaveBeenCalled();

    expect(
      descontarStockCompra
    ).not.toHaveBeenCalled();

    expect(
      screen.queryByText("COMPRA FINALIZADA")
    ).toBeNull();
  });
});
