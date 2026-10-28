/**
 * AdminStock.jsx
 *
 * Pestaña de Ingreso de Stock del panel de administración.
 * Permite seleccionar cualquier producto del catálogo y sumar unidades
 * directamente a su stock actual.
 */

import { useState } from "react";
import { actualizarProducto } from "../../data/tienda";

function AdminStock({ productos, setProductos, setMensaje }) {
  const [stockId, setStockId] = useState("");
  const [cantidadStock, setCantidadStock] = useState("");

  const actualizarStock = (e) => {
    e.preventDefault();
    const cantidad = Number(cantidadStock);

    if (!stockId || !Number.isInteger(cantidad) || cantidad <= 0) {
      setMensaje("Selecciona un producto e ingresa una cantidad entera mayor que cero.");
      return;
    }

    setProductos((actuales) =>
      actualizarProducto(actuales, Number(stockId), {
        stock:
          (actuales.find((p) => p.id === Number(stockId))?.stock || 0) + cantidad
      })
    );

    setCantidadStock("");
    setMensaje("Ingreso de stock registrado con éxito.");
  };

  return (
    <section className="admin-panel">
      <h2>Ingreso de stock</h2>
      <p className="text-secondary">
        El ingreso se suma al stock disponible del producto seleccionado.
      </p>

      <form className="row g-3 align-items-end" onSubmit={actualizarStock}>
        <div className="col-12 col-md-7">
          <label className="form-label">Producto</label>
          <select
            className="form-select"
            value={stockId}
            onChange={(e) => setStockId(e.target.value)}
            required
          >
            <option value="">Selecciona un producto</option>
            {productos.map((producto) => (
              <option key={producto.id} value={producto.id}>
                {producto.nombre} — stock actual: {producto.stock}
              </option>
            ))}
          </select>
        </div>

        <div className="col-12 col-md-3">
          <label className="form-label">Unidades recibidas</label>
          <input
            className="form-control"
            type="number"
            min="1"
            step="1"
            value={cantidadStock}
            onChange={(e) => setCantidadStock(e.target.value)}
            required
          />
        </div>

        <div className="col-12 col-md-2">
          <button className="btn btn-dark w-100" type="submit">
            Ingresar
          </button>
        </div>
      </form>
    </section>
  );
}

export default AdminStock;
