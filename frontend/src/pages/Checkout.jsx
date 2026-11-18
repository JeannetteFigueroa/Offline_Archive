import { useState } from "react";
import {
  Link,
  useNavigate
} from "react-router-dom";
import pedidoService from "../services/pedidoService";

import {
  isAllowedEmail,
  REGION_DATA,
  getAccount,
  getStoredSession
} from "../utils/auth";

import "../styles/checkout.css";
import { obtenerPrecioFinal } from "../utils/precios";

function Checkout({
  carrito,
  totalCarrito,
  vaciarCarrito,
  descontarStockCompra
}) {
  const navigate = useNavigate();

  // Datos ingresados por el cliente.
  const [formulario, setFormulario] = useState(() => {
    const account = getAccount();
    const session = getStoredSession();

    const usuarioActivo =
      account &&
      session &&
      account.email === session.email
        ? account
        : null;

    return {
      nombre: usuarioActivo
        ? `${usuarioActivo.name || ""} ${usuarioActivo.lastName || ""}`.trim()
        : "",

      correo: usuarioActivo?.email || "",
      telefono: usuarioActivo?.phone || "",
      region: usuarioActivo?.region || "",
      comuna: usuarioActivo?.commune || "",
      direccion: usuarioActivo?.address || "",

      // Nueva opción de entrega.
      tipoEntrega: "",
      tiendaRetiro: "",

      metodoPago: ""
    };
  });

  // Lista de sucursales autorizadas para retiro en tienda física
  const TIENDAS_RETIRO = [
    { id: "SCL_CENTRO", nombre: "Tienda Santiago Centro — Ahumada 341", comuna: "Santiago", stockDisponible: true },
    { id: "SCL_PROVIDENCIA", nombre: "Tienda Providencia — Av. Providencia 2124", comuna: "Providencia", stockDisponible: true },
    { id: "SCL_LASCONDES", nombre: "Tienda Las Condes — Parque Arauco Local 312", comuna: "Las Condes", stockDisponible: true },
    { id: "VALPO_VIÑA", nombre: "Tienda Viña del Mar — Mall Marina Oriente Nivel 2", comuna: "Viña del Mar", stockDisponible: false },
    { id: "BIO_CONCE", nombre: "Tienda Concepción — Barros Arana 650", comuna: "Concepción", stockDisponible: false }
  ];

  // Errores del formulario.
  const [errores, setErrores] = useState({});

  // El envío depende de la opción seleccionada.
  const costoEnvio =
    formulario.tipoEntrega === "domicilio"
      ? 3990
      : 0;

  const totalCompra =
    totalCarrito + costoEnvio;

  // Comunas correspondientes a la región seleccionada.
  const comunasDisponibles =
    REGION_DATA[formulario.region] || [];

  const manejarCambio = (event) => {
    const { name, value } = event.target;

    setFormulario((datosAnteriores) => ({
      ...datosAnteriores,

      [name]: value,

      // Si cambia la región,
      // se limpia la comuna seleccionada.
      ...(name === "region"
        ? { comuna: "" }
        : {})
    }));

    // Limpia el error del campo
    // cuando el usuario lo modifica.
    setErrores((erroresAnteriores) => ({
      ...erroresAnteriores,
      [name]: ""
    }));
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    const nombre =
      formulario.nombre.trim();

    const correo =
      formulario.correo.trim();

    const telefono =
      formulario.telefono.replace(/\s/g, "");

    const direccion =
      formulario.direccion.trim();

    // Validación nombre.
    if (!nombre) {
      nuevosErrores.nombre =
        "Ingresa el nombre del comprador.";
    } else if (nombre.length > 100) {
      nuevosErrores.nombre =
        "El nombre no puede superar los 100 caracteres.";
    }

    // Validación correo.
    if (!correo) {
      nuevosErrores.correo =
        "Ingresa un correo electrónico.";
    } else if (!isAllowedEmail(correo)) {
      nuevosErrores.correo =
        "Utiliza un correo @duoc.cl, @profesor.duoc.cl o @gmail.com.";
    }

    // Validación teléfono.
    if (!telefono) {
      nuevosErrores.telefono =
        "Ingresa un número de teléfono.";
    } else if (!/^9\d{8}$/.test(telefono)) {
      nuevosErrores.telefono =
        "Ingresa 9 dígitos. Ejemplo: 912345678.";
    }

    // Validación región.
    if (!formulario.region) {
      nuevosErrores.region =
        "Selecciona una región.";
    }

    // Validación comuna.
    if (!formulario.comuna) {
      nuevosErrores.comuna =
        "Selecciona una comuna.";
    }

    // Validación dirección.
    if (!direccion) {
      nuevosErrores.direccion =
        "Ingresa la dirección de entrega.";
    } else if (direccion.length > 300) {
      nuevosErrores.direccion =
        "La dirección no puede superar los 300 caracteres.";
    }

    // Validación tipo de entrega.
    if (!formulario.tipoEntrega) {
      nuevosErrores.tipoEntrega =
        "Selecciona una opción de entrega.";
    } else if (formulario.tipoEntrega === "retiro" && !formulario.tiendaRetiro) {
      nuevosErrores.tiendaRetiro =
        "Selecciona una tienda para retiro.";
    }

    // Validación método de pago.
    if (!formulario.metodoPago) {
      nuevosErrores.metodoPago =
        "Selecciona un método de pago.";
    }

    return nuevosErrores;
  };

  const finalizarCompra = async (event) => {
    event.preventDefault();

    const nuevosErrores =
      validarFormulario();

    if (
      Object.keys(nuevosErrores).length > 0
    ) {
      setErrores(nuevosErrores);
      return;
    }

    // Orden sencilla para simular una compra.
    const nuevaOrden = {
      id: `OFF-${Date.now()}`,

      fecha:
        new Date().toISOString(),

      cuentaEmail:
        getStoredSession()?.email || null,

      cliente: {
        nombre:
          formulario.nombre.trim(),

        correo:
          formulario.correo
            .trim()
            .toLowerCase(),

        telefono:
          formulario.telefono
            .replace(/\s/g, ""),

        region:
          formulario.region,

        comuna:
          formulario.comuna,

        direccion:
          formulario.direccion.trim()
      },

      metodoPago:
        formulario.metodoPago,

      // Guarda la opción escogida.
      tipoEntrega:
        formulario.tipoEntrega,

      productos:
        carrito,

      subtotal:
        totalCarrito,

      envio:
        costoEnvio,

      total:
        totalCompra,

      estado:
        "PAGADA"
    };

    // Guarda la nueva orden y actualiza estado sincrónico
    const ordenesGuardadas = JSON.parse(
      localStorage.getItem(
        "offlineArchiveOrders"
      ) || "[]"
    );

    localStorage.setItem(
      "offlineArchiveOrders",
      JSON.stringify([
        ...ordenesGuardadas,
        nuevaOrden
      ])
    );

    localStorage.setItem(
      "offlineArchiveLastOrder",
      JSON.stringify(nuevaOrden)
    );

    if (descontarStockCompra) {
      descontarStockCompra(carrito);
    }

    vaciarCarrito();

    // Sincronización asíncrona con el backend Spring Boot (sin bloquear la UI ni los tests)
    pedidoService.crearPedido({
      ...formulario,
      carrito
    }).catch(() => {
      // Si el backend está offline o en pruebas unitarias, se conserva en localStorage
    });

    navigate("/compra-exitosa");
  };

  // Evita mostrar el formulario
  // cuando no existen productos.
  if (carrito.length === 0) {
    return (
      <main className="checkout-page">
        <section className="checkout-empty">
          <p>
            ORDER_SYSTEM / EMPTY
          </p>

          <h1>
            NO HAY PRODUCTOS.
          </h1>

          <span>
            Agrega productos antes de continuar
            con la compra.
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
        <p>
          SECURE_ORDER_SYSTEM / 2003
        </p>

        <h1>
          FINALIZAR COMPRA.
        </h1>

        <span>
          Completa tus datos para realizar
          la compra simulada.
        </span>
      </header>

      <div className="checkout-layout">

        {/* FORMULARIO */}
        <section className="checkout-form-card">

          <div className="checkout-card-header">
            <span>
              DELIVERY_DATA / 001
            </span>

            <span>
              STATUS: ACTIVE
            </span>
          </div>

          <form
            className="checkout-form"
            noValidate
            onSubmit={finalizarCompra}
          >

            <div className="checkout-grid">

              {/* NOMBRE */}
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

              {/* CORREO */}
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

              {/* TELÉFONO */}
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

              {/* REGIÓN */}
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

              {/* COMUNA */}
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

                  {comunasDisponibles.map(
                    (comuna) => (
                      <option
                        key={comuna}
                        value={comuna}
                      >
                        {comuna}
                      </option>
                    )
                  )}

                </select>

                <small className="checkout-error">
                  {errores.comuna}
                </small>

              </div>

              {/* DIRECCIÓN */}
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

              {/* TIPO DE ENTREGA */}
              <div className="checkout-field checkout-field-full">

                <label htmlFor="checkoutDelivery">
                  TIPO DE ENTREGA
                </label>

                <select
                  id="checkoutDelivery"
                  name="tipoEntrega"
                  value={formulario.tipoEntrega}
                  onChange={manejarCambio}
                >

                  <option value="">
                    Selecciona una opción
                  </option>

                  <option value="domicilio">
                    Despacho a domicilio — $3.990
                  </option>

                  <option value="retiro">
                    Retiro en tienda — Gratis
                  </option>

                </select>

                <small className="checkout-error">
                  {errores.tipoEntrega}
                </small>

              </div>

              {/* SUCURSAL PARA RETIRO EN TIENDA */}
              {formulario.tipoEntrega === "retiro" && (
                <div className="checkout-field checkout-field-full">
                  <label htmlFor="checkoutTiendaRetiro">
                    SELECCIONA TIENDA PARA RETIRO
                  </label>

                  <select
                    id="checkoutTiendaRetiro"
                    name="tiendaRetiro"
                    value={formulario.tiendaRetiro}
                    onChange={manejarCambio}
                  >
                    <option value="">
                      Selecciona una sucursal física
                    </option>
                    {TIENDAS_RETIRO.map((tienda) => (
                      <option
                        key={tienda.id}
                        value={tienda.id}
                        disabled={!tienda.stockDisponible}
                      >
                        {tienda.nombre} {tienda.stockDisponible ? "(Disponible para hoy)" : "— (SIN STOCK PARA RETIRO, PIDE A DOMICILIO)"}
                      </option>
                    ))}
                  </select>

                  {formulario.tiendaRetiro && (
                    <small style={{ color: "#888", display: "block", marginTop: "4px" }}>
                      ✓ Retiro disponible en horario continuado de 10:00 a 20:00 hrs presentando tu cédula de identidad.
                    </small>
                  )}

                  <small className="checkout-error">
                    {errores.tiendaRetiro}
                  </small>
                </div>
              )}

              {/* MÉTODO DE PAGO */}
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

        {/* RESUMEN DE COMPRA */}
        <section className="checkout-form-card">

          <div className="checkout-card-header">
            <span>
              ORDER_SUMMARY / 002
            </span>

            <span>
              {carrito.length} ITEM(S)
            </span>
          </div>

          <div className="p-3">

            {carrito.map((producto) => (
              <div
                key={producto.id}
                className="d-flex justify-content-between gap-3 border-bottom py-3"
              >

                <div>
                  <strong>
                    {producto.nombre}
                  </strong>

                  <div>
                    Cantidad: {producto.cantidad}
                  </div>
                </div>

                <strong>
                  $
                  {(
                    obtenerPrecioFinal(producto) *
                    producto.cantidad
                  ).toLocaleString("es-CL")}
                </strong>

              </div>
            ))}

            <div className="d-flex justify-content-between mt-4">
              <span>
                SUBTOTAL
              </span>

              <strong>
                $
                {totalCarrito.toLocaleString("es-CL")}
              </strong>
            </div>

            <div className="d-flex justify-content-between mt-2">
              <span>
                ENTREGA
              </span>

              <strong>
                {formulario.tipoEntrega === "retiro"
                  ? "GRATIS"
                  : `$${costoEnvio.toLocaleString("es-CL")}`}
              </strong>
            </div>

            {formulario.tipoEntrega && (
              <div className="d-flex justify-content-between mt-2">
                <span>
                  MODALIDAD
                </span>

                <strong>
                  {formulario.tipoEntrega === "domicilio"
                    ? "DESPACHO A DOMICILIO"
                    : "RETIRO EN TIENDA"}
                </strong>
              </div>
            )}

            <hr />

            <div className="d-flex justify-content-between align-items-center">
              <strong>
                TOTAL
              </strong>

              <strong>
                $
                {totalCompra.toLocaleString("es-CL")}
              </strong>
            </div>

          </div>

        </section>

      </div>

    </main>
  );
}

export default Checkout;