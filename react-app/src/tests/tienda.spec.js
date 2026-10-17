import { crearProducto, actualizarProducto, eliminarProducto, leerOrdenes, guardarOrdenes } from "../data/tienda.js";

describe("Persistencia local de la tienda", () => {
  const base = [{ id: 1, nombre: "Prueba", precio: 1000, stock: 2 }];

  afterEach(() => localStorage.clear());

  it("agrega un producto nuevo al catálogo", () => {
    const resultado = crearProducto(base, { id: 2, nombre: "Nuevo", precio: 2000, stock: 4 });
    expect(resultado.length).toBe(2);
    expect(resultado[1].nombre).toBe("Nuevo");
  });

  it("actualiza atributos de un producto sin modificar los demás", () => {
    const resultado = actualizarProducto(base, 1, { stock: 9 });
    expect(resultado[0].stock).toBe(9);
    expect(base[0].stock).toBe(2);
  });

  it("elimina el producto solicitado", () => {
    expect(eliminarProducto(base, 1).length).toBe(0);
  });

  it("guarda y recupera pedidos del almacenamiento local", () => {
    guardarOrdenes([{ id: "OFF-1", total: 12000 }]);
    expect(leerOrdenes()[0].id).toBe("OFF-1");
  });
});
