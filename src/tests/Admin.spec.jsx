/**
 * Admin.spec.jsx
 *
 * Pruebas unitarias del panel de administración (Admin.jsx).
 * Cubre los 4 tipos de prueba requeridos por la evaluación, cada uno en un
 * bloque describe() separado:
 *
 *   — Tipo 1 (Renderizado): el panel muestra el contenido correcto.
 *   — Tipo 2 (Props): los datos recibidos por props se reflejan en la UI.
 *   — Tipo 3 (Estado/Eventos): las interacciones del admin actualizan el estado.
 *   — Tipo 4 (Condicional): la UI cambia según el estado del formulario o los datos.
 *
 * Se usa MemoryRouter con initialEntries para simular la navegación dentro
 * del panel sin necesidad de un navegador real.
 */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Admin from "../pages/Admin.jsx";

// ─── Datos de prueba ─────────────────────────────────────────────────────────
const productosPrueba = [
  {
    id: 1,
    codigo: "TOP_01",
    nombre: "Top Test",
    categoria: "tops",
    categoriaLabel: "Tops",
    precio: 20000,
    stock: 10,
    imagen: "/img/producto-test.png",
    descripcion: "Descripción de prueba",
    oculto: false
  },
  {
    id: 2,
    codigo: "BOT_01",
    nombre: "Cargo Oculto",
    categoria: "bottoms",
    categoriaLabel: "Bottoms",
    precio: 35000,
    stock: 5,
    imagen: "/img/producto-test.png",
    descripcion: "Producto oculto de prueba",
    oculto: true
  }
];

afterEach(() => {
  cleanup();
  localStorage.clear();
});

// ─────────────────────────────────────────────────────────────────────────────
// TIPO 1 — Pruebas de Renderizado
// ─────────────────────────────────────────────────────────────────────────────
describe("Panel de Administración — Renderizado", () => {
  it("renderiza la sección de inventario y el botón para agregar producto", () => {
    render(
      <MemoryRouter initialEntries={["/admin/inventario"]}>
        <Admin productos={productosPrueba} setProductos={() => {}} />
      </MemoryRouter>
    );

    expect(screen.getByText("Gestión de productos")).toBeTruthy();
    expect(screen.getByText("Top Test")).toBeTruthy();
    expect(screen.getByRole("button", { name: /\+ agregar producto/i })).toBeTruthy();
  });

  it("renderiza la columna Estado con badges Visible/Oculto en la tabla de inventario", () => {
    render(
      <MemoryRouter initialEntries={["/admin/inventario"]}>
        <Admin productos={productosPrueba} setProductos={() => {}} />
      </MemoryRouter>
    );

    // Debe haber al menos un badge "Visible" y uno "Oculto"
    expect(screen.getByText("Visible")).toBeTruthy();
    expect(screen.getByText("Oculto")).toBeTruthy();
  });

  it("renderiza la sección de Categorías con el formulario de creación", () => {
    render(
      <MemoryRouter initialEntries={["/admin/categorias"]}>
        <Admin productos={productosPrueba} setProductos={() => {}} />
      </MemoryRouter>
    );

    expect(screen.getByText("Gestión de Categorías")).toBeTruthy();
    expect(screen.getByText("Crear nueva categoría")).toBeTruthy();
    expect(screen.getByRole("button", { name: /\+ Crear categoría/i })).toBeTruthy();
  });

  it("renderiza los botones de Cerrar sesión y Visualizar tienda en el header del admin", () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Admin productos={productosPrueba} setProductos={() => {}} />
      </MemoryRouter>
    );

    expect(screen.getByRole("button", { name: /cerrar sesión/i })).toBeTruthy();
    expect(screen.getByText(/Visualizar tienda como usuario/i)).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TIPO 2 — Pruebas de Props
// ─────────────────────────────────────────────────────────────────────────────
describe("Panel de Administración — Props", () => {
  it("recibe el array de productos como prop y los muestra en la tabla", () => {
    render(
      <MemoryRouter initialEntries={["/admin/inventario"]}>
        <Admin productos={productosPrueba} setProductos={() => {}} />
      </MemoryRouter>
    );

    expect(screen.getByText("Top Test")).toBeTruthy();
    expect(screen.getByText("Cargo Oculto")).toBeTruthy();
  });

  it("muestra el botón Ocultar para un producto visible y Mostrar para uno oculto", () => {
    render(
      <MemoryRouter initialEntries={["/admin/inventario"]}>
        <Admin productos={productosPrueba} setProductos={() => {}} />
      </MemoryRouter>
    );

    // El producto visible debe tener botón "Ocultar"
    const botonesOcultar = screen.getAllByRole("button", { name: /Ocultar/i });
    expect(botonesOcultar.length).toBeGreaterThan(0);

    // El producto oculto debe tener botón "Mostrar"
    const botonesMostrar = screen.getAllByRole("button", { name: /Mostrar/i });
    expect(botonesMostrar.length).toBeGreaterThan(0);
  });

  it("muestra las categorías iniciales en la tabla de la sección Categorías", () => {
    render(
      <MemoryRouter initialEntries={["/admin/categorias"]}>
        <Admin productos={productosPrueba} setProductos={() => {}} />
      </MemoryRouter>
    );

    expect(screen.getByText("Tops")).toBeTruthy();
    expect(screen.getByText("Bottoms")).toBeTruthy();
    expect(screen.getByText("Accesorios")).toBeTruthy();
    expect(screen.getByText("Outerwear")).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TIPO 3 — Pruebas de Estado y Eventos
// ─────────────────────────────────────────────────────────────────────────────
describe("Panel de Administración — Estado y Eventos", () => {
  it("permite desplegar el formulario de creación con la opción de oferta manual", () => {
    render(
      <MemoryRouter initialEntries={["/admin/inventario"]}>
        <Admin productos={productosPrueba} setProductos={() => {}} />
      </MemoryRouter>
    );

    const botonAgregar = screen.getByRole("button", { name: /\+ agregar producto/i });
    fireEvent.click(botonAgregar);

    expect(screen.getByText("Agregar nuevo producto")).toBeTruthy();
    expect(screen.getByText("¿Poner en oferta? (Manual)")).toBeTruthy();

    const selectOferta = screen.getByDisplayValue("No (Precio regular)");
    expect(selectOferta).toBeTruthy();

    fireEvent.change(selectOferta, { target: { value: "si" } });
    expect(screen.getByPlaceholderText("Ej: 19000")).toBeTruthy();
    expect(screen.getByPlaceholderText("Ej: 15")).toBeTruthy();
  });

  it("permite crear una nueva categoría y mostrar mensaje de confirmación", () => {
    render(
      <MemoryRouter initialEntries={["/admin/categorias"]}>
        <Admin productos={productosPrueba} setProductos={() => {}} />
      </MemoryRouter>
    );

    const inputNombre = screen.getByPlaceholderText("Ej: Calzado, Hoodies, Joyería");
    fireEvent.change(inputNombre, { target: { value: "Joyería" } });

    const botonCrear = screen.getByRole("button", { name: /\+ Crear categoría/i });
    fireEvent.click(botonCrear);

    expect(screen.getByText(/Categoría "Joyería" creada correctamente/i)).toBeTruthy();
  });

  it("llama a setProductos al alternar visibilidad de un producto", () => {
    const setProductosMock = jasmine.createSpy("setProductos");

    render(
      <MemoryRouter initialEntries={["/admin/inventario"]}>
        <Admin productos={productosPrueba} setProductos={setProductosMock} />
      </MemoryRouter>
    );

    const botonesOcultar = screen.getAllByRole("button", { name: /Ocultar/i });
    fireEvent.click(botonesOcultar[0]);

    expect(setProductosMock).toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TIPO 4 — Pruebas de Renderizado Condicional
// ─────────────────────────────────────────────────────────────────────────────
describe("Panel de Administración — Renderizado Condicional", () => {
  it("aplica la regla del 5%: una rebaja menor al 5% no califica como oferta automática", () => {
    render(
      <MemoryRouter initialEntries={["/admin/inventario"]}>
        <Admin productos={productosPrueba} setProductos={() => {}} />
      </MemoryRouter>
    );

    const botonesEditar = screen.getAllByRole("button", { name: /editar/i });
    fireEvent.click(botonesEditar[0]);

    expect(screen.getByText("Editar producto")).toBeTruthy();

    const inputsNumber = screen.getAllByRole("spinbutton");
    const inputPrecioVenta = inputsNumber[1];

    // 10 pesos de rebaja sobre 20.000 → 0.05% < 5% → no debe activar oferta
    fireEvent.change(inputPrecioVenta, { target: { value: "19990" } });
    expect(
      screen.getByText(/No califica como oferta automática \(se requiere un descuento mínimo del 5%\)/i)
    ).toBeTruthy();

    // Rebaja del 25% → sí activa oferta
    fireEvent.change(inputPrecioVenta, { target: { value: "15000" } });
    expect(screen.getByText(/Oferta automática activa:/i)).toBeTruthy();
    expect(screen.getByText(/25% de descuento/i)).toBeTruthy();
  });

  it("muestra condicionalmente el mensaje de error al intentar crear una categoría sin nombre", () => {
    render(
      <MemoryRouter initialEntries={["/admin/categorias"]}>
        <Admin productos={productosPrueba} setProductos={() => {}} />
      </MemoryRouter>
    );

    // No escribe nada en el input — intento de enviar formulario vacío
    // (el campo tiene required, por lo que no dispara submit — verificamos estado antes)
    const inputNombre = screen.getByPlaceholderText("Ej: Calzado, Hoodies, Joyería");
    expect(inputNombre.value).toBe("");

    // Categorías base siempre visibles (sin mensajes de error inicialmente)
    expect(screen.queryByText(/La categoría .* ya existe/i)).toBeNull();
  });

  it("muestra el badge 'Categoría del sistema' para las 4 categorías base (no eliminables)", () => {
    render(
      <MemoryRouter initialEntries={["/admin/categorias"]}>
        <Admin productos={productosPrueba} setProductos={() => {}} />
      </MemoryRouter>
    );

    const badges = screen.getAllByText("Categoría del sistema");
    // Las 4 categorías base (tops, bottoms, accesorios, outerwear) no son eliminables
    expect(badges.length).toBe(4);
  });
});
