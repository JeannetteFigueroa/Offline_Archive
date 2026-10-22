import { calcularDescuento, obtenerPrecioFinal, tieneOferta } from "../utils/precios.js";

describe("Precios de ofertas web", () => {
  it("usa el precio de oferta cuando es menor que el precio normal", () => {
    const producto = { precio: 20000, precioOferta: 15000 };
    expect(obtenerPrecioFinal(producto)).toBe(15000);
    expect(tieneOferta(producto)).toBeTrue();
    expect(calcularDescuento(producto)).toBe(25);
  });

  it("mantiene el precio normal si no existe una oferta válida", () => {
    expect(obtenerPrecioFinal({ precio: 12000 })).toBe(12000);
    expect(obtenerPrecioFinal({ precio: 12000, precioOferta: 14000 })).toBe(12000);
    expect(tieneOferta({ precio: 12000, precioOferta: 14000 })).toBeFalse();
  });
});
