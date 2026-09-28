function Navbar({ nombreTienda, cantidadCarrito }) {
  return (
    <nav>
      <h2>{nombreTienda}</h2>

      <ul>
        <li>Inicio</li>
        <li>Productos</li>
        <li>Colecciones</li>
        <li>Contacto</li>
        <li>Carrito ({cantidadCarrito})</li>
      </ul>
    </nav>
  );
}

export default Navbar;