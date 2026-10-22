import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getStoredSession,
  getAccount,
  clearSession,
  formatBirthDate
} from "../utils/auth";
import AccountFooter from "../components/AccountFooter";
import { leerOrdenes } from "../data/tienda";
import "../styles/account.css";

function Cuenta() {
  const navigate = useNavigate();
  const session = getStoredSession();
  const account = getAccount();
  const ordenesUsuario = leerOrdenes().filter((orden) =>
    (orden.cuentaEmail || orden.cliente?.correo)?.toLowerCase() === account?.email?.toLowerCase()
  );

  const isAuthorized = Boolean(
    session && account && session.email === account.email
  );

  useEffect(() => {
    if (!isAuthorized) {
      navigate("/login");
    }
  }, [isAuthorized, navigate]);

  if (!isAuthorized) {
    return null;
  }

  const handleLogout = () => {
    clearSession();
    navigate("/");
  };

  return (
    <div className="account-page">
      <main className="account-shell">
        {/* HEADER DE CUENTA */}
        <header className="account-header">
          <div>
            <p className="account-eyebrow">
              SYSTEM_03 / ACCOUNT
            </p>

            <h1>
              MY
              <span>
                ARCHIVE
              </span>
            </h1>

            <p>
              Bienvenido/a,{" "}
              <strong id="welcomeName">
                {account.name || "Usuario"}
              </strong>.
            </p>
          </div>

          <button
            id="logoutButton"
            className="logout-button"
            type="button"
            onClick={handleLogout}
          >
            CERRAR SESIÓN
            <span>
              →
            </span>
          </button>
        </header>

        {/* DATOS DEL USUARIO */}
        <section className="account-card">
          <div className="account-card-header">
            <span>
              USER_DATA / 001
            </span>

            <span className="status">
              STATUS:
              <b>
                ACTIVE
              </b>
            </span>
          </div>

          <div className="account-grid">
            {/* CORREO */}
            <div className="account-field">
              <span>
                CORREO
              </span>

              <strong id="accountEmail">
                {account.email}
              </strong>
            </div>

            {/* FECHA DE NACIMIENTO */}
            <div className="account-field">
              <span>
                FECHA DE NACIMIENTO
              </span>

              <strong id="accountBirthDate">
                {formatBirthDate(account.birthDate)}
              </strong>
            </div>

            {/* REGIÓN */}
            <div className="account-field">
              <span>
                REGIÓN
              </span>

              <strong id="accountRegion">
                {account.region || "—"}
              </strong>
            </div>

            {/* COMUNA */}
            <div className="account-field">
              <span>
                COMUNA
              </span>

              <strong id="accountCommune">
                {account.commune || "—"}
              </strong>
            </div>

            {/* DIRECCIÓN */}
            <div className="account-field account-field-full">
              <span>
                DIRECCIÓN
              </span>

              <strong id="accountAddress">
                {account.address || "—"}
              </strong>
            </div>
          </div>
        </section>

        {/* HISTORIAL DE COMPRAS */}
        <section className="account-card purchase-card">
          <div className="account-card-header">
            <span>
              PURCHASE_HISTORY / 001
            </span>

            <span>
              ORDERS:
              <b id="purchaseCount">
                {ordenesUsuario.length}
              </b>
            </span>
          </div>

          <div
            id="purchaseHistory"
            className="purchase-history"
          >
            {ordenesUsuario.length === 0 ? (
              <div className="empty-history">
                <span className="empty-history-code">NO_ORDERS_FOUND</span>
                <h2>HISTORIAL VACÍO</h2>
                <p>Cuando realices una compra con este correo, tus pedidos aparecerán aquí.</p>
              </div>
            ) : ordenesUsuario.slice().reverse().map((orden) => (
              <article className="purchase-order" key={orden.id}>
                <div className="d-flex flex-wrap justify-content-between gap-2">
                  <strong>{orden.id}</strong>
                  <span className="badge text-bg-secondary">{orden.estado}</span>
                </div>
                <p className="mb-1">Fecha: {new Date(orden.fecha).toLocaleDateString("es-CL")}</p>
                <p className="mb-1">Productos: {orden.productos.reduce((total, producto) => total + producto.cantidad, 0)}</p>
                <strong>Total: ${Number(orden.total).toLocaleString("es-CL")}</strong>
              </article>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <AccountFooter />
      </main>
    </div>
  );
}

export default Cuenta;
