import { useState } from "react";
import {
  Link,
  useNavigate
} from "react-router-dom";

import {
  isAllowedEmail,
  REGION_DATA
} from "../utils/auth";

import "../styles/checkout.css";

function Checkout({
  carrito,
  totalCarrito,
  vaciarCarrito
}) {
  const navigate = useNavigate();

  // El envío tendrá un valor fijo para esta simulación.
  const costoEnvio = 3990;
  const totalCompra = totalCarrito + costoEnvio;

  // Datos ingresados por el cliente.
  const [formulario, setFormulario] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    region: "",
    comuna: "",
    direccion: "",
    metodoPago: ""
  });

  // Aquí se guardan los errores de cada campo.
  const [errores, setErrores] = useState({});

  // Comunas correspondientes a la región seleccionada.
  const comunasDisponibles =
    REGION_DATA[formulario.region] || [];

  const manejarCambio = (event) => {
    const { name, value } = event.target;

    setFormulario((datosAnteriores) => ({
      ...datosAnteriores,
      [name]: value,

      // Si cambia la región, se limpia la comuna.
      ...(name === "region"
        ? { comuna: "" }
        : {})
    }));

    // Limpia el error del campo cuando el usuario escribe.
    setErrores((erroresAnteriores) => ({
      ...erroresAnteriores,
      [name]: ""
    }));
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    const nombre = formulario.nombre.trim();
    const correo = formulario.correo.trim();
    const telefono = formulario.telefono
      .replace(/\s/g, "");
    const direccion = formulario.direccion.trim();

    if (!nombre) {
      nuevosErrores.nombre =
        "Ingresa el nombre del comprador.";
    } else if (nombre.length > 100) {
      nuevosErrores.nombre =
        "El nombre no puede superar los 100 caracteres.";
    }

    if (!correo) {
      nuevosErrores.correo =
        "Ingresa un correo electrónico.";
    } else if (!isAllowedEmail(correo)) {
      nuevosErrores.correo =
        "Utiliza un correo @duoc.cl, @profesor.duoc.cl o @gmail.com.";
    }

    if (!telefono) {
      nuevosErrores.telefono =
        "Ingresa un número de teléfono.";
    } else if (!/^9\d{8}$/.test(telefono)) {
      nuevosErrores.telefono =
        "Ingresa 9 dígitos. Ejemplo: 912345678.";
    }

    if (!formulario.region) {
      nuevosErrores.region =
        "Selecciona una región.";
    }

    if (!formulario.comuna) {
      nuevosErrores.comuna =
        "Selecciona una comuna.";
    }

    if (!direccion) {
      nuevosErrores.direccion =
        "Ingresa la dirección de entrega.";
    } else if (direccion.length > 300) {
      nuevosErrores.direccion =
        "La dirección no puede superar los 300 caracteres.";
    }

    if (!formulario.metodoPago) {
      nuevosErrores.metodoPago =
        "Selecciona un método de pago.";
    }

    return nuevosErrores;
  };

  const finalizarCompra = (event) => {
    event.preventDefault();

    const nuevosErrores = validarFormulario();

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    // orden sencilla para simular una compra
    const nuevaOrden = {
      id: `OFF-${Date.now()}`,
      fecha: new Date().toISOString(),
      cliente: {
        nombre: formulario.nombre.trim(),
        correo: formulario.correo
          .trim()
          .toLowerCase(),
        telefono: formulario.telefono
          .replace(/\s/g, ""),
        region: formulario.region,
        comuna: formulario.comuna,
        direccion: formulario.direccion.trim()
      },
      metodoPago: formulario.metodoPago,
      productos: carrito,
      subtotal: totalCarrito,
      envio: costoEnvio,
      total: totalCompra,
      estado: "PAGADA"
    };

    // aqui se recuperan las ordenes anteriores.
    const ordenesGuardadas = JSON.parse(
      localStorage.getItem("offlineArchiveOrders") ||
        "[]"
    );

    // aqui se guarda la nueva orden en el historial.
    localStorage.setItem(
      "offlineArchiveOrders",
      JSON.stringify([
        ...ordenesGuardadas,
        nuevaOrden
      ])
    );

    // se guarda la última orden para mostrarla
    // en la pagina de compra exitosa
    localStorage.setItem(
      "offlineArchiveLastOrder",
      JSON.stringify(nuevaOrden)
    );

    // Despues de comprar se vacia el carrito
    vaciarCarrito();

    navigate("/compra-exitosa");
  };

  // Evita mostrar el formulario si no hay productos
  if (carrito.length === 0) {
    return (
      <main className="checkout-page">
        <section className="checkout-empty">
          <p>ORDER_SYSTEM / EMPTY</p>

          <h1>NO HAY PRODUCTOS.</h1>

          <span>
            Agrega productos antes de continuar con la compra.
          </span>

          <Link to="/productos">
            VER PRODUCTOS →
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <header className="checkout-header">
        <p>SECURE_ORDER_SYSTEM / 2003</p>

        <h1>FINALIZAR COMPRA.</h1>

        <span>
          Completa tus datos para realizar la compra simulada.
        </span>
      </header>

      <div className="checkout-layout">
        <section className="checkout-form-card">
          <div className="checkout-card-header">
            <span>DELIVERY_DATA / 001</span>
            <span>STATUS: ACTIVE</span>
          </div>

          <form
            className="checkout-form"
            noValidate
            onSubmit={finalizarCompra}
          >
            <div className="checkout-grid">
              <div className="checkout-field checkout-field-full">
                <label htmlFor="checkoutName">
                  NOMBRE COMPLETO
                </label>

                <input
                  type="text"
                  id="checkoutName"
                  name="nombre"
                  maxLength={100}
                  autoComplete="name"
                  value={formulario.nombre}
                  onChange={manejarCambio}
                />

                <small className="checkout-error">
                  {errores.nombre}
                </small>
              </div>

              <div className="checkout-field">
                <label htmlFor="checkoutEmail">
                  CORREO
                </label>

                <input
                  type="email"
                  id="checkoutEmail"
                  name="correo"
                  maxLength={100}
                  autoComplete="email"
                  placeholder="tu@duoc.cl"
                  value={formulario.correo}
                  onChange={manejarCambio}
                />

                <small className="checkout-error">
                  {errores.correo}
                </small>
              </div>

              <div className="checkout-field">
                <label htmlFor="checkoutPhone">
                  TELÉFONO
                </label>

                <input
                  type="tel"
                  id="checkoutPhone"
                  name="telefono"
                  maxLength={9}
                  autoComplete="tel"
                  placeholder="912345678"
                  value={formulario.telefono}
                  onChange={manejarCambio}
                />

                <small className="checkout-error">
                  {errores.telefono}
                </small>
              </div>

              <div className="checkout-field">
                <label htmlFor="checkoutRegion">
                  REGIÓN
                </label>

                <select
                  id="checkoutRegion"
                  name="region"
                  value={formulario.region}
                  onChange={manejarCambio}
                >
                  <option value="">
                    Selecciona una región
                  </option>

                  {Object.keys(REGION_DATA).map(
                    (region) => (
                      <option
                        key={region}
                        value={region}
                      >
                        {region}
                      </option>
                    )
                  )}
                </select>

                <small className="checkout-error">
                  {errores.region}
                </small>
              </div>

              <div className="checkout-field">
                <label htmlFor="checkoutCommune">
                  COMUNA
                </label>

                <select
                  id="checkoutCommune"
                  name="comuna"
                  value={formulario.comuna}
                  onChange={manejarCambio}
                  disabled={!formulario.region}
                >
                  <option value="">
                    Selecciona una comuna
                  </option>

                  {comunasDisponibles.map((comuna) => (
                    <option
                      key={comuna}
                      value={comuna}
                    >
                      {comuna}
                    </option>
                  ))}
                </select>

                <small className="checkout-error">
                  {errores.comuna}
                </small>
              </div>

              <div className="checkout-field checkout-field-full">
                <label htmlFor="checkoutAddress">
                  DIRECCIÓN
                </label>

                <input
                  type="text"
                  id="checkoutAddress"
                  name="direccion"
                  maxLength={300}
                  autoComplete="street-address"
                  placeholder="Calle, número y departamento"
                  value={formulario.direccion}
                  onChange={manejarCambio}
                />

                <small className="checkout-error">
                  {errores.direccion}
                </small>
              </div>

              <div className="checkout-field checkout-field-full">
                <label htmlFor="checkoutPayment">
                  MÉTODO DE PAGO
                </label>

                <select
                  id="checkoutPayment"
                  name="metodoPago"
                  value={formulario.metodoPago}
                  onChange={manejarCambio}
                >
                  <option value="">
                    Selecciona un método
                  </option>

                  <option value="Débito">
                    Tarjeta de débito
                  </option>

                  <option value="Crédito">
                    Tarjeta de crédito
                  </option>

                  <option value="Transferencia">
                    Transferencia bancaria
                  </option>
                </select>

                <small className="checkout-error">
                  {errores.metodoPago}
                </small>
              </div>
            </div>

            <button
              type="submit"
              className="checkout-submit"
            >
              CONFIRMAR COMPRA
              <span>→</span>
            </button>

            <button
              type="button"
              className="checkout-reject"
              onClick={() =>
                navigate("/pago-rechazado")
              }
            >
              PAGO RECHAZADO
            </button>

            <Link
              to="/carrito"
              className="checkout-back"
            >
              ← VOLVER AL CARRITO
            </Link>
          </form>
        </section>

        <aside className="checkout-summary">
          <p className="checkout-summary-code">
            ORDER_SUMMARY / 002
          </p>

          <h2>RESUMEN</h2>

          <div className="checkout-summary-list">
            {carrito.map((producto) => (
              <div
                className="checkout-summary-product"
                key={producto.id}
              >
                <span>
                  {producto.nombre} x
                  {producto.cantidad}
                </span>

                <strong>
                  $
                  {(
                    producto.precio *
                    producto.cantidad
                  ).toLocaleString("es-CL")}
                </strong>
              </div>
            ))}
          </div>

          <div className="checkout-row">
            <span>Subtotal</span>

            <strong>
              ${totalCarrito.toLocaleString("es-CL")}
            </strong>
          </div>

          <div className="checkout-row">
            <span>Envío</span>

            <strong>
              ${costoEnvio.toLocaleString("es-CL")}
            </strong>
          </div>

          <div className="checkout-row checkout-total">
            <span>TOTAL</span>

            <strong>
              ${totalCompra.toLocaleString("es-CL")}
            </strong>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default Checkout;