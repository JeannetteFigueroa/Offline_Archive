import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  hashPassword,
  isAllowedEmail,
  REGION_DATA,
  ACCOUNT_KEY,
  SESSION_KEY
} from "../utils/auth";
import AuthVisual from "../components/AuthVisual";
import PasswordInput from "../components/PasswordInput";
import PrimaryButton from "../components/PrimaryButton";
import SecondaryButton from "../components/SecondaryButton";
import AccountFooter from "../components/AccountFooter";
import "../styles/auth.css";

function Registro() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    password: "",
    passwordConfirm: "",
    birthDate: "",
    region: "",
    commune: "",
    address: "",
    terms: false
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

  const handleRegionChange = (e) => {
    const selectedRegion = e.target.value;
    setFormData((prev) => ({
      ...prev,
      region: selectedRegion,
      commune: ""
    }));

    setErrors((prev) => ({
      ...prev,
      region: selectedRegion ? "" : "Debes seleccionar una región.",
      commune: ""
    }));
  };

  const validate = () => {
    const newErrors = {};

    const name = formData.name.trim();
    if (!name) {
      newErrors.name = "El nombre es obligatorio.";
    } else if (name.length > 50) {
      newErrors.name = "El nombre no puede superar los 50 caracteres.";
    }

    const lastName = formData.lastName.trim();
    if (!lastName) {
      newErrors.lastName = "Los apellidos son obligatorios.";
    } else if (lastName.length > 100) {
      newErrors.lastName = "Los apellidos no pueden superar los 100 caracteres.";
    }

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

    const passwordConfirm = formData.passwordConfirm;
    if (!passwordConfirm) {
      newErrors.passwordConfirm = "La contraseña es obligatoria.";
    } else if (passwordConfirm.length < 4 || passwordConfirm.length > 10) {
      newErrors.passwordConfirm = "La contraseña debe tener entre 4 y 10 caracteres.";
    } else if (passwordConfirm !== password) {
      newErrors.passwordConfirm = "Las contraseñas no coinciden.";
    }

    if (!formData.region) {
      newErrors.region = "Debes seleccionar una región.";
    }

    if (!formData.commune) {
      newErrors.commune = "Debes seleccionar una comuna.";
    }

    const address = formData.address.trim();
    if (!address) {
      newErrors.address = "La dirección es obligatoria.";
    } else if (address.length > 300) {
      newErrors.address = "La dirección no puede superar los 300 caracteres.";
    }

    if (!formData.terms) {
      newErrors.terms = "Debes aceptar los términos y condiciones.";
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
        text: "El formulario contiene errores. Corrige los campos marcados.",
        type: "error"
      });
      return;
    }

    setErrors({});

    const normalizedEmail = formData.email.trim().toLowerCase();
    const existingAccount = JSON.parse(
      localStorage.getItem(ACCOUNT_KEY) || "null"
    );

    if (existingAccount?.email === normalizedEmail) {
      setFormMessage({
        text: "Ya existe una cuenta con ese correo.",
        type: "error"
      });
      return;
    }

    const passwordHash = await hashPassword(formData.password);

    const account = {
      name: formData.name.trim(),
      lastName: formData.lastName.trim(),
      email: normalizedEmail,
      passwordHash,
      birthDate: formData.birthDate || "",
      region: formData.region,
      commune: formData.commune,
      address: formData.address.trim(),
      createdAt: new Date().toISOString()
    };

    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));

    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        email: account.email,
        loggedAt: new Date().toISOString()
      })
    );

    setFormMessage({
      text: "Cuenta creada correctamente. Volviendo al archivo...",
      type: "success"
    });

    setTimeout(() => {
      navigate("/");
    }, 700);
  };

  return (
    <div className="auth-page register-page register-layout">
      <main className="auth-shell">
        {/* Panel visual compartido */}
        <AuthVisual
          systemCode="SYSTEM_02 / REGISTER"
          status="READY"
          statusTag="NEW_USER / 001"
        >
          CREA TU PERFIL.<br />
          DESBLOQUEA EL <strong>ARCHIVO.</strong>
        </AuthVisual>

        {/* Panel del formulario */}
        <section className="auth-form-panel">
          <div className="auth-header">
            <p className="eyebrow">
              SYSTEM_02 / ACCOUNT
            </p>

            <h2>
              JOIN THE <span>ARCHIVE</span>
            </h2>

            <p>
              Crea una cuenta para acceder a la tienda.
            </p>
          </div>

          <form
            id="registerForm"
            className="auth-form"
            noValidate
            onSubmit={handleSubmit}
          >
            <div className="form-grid">
              {/* Nombre */}
              <div className={`field ${errors.name ? "is-invalid" : ""}`}>
                <label htmlFor="registerName">
                  Nombre
                </label>

                <input
                  type="text"
                  id="registerName"
                  name="name"
                  autoComplete="given-name"
                  maxLength={50}
                  placeholder="Tu nombre"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

                <small
                  id="registerNameError"
                  className="field-error"
                  aria-live="polite"
                >
                  {errors.name}
                </small>
              </div>

              {/* Apellidos */}
              <div className={`field ${errors.lastName ? "is-invalid" : ""}`}>
                <label htmlFor="registerLastName">
                  Apellidos
                </label>

                <input
                  type="text"
                  id="registerLastName"
                  name="lastName"
                  autoComplete="family-name"
                  maxLength={100}
                  placeholder="Tus apellidos"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />

                <small
                  id="registerLastNameError"
                  className="field-error"
                  aria-live="polite"
                >
                  {errors.lastName}
                </small>
              </div>

              {/* Correo */}
              <div
                className={`field field-full ${
                  errors.email ? "is-invalid" : ""
                }`}
              >
                <label htmlFor="registerEmail">
                  Correo electrónico
                </label>

                <input
                  type="email"
                  id="registerEmail"
                  name="email"
                  autoComplete="email"
                  maxLength={100}
                  placeholder="you@gmail.com"
                  aria-describedby="registerEmailHint registerEmailError"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

                <small
                  id="registerEmailHint"
                  className="field-hint"
                >
                  Permitidos: @duoc.cl, @profesor.duoc.cl y @gmail.com.
                </small>

                <small
                  id="registerEmailError"
                  className="field-error"
                  aria-live="polite"
                >
                  {errors.email}
                </small>
              </div>

              {/* Contraseña */}
              <div className={`field ${errors.password ? "is-invalid" : ""}`}>
                <label htmlFor="registerPassword">
                  Contraseña
                </label>

                <PasswordInput
                  id="registerPassword"
                  name="password"
                  autoComplete="new-password"
                  placeholder="4 a 10 caracteres"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={4}
                  maxLength={10}
                  required
                />

                <small
                  id="registerPasswordError"
                  className="field-error"
                  aria-live="polite"
                >
                  {errors.password}
                </small>
              </div>

              {/* Confirmar contraseña */}
              <div
                className={`field ${
                  errors.passwordConfirm ? "is-invalid" : ""
                }`}
              >
                <label htmlFor="registerPasswordConfirm">
                  Confirmar contraseña
                </label>

                <PasswordInput
                  id="registerPasswordConfirm"
                  name="passwordConfirm"
                  autoComplete="new-password"
                  placeholder="Repite la contraseña"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  minLength={4}
                  maxLength={10}
                  required
                />

                <small
                  id="registerPasswordConfirmError"
                  className="field-error"
                  aria-live="polite"
                >
                  {errors.passwordConfirm}
                </small>
              </div>

              {/* Fecha de nacimiento */}
              <div className="field">
                <label htmlFor="birthDate">
                  Fecha de nacimiento{" "}
                  <span className="optional">(opcional)</span>
                </label>

                <input
                  type="date"
                  id="birthDate"
                  name="birthDate"
                  autoComplete="bday"
                  value={formData.birthDate}
                  onChange={handleChange}
                />
              </div>

              {/* Región */}
              <div className={`field ${errors.region ? "is-invalid" : ""}`}>
                <label htmlFor="region">
                  Región
                </label>

                <select
                  id="region"
                  name="region"
                  value={formData.region}
                  onChange={handleRegionChange}
                  required
                >
                  <option value="">
                    Selecciona una región
                  </option>
                  {Object.keys(REGION_DATA).map((regionName) => (
                    <option
                      key={regionName}
                      value={regionName}
                    >
                      {regionName}
                    </option>
                  ))}
                </select>

                <small
                  id="regionError"
                  className="field-error"
                  aria-live="polite"
                >
                  {errors.region}
                </small>
              </div>

              {/* Comuna */}
              <div className={`field ${errors.commune ? "is-invalid" : ""}`}>
                <label htmlFor="commune">
                  Comuna
                </label>

                <select
                  id="commune"
                  name="commune"
                  value={formData.commune}
                  onChange={handleChange}
                  disabled={!formData.region}
                  required
                >
                  <option value="">
                    {formData.region
                      ? "Selecciona una comuna"
                      : "Primero selecciona una región"}
                  </option>
                  {formData.region &&
                    REGION_DATA[formData.region]?.map((communeName) => (
                      <option
                        key={communeName}
                        value={communeName}
                      >
                        {communeName}
                      </option>
                    ))}
                </select>

                <small
                  id="communeError"
                  className="field-error"
                  aria-live="polite"
                >
                  {errors.commune}
                </small>
              </div>

              {/* Dirección */}
              <div
                className={`field field-full ${
                  errors.address ? "is-invalid" : ""
                }`}
              >
                <label htmlFor="address">
                  Dirección
                </label>

                <textarea
                  id="address"
                  name="address"
                  autoComplete="street-address"
                  maxLength={300}
                  placeholder="Ingresa tu dirección"
                  value={formData.address}
                  onChange={handleChange}
                  required
                ></textarea>

                <small
                  id="addressError"
                  className="field-error"
                  aria-live="polite"
                >
                  {errors.address}
                </small>
              </div>
            </div>

            {/* Términos y condiciones */}
            <label className="check-control terms-control">
              <input
                type="checkbox"
                id="terms"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
                required
              />
              <span className="custom-check"></span>
              <span>
                Acepto los términos y condiciones.
              </span>
            </label>

            <small
              id="termsError"
              className="field-error"
              aria-live="polite"
            >
              {errors.terms}
            </small>

            <PrimaryButton>
              CREAR CUENTA
            </PrimaryButton>

            {formMessage.text && (
              <div
                id="registerMessage"
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

          <SecondaryButton to="/login" arrow="left">
            VOLVER AL LOGIN
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

export default Registro;
