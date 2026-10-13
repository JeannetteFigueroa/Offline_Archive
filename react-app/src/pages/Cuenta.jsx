import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getStoredSession,
  getAccount,
  clearSession,
  formatBirthDate
} from "../utils/auth";
import AccountFooter from "../components/AccountFooter";
import "../styles/account.css";

function Cuenta() {
  const navigate = useNavigate();
  const session = getStoredSession();
  const account = getAccount();

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
                0
              </b>
            </span>
          </div>

          <div
            id="purchaseHistory"
            className="purchase-history"
          >
            <div className="empty-history">
              <span className="empty-history-code">
                NO_ORDERS_FOUND
              </span>

              <h2>
                HISTORIAL VACÍO
              </h2>

              <p>
                Cuando realices una compra, tus pedidos aparecerán aquí para poder
                consultar su estado y detalle.
              </p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <AccountFooter />
      </main>
    </div>
  );
}

export default Cuenta;
