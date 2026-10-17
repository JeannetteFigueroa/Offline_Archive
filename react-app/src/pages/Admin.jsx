import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { crearProducto, actualizarProducto, eliminarProducto, leerOrdenes, guardarOrdenes } from "../data/tienda";
import "../styles/admin.css";

const money = (n) => `$${Number(n || 0).toLocaleString("es-CL")}`;
const initialForm = { codigo: "", nombre: "", categoria: "tops", categoriaLabel: "Tops", precio: "", stock: "", imagen: "/img/camisetaBabyTeeNegraStatic.png", descripcion: "" };

function Admin({ productos, setProductos }) {
  const location = useLocation();
  const [ordenes, setOrdenes] = useState(() => leerOrdenes());
  const [form, setForm] = useState(initialForm);
  const [mensaje, setMensaje] = useState("");
  const [stockId, setStockId] = useState("");
  const [cantidadStock, setCantidadStock] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const seccion = location.pathname.replace("/admin", "") || "/";

  const ventas = useMemo(() => {
    const map = {};
    ordenes.forEach((orden) => (orden.productos || []).forEach((p) => {
      map[p.nombre] = (map[p.nombre] || 0) + Number(p.cantidad || 0);
    }));
    return Object.entries(map).sort((a,b) => b[1] - a[1]).slice(0, 5);
  }, [ordenes]);
  const ventasTotales = ordenes.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const pedidosPendientes = ordenes.filter((o) => o.estado === "PAGADA" || o.estado === "PENDIENTE").length;
  const maxVentas = Math.max(1, ...ventas.map((v) => v[1]));
  const guardar = (e) => {
    e.preventDefault();
    if (!form.nombre.trim() || Number(form.precio) <= 0 || Number(form.stock) < 0) {
      setMensaje("Completa el nombre, un precio mayor a cero y un stock válido.");
      return;
    }
    const nuevo = { ...form, id: Date.now(), precio: Number(form.precio), stock: Number(form.stock) };
    setProductos((actuales) => crearProducto(actuales, nuevo));
    setForm(initialForm);
    setMensaje("Producto agregado correctamente.");
  };
  const actualizarStock = (e) => {
    e.preventDefault();
    const cantidad = Number(cantidadStock);
    if (!stockId || !Number.isInteger(cantidad) || cantidad <= 0) {
      setMensaje("Selecciona un producto e ingresa una cantidad entera mayor que cero.");
      return;
    }
    setProductos((actuales) => actualizarProducto(actuales, Number(stockId), {
      stock: (actuales.find((p) => p.id === Number(stockId))?.stock || 0) + cantidad
    }));
    setCantidadStock("");
    setMensaje("Ingreso de stock registrado.");
  };
  const cambiarEstado = (id, estado) => {
    const actualizadas = ordenes.map((o) => o.id === id ? { ...o, estado } : o);
    setOrdenes(actualizadas);
    guardarOrdenes(actualizadas);
    setMensaje(`Pedido ${id}: ${estado.toLowerCase()}.`);
  };
  const productosFiltrados = productos.filter((p) => `${p.nombre} ${p.codigo}`.toLowerCase().includes(busqueda.toLowerCase()));

  return <main className="admin-page container-fluid py-4 px-3 px-md-5">
    <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-end gap-3 mb-4">
      <div><p className="admin-eyebrow mb-2">OFF(LINE) ARCHIVE / CONTROL</p><h1 className="admin-title mb-1">PANEL ADMINISTRATIVO.</h1><p className="text-secondary mb-0">Gestión local de inventario, pedidos y estadísticas de la tienda.</p></div>
      <Link className="btn btn-outline-dark" to="/">Volver a la tienda ↗</Link>
    </div>
    <nav className="admin-nav nav nav-pills flex-wrap gap-2 mb-4">
      <Link className={`nav-link ${seccion === "/" ? "active" : ""}`} to="/admin">Dashboard</Link>
      <Link className={`nav-link ${seccion === "/inventario" ? "active" : ""}`} to="/admin/inventario">Inventario</Link>
      <Link className={`nav-link ${seccion === "/stock" ? "active" : ""}`} to="/admin/stock">Ingresar stock</Link>
      <Link className={`nav-link ${seccion === "/pedidos" ? "active" : ""}`} to="/admin/pedidos">Confirmar pedidos</Link>
      <Link className={`nav-link ${seccion === "/cuenta" ? "active" : ""}`} to="/admin/cuenta">Cuenta/ajustes</Link>
    </nav>
    {mensaje && <div className="alert alert-info alert-dismissible" role="status">{mensaje}<button className="btn-close" aria-label="Cerrar" onClick={() => setMensaje("")}/></div>}

    {seccion === "/" && <>
      <div className="row g-3 mb-4">
        {[["Productos registrados", productos.length], ["Pedidos registrados", ordenes.length], ["Pedidos por preparar", pedidosPendientes], ["Ventas simuladas", money(ventasTotales)]].map(([label, value]) => <div className="col-12 col-sm-6 col-xl-3" key={label}><div className="admin-stat h-100"><span>{label}</span><strong>{value}</strong></div></div>)}
      </div>
      <div className="row g-4">
        <div className="col-12 col-lg-7"><section className="admin-panel h-100"><div className="d-flex justify-content-between align-items-center mb-3"><h2>Productos más vendidos</h2><span className="badge text-bg-secondary">Por unidades</span></div>
          {ventas.length ? ventas.map(([nombre, cantidad]) => <div className="chart-row" key={nombre}><div className="d-flex justify-content-between gap-3"><span>{nombre}</span><strong>{cantidad}</strong></div><div className="progress mt-2"><div className="progress-bar" role="progressbar" style={{ width: `${cantidad / maxVentas * 100}%` }} aria-valuenow={cantidad} aria-valuemin="0" aria-valuemax={maxVentas}/></div></div>) : <p className="text-secondary">Todavía no hay ventas registradas. El gráfico se actualizará al realizar compras de prueba.</p>}
        </section></div>
        <div className="col-12 col-lg-5"><section className="admin-panel h-100"><h2>Temporadas de compra</h2><p className="text-secondary small">Conteo de pedidos por mes de compra.</p>
          {Object.entries(ordenes.reduce((acc, o) => { const d = new Date(o.fecha); const mes = Number.isNaN(d.getTime()) ? "Sin fecha" : d.toLocaleDateString("es-CL", { month: "long", year: "numeric" }); acc[mes] = (acc[mes] || 0) + 1; return acc; }, {})).map(([mes, cantidad]) => <div className="d-flex justify-content-between border-bottom py-2" key={mes}><span className="text-capitalize">{mes}</span><strong>{cantidad} pedido(s)</strong></div>)}
          {!ordenes.length && <p className="text-secondary">Aún no hay datos suficientes para identificar temporadas.</p>}
        </section></div>
      </div>
      <div className="admin-shortcuts mt-4"><Link to="/admin/inventario">＋ Administrar inventario</Link><Link to="/admin/stock">＋ Ingresar stock</Link><Link to="/admin/pedidos">✓ Revisar pedidos</Link></div>
    </>}

    {seccion === "/inventario" && <section className="admin-panel"><h2>Inventario de productos</h2><div className="row g-2 my-3"><div className="col-12 col-md-6"><input className="form-control" placeholder="Buscar por nombre o código" value={busqueda} onChange={e => setBusqueda(e.target.value)} aria-label="Buscar producto"/></div></div>
      <form className="row g-2 border rounded p-3 mb-4" onSubmit={guardar}><h3 className="h5">Agregar producto</h3>
        <div className="col-12 col-md-3"><label className="form-label">Código</label><input className="form-control" value={form.codigo} onChange={e => setForm({...form,codigo:e.target.value})} required/></div>
        <div className="col-12 col-md-5"><label className="form-label">Nombre</label><input className="form-control" value={form.nombre} onChange={e => setForm({...form,nombre:e.target.value})} required/></div>
        <div className="col-6 col-md-2"><label className="form-label">Precio CLP</label><input className="form-control" type="number" min="1" value={form.precio} onChange={e => setForm({...form,precio:e.target.value})} required/></div>
        <div className="col-6 col-md-2"><label className="form-label">Stock inicial</label><input className="form-control" type="number" min="0" value={form.stock} onChange={e => setForm({...form,stock:e.target.value})} required/></div>
        <div className="col-12 col-md-4"><label className="form-label">Categoría</label><select className="form-select" value={form.categoria} onChange={e => {const categoria=e.target.value; setForm({...form,categoria,categoriaLabel:categoria[0].toUpperCase()+categoria.slice(1)});}}><option value="tops">Tops</option><option value="bottoms">Bottoms</option><option value="accesorios">Accesorios</option><option value="outerwear">Outerwear</option></select></div>
        <div className="col-12 col-md-8"><label className="form-label">Descripción</label><input className="form-control" value={form.descripcion} onChange={e => setForm({...form,descripcion:e.target.value})}/></div>
        <div className="col-12"><button className="btn btn-dark" type="submit">Guardar producto</button></div>
      </form>
      <div className="table-responsive"><table className="table table-hover align-middle"><thead><tr><th>Código</th><th>Producto</th><th>Precio</th><th>Stock</th><th>Acción</th></tr></thead><tbody>{productosFiltrados.map(p => <tr key={p.id}><td>{p.codigo}</td><td>{p.nombre}</td><td>{money(p.precio)}</td><td><span className={`badge ${p.stock <= 3 ? "text-bg-danger" : "text-bg-success"}`}>{p.stock}</span></td><td><button className="btn btn-sm btn-outline-danger" onClick={() => {setProductos(actuales => eliminarProducto(actuales,p.id)); setMensaje("Producto eliminado del catálogo.");}}>Eliminar</button></td></tr>)}</tbody></table></div>
    </section>}

    {seccion === "/stock" && <section className="admin-panel"><h2>Ingreso de stock</h2><p className="text-secondary">El ingreso se suma al stock disponible del producto seleccionado.</p><form className="row g-3 align-items-end" onSubmit={actualizarStock}><div className="col-12 col-md-7"><label className="form-label">Producto</label><select className="form-select" value={stockId} onChange={e => setStockId(e.target.value)} required><option value="">Selecciona un producto</option>{productos.map(p => <option key={p.id} value={p.id}>{p.nombre} — stock actual: {p.stock}</option>)}</select></div><div className="col-12 col-md-3"><label className="form-label">Unidades recibidas</label><input className="form-control" type="number" min="1" step="1" value={cantidadStock} onChange={e => setCantidadStock(e.target.value)} required/></div><div className="col-12 col-md-2"><button className="btn btn-dark w-100">Ingresar</button></div></form></section>}

    {seccion === "/pedidos" && <section className="admin-panel"><h2>Confirmación y preparación de pedidos</h2>{ordenes.length ? <div className="table-responsive"><table className="table align-middle"><thead><tr><th>Pedido</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{ordenes.map(o => <tr key={o.id}><td>{o.id}</td><td>{o.cliente?.nombre}<br/><small>{o.cliente?.correo}</small></td><td>{new Date(o.fecha).toLocaleDateString("es-CL")}</td><td>{money(o.total)}</td><td><span className="badge text-bg-secondary">{o.estado}</span></td><td><div className="d-flex flex-wrap gap-1"><button className="btn btn-sm btn-outline-primary" onClick={() => cambiarEstado(o.id,"CONFIRMADO")}>Aceptar</button><button className="btn btn-sm btn-outline-success" onClick={() => cambiarEstado(o.id,"PREPARADO")}>Preparado</button><button className="btn btn-sm btn-outline-danger" onClick={() => cambiarEstado(o.id,"CANCELADO")}>Cancelar</button></div></td></tr>)}</tbody></table></div> : <p className="text-secondary">No hay pedidos registrados todavía. Realiza una compra de prueba para verla aquí.</p>}</section>}

    {seccion === "/cuenta" && <section className="admin-panel"><h2>Cuenta y ajustes</h2><p>Esta versión corresponde a una demostración frontend offline. Los cambios se guardan en el almacenamiento local de este navegador.</p><p><strong>Productos:</strong> {productos.length} registrados</p><p><strong>Pedidos:</strong> {ordenes.length} registrados</p><button className="btn btn-outline-danger" onClick={() => { if (window.confirm("¿Borrar el historial local de pedidos?")) {setOrdenes([]); guardarOrdenes([]); setMensaje("Historial local eliminado.");} }}>Limpiar historial de pedidos</button></section>}
  </main>;
}
export default Admin;
