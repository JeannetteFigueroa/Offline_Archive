/**
 * AdminPreviewBanner.spec.jsx
 *
 * Pruebas unitarias del componente AdminPreviewBanner.
 * Este banner aparece cuando un administrador navega fuera del panel /admin
 * (modo vista previa de la tienda).
 *
 * Tipos de prueba cubiertos:
 *   — Tipo 1 (Renderizado): el banner muestra badge y botón correctamente.
 *   — Tipo 4 (Condicional): el banner aparece o desaparece según sesión y ruta.
 */

import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminPreviewBanner from "../components/AdminPreviewBanner.jsx";
import { SESSION_KEY } from "../utils/auth.js";

/**
 * Helper de prueba: simula una sesión activa de administrador en localStorage.
 * Equivale a lo que ocurre cuando el admin inicia sesión correctamente.
 */
function simularSesionAdmin() {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ email: "admin@gmail.com", role: "admin", name: "Admin" })
  );
}

// Limpia el DOM y elimina los datos de sesión entre prueba y prueba
afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});

// ─────────────────────────────────────────────────────────────────────────────
// TIPO 4 — Pruebas de Renderizado Condicional
// El banner solo aparece bajo condiciones específicas (sesión admin + ruta no-admin)
// ─────────────────────────────────────────────────────────────────────────────
describe("Componente AdminPreviewBanner — Renderizado Condicional", () => {
  it("NO se renderiza cuando no hay sesión de admin activa", () => {
    // Sin sesión en localStorage, el banner debe retornar null
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AdminPreviewBanner />
      </MemoryRouter>
    );
    expect(screen.queryByText("MODO VISTA PREVIA")).toBeNull();
  });

  it("NO se renderiza cuando el admin está dentro del panel /admin (no es modo vista previa)", () => {
    // El admin está en su propio panel: el banner no tiene sentido ahí
    simularSesionAdmin();

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <AdminPreviewBanner />
      </MemoryRouter>
    );
    expect(screen.queryByText("MODO VISTA PREVIA")).toBeNull();
  });

  it("SÍ se renderiza cuando el admin navega fuera del panel (modo vista previa activo)", () => {
    // Admin en /productos → está viendo la tienda como cliente → muestra el banner
    simularSesionAdmin();

    render(
      <MemoryRouter initialEntries={["/productos"]}>
        <AdminPreviewBanner />
      </MemoryRouter>
    );
    expect(screen.getByText("MODO VISTA PREVIA")).toBeTruthy();
  });

  it("SÍ se renderiza al navegar a la página de inicio como admin en modo vista previa", () => {
    simularSesionAdmin();

    render(
      <MemoryRouter initialEntries={["/"]}>
        <AdminPreviewBanner />
      </MemoryRouter>
    );
    expect(screen.getByText("MODO VISTA PREVIA")).toBeTruthy();
    expect(screen.getByText(/Estás navegando en la tienda como cliente/i)).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TIPO 1 — Pruebas de Renderizado
// Verifican que el contenido del banner se muestra correctamente
// ─────────────────────────────────────────────────────────────────────────────
describe("Componente AdminPreviewBanner — Renderizado", () => {
  it("muestra el badge MODO VISTA PREVIA y el botón para volver al dashboard", () => {
    simularSesionAdmin();

    render(
      <MemoryRouter initialEntries={["/colecciones"]}>
        <AdminPreviewBanner />
      </MemoryRouter>
    );

    expect(screen.getByText("MODO VISTA PREVIA")).toBeTruthy();
    expect(screen.getByText(/Volver al Dashboard/i)).toBeTruthy();
  });

  it("el enlace 'Volver al Dashboard' apunta a /admin", () => {
    simularSesionAdmin();

    render(
      <MemoryRouter initialEntries={["/contacto"]}>
        <AdminPreviewBanner />
      </MemoryRouter>
    );

    // El enlace debe tener href="/admin" para que el admin regrese a su panel
    const enlace = screen.getByRole("link", { name: /Volver al Dashboard/i });
    expect(enlace.getAttribute("href")).toBe("/admin");
  });
});
