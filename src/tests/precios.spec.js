import { calcularDescuento, obtenerPrecioFinal, tieneOferta, DESCUENTO_MINIMO_OFERTA } from "../utils/precios.js";

describe("Precios de ofertas web", () => {
  it("usa el precio de oferta cuando es menor que el precio normal y el descuento es >= 5%", () => {
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

  it("no considera oferta una rebaja menor al 5% (regla del 5% mínimo)", () => {
    // Si baja sólo 10 pesos de 25.000 a 24.990 (descuento 0.04% < 5%)
    const productoRebajaMinima = { precio: 25000, precioOferta: 24990 };
    expect(tieneOferta(productoRebajaMinima)).toBeFalse();
    expect(obtenerPrecioFinal(productoRebajaMinima)).toBe(25000);
    expect(calcularDescuento(productoRebajaMinima)).toBe(0);

    // Rebaja del 2% tampoco califica
    const productoRebaja2Porciento = { precio: 10000, precioOferta: 9800 };
    expect(tieneOferta(productoRebaja2Porciento)).toBeFalse();
    expect(obtenerPrecioFinal(productoRebaja2Porciento)).toBe(10000);
    expect(calcularDescuento(productoRebaja2Porciento)).toBe(0);
  });

  it("aplica la oferta cuando la rebaja alcanza exactamente el 5% o más", () => {
    // 5% exacto de 20.000 es 19.000
    const producto5Porciento = { precio: 20000, precioOferta: 19000 };
    expect(tieneOferta(producto5Porciento)).toBeTrue();
    expect(obtenerPrecioFinal(producto5Porciento)).toBe(19000);
    expect(calcularDescuento(producto5Porciento)).toBe(5);
  });
});
