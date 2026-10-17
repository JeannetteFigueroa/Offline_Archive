import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  hashPassword,
  isAllowedEmail,
  ACCOUNT_KEY,
  SESSION_KEY
} from "../utils/auth";
import AuthVisual from "../components/AuthVisual";
import PasswordInput from "../components/PasswordInput";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";
import AccountFooter from "../components/AccountFooter";
import "../styles/auth.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false
  });

  const [errors, setErrors] = useState({});
  const [formMessage, setFormMessage] = useState({ text: "", type: "" });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    const email = formData.email.trim();
    if (!email) {
      newErrors.email = "El correo es obligatorio.";
    } else if (email.length > 100) {
      newErrors.email = "El correo no puede superar los 100 caracteres.";
    } else if (!isAllowedEmail(email)) {
      newErrors.email = "Solo se permiten correos @duoc.cl, @profesor.duoc.cl y @gmail.com";
    }

    const password = formData.password;
    if (!password) {
      newErrors.password = "La contraseña es obligatoria.";
    } else if (password.length < 4 || password.length > 10) {
      newErrors.password = "La contraseña debe tener entre 4 y 10 caracteres.";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage({ text: "", type: "" });

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setFormMessage({
        text: "Revisa los campos marcados antes de continuar.",
        type: "error"
      });
      return;
    }

    setErrors({});

    const account = JSON.parse(
      localStorage.getItem(ACCOUNT_KEY) || "null"
    );

    if (!account) {
      setFormMessage({
        text: "No existe una cuenta registrada. Crea una cuenta primero.",
        type: "error"
      });
      return;
    }

    const passwordHash = await hashPassword(formData.password);
    const normalizedEmail = formData.email.trim().toLowerCase();

    if (
      account.email !== normalizedEmail ||
      account.passwordHash !== passwordHash
    ) {
      setFormMessage({
        text: "Correo o contraseña incorrectos.",
        type: "error"
      });
      return;
    }

    const session = {
      email: account.email,
      loggedAt: new Date().toISOString()
    };

    if (formData.remember) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }

    setFormMessage({
      text: "Inicio de sesión correcto. Entrando a tu cuenta...",
      type: "success"
    });

    setTimeout(() => {
      navigate("/cuenta");
    }, 700);
  };

  const handleForgotPassword = () => {
    setFormMessage({
      text: "Recuperación de contraseña disponible en una etapa posterior.",
      type: "success"
    });
  };

  return (
    <div className="auth-page">
      <main className="auth-shell">
        {/* Panel visual compartido por login y registro */}
        <AuthVisual
          systemCode="SYSTEM_01 / ACCESS"
          status="ONLINE"
          statusTag="ARCHIVE / 2003"
        >
          ESTO NO ES EL FUTURO.<br />
          ES EL <strong>ARCHIVO.</strong>
        </AuthVisual>

        {/* Formulario de inicio de sesión */}
        <section className="auth-form-panel">
          <div className="auth-header">
            <p className="eyebrow">
              SYSTEM_01 / LOGIN
            </p>

            <h2>
              WELCOME <span>BACK</span>
            </h2>

            <p>
              Inicia sesión para acceder al archivo.
            </p>
          </div>

          <form
            id="loginForm"
            className="auth-form"
            noValidate
            onSubmit={handleSubmit}
          >
            <div className={`field ${errors.email ? "is-invalid" : ""}`}>
              <label htmlFor="loginEmail">
                Correo electrónico
              </label>

              <input
                type="email"
                id="loginEmail"
                name="email"
                autoComplete="email"
                maxLength={100}
                placeholder="you@offline.com"
                aria-describedby="loginEmailHint loginEmailError"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <small
                id="loginEmailHint"
                className="field-hint"
              >
                Usa @duoc.cl, @profesor.duoc.cl o @gmail.com
              </small>

              <small
                id="loginEmailError"
                className="field-error"
                aria-live="polite"
              >
                {errors.email}
              </small>
            </div>

            <div className={`field ${errors.password ? "is-invalid" : ""}`}>
              <label htmlFor="loginPassword">
                Contraseña
              </label>

              <PasswordInput
                id="loginPassword"
                name="password"
                value={formData.password}
                onChange={handleChange}
                minLength={4}
                maxLength={10}
                required
              />

              <small
                id="loginPasswordHint"
                className="field-hint"
              >
                Entre 4 y 10 caracteres.
              </small>

              <small
                id="loginPasswordError"
                className="field-error"
                aria-live="polite"
              >
                {errors.password}
              </small>
            </div>

            <div className="form-options">
              <label className="check-control">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                />
                <span className="custom-check"></span>
                <span>Recordarme</span>
              </label>

              <button
                type="button"
                className="text-button"
                id="forgotPassword"
                onClick={handleForgotPassword}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <PrimaryButton>
              INICIAR SESIÓN
            </PrimaryButton>

            {formMessage.text && (
              <div
                id="loginMessage"
                className={`form-message ${formMessage.type}`}
                role="status"
                aria-live="polite"
              >
                {formMessage.text}
              </div>
            )}
          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <SecondaryButton to="/registro">
            CREAR CUENTA
          </SecondaryButton>

          <Link
            className="guest-link"
            to="/"
          >
            CONTINUAR COMO INVITADO
          </Link>

          <AccountFooter className="auth-footer" />
        </section>
      </main>
    </div>
  );
}

export default Login;
