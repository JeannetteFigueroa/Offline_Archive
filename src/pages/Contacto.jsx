import { useState } from "react";
import { isAllowedEmail } from "../utils/auth";
import PrimaryButton from "../components/PrimaryButton";
import InstagramButton from "../components/InstagramButton";
import AccountFooter from "../components/AccountFooter";
import "../styles/account.css";
import "../styles/auth.css";

function Contacto() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const [errors, setErrors] = useState({});
  const [formStatus, setFormStatus] = useState({ text: "", type: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
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

    const name = formData.name.trim();
    if (name === "") {
      newErrors.name = "Ingresa tu nombre.";
    } else if (name.length > 100) {
      newErrors.name = "El nombre no debe exceder los 100 caracteres.";
    }

    const email = formData.email.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email === "") {
      newErrors.email = "Ingresa tu correo.";
    } else if (email.length > 100) {
      newErrors.email = "El correo no debe exceder los 100 caracteres.";
    } else if (!emailPattern.test(email)) {
      newErrors.email = "Ingresa un correo válido.";
    } else if (!isAllowedEmail(email)) {
      newErrors.email = "Solo se permiten correos @duoc.cl, @profesor.duoc.cl y @gmail.com";
    }

    const subject = formData.subject.trim();
    if (subject === "") {
      newErrors.subject = "Ingresa el motivo de tu mensaje.";
    } else if (subject.length > 100) {
      newErrors.subject = "El asunto no debe exceder los 100 caracteres.";
    }

    const message = formData.message.trim();
    if (message === "") {
      newErrors.message = "Escribe un mensaje.";
    } else if (message.length > 500) {
      newErrors.message = "El mensaje no debe exceder los 500 caracteres.";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setFormStatus({ text: "", type: "" });

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setFormStatus({
        text: "HAY ERRORES EN EL FORMULARIO. POR FAVOR, REVISA LOS CAMPOS MARCADOS.",
        type: "error"
      });
      return;
    }

    setErrors({});
    setFormStatus({
      text: "MENSAJE VALIDADO CORRECTAMENTE.",
      type: "success"
    });

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: ""
    });
  };

  return (
    <div className="account-page">
      <main className="account-content">
        <div className="account-shell">
          {/* HEADER */}
          <header className="account-header">
            <div>
              <p className="account-eyebrow">
                SYSTEM_04 / CONTACT
              </p>

              <h1>
                CON<span>TACT</span>
              </h1>

              <p>
                Ponte en contacto con{" "}
                <strong>
                  (Off)line Archive
                </strong>.
              </p>
            </div>
          </header>

          {/* FORMULARIO */}
          <section className="account-card">
            <div className="account-card-header">
              <span>
                CONTACT_FORM / 001
              </span>

              <span className="status">
                STATUS:{" "}
                <b>
                  ONLINE
                </b>
              </span>
            </div>

            <form
              id="contactForm"
              className="auth-form"
              noValidate
              onSubmit={handleSubmit}
            >
              <div className="contact-list">
                {/* NOMBRE */}
                <div className={`field ${errors.name ? "is-invalid" : ""}`}>
                  <label htmlFor="contactName">
                    NOMBRE
                  </label>

                  <input
                    type="text"
                    id="contactName"
                    name="name"
                    autoComplete="name"
                    maxLength={100}
                    placeholder="Tu nombre"
                    aria-describedby="nameError"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />

                  <small
                    id="nameError"
                    className="field-error"
                    aria-live="polite"
                  >
                    {errors.name}
                  </small>
                </div>

                {/* CORREO */}
                <div className={`field ${errors.email ? "is-invalid" : ""}`}>
                  <label htmlFor="contactEmail">
                    CORREO
                  </label>

                  <input
                    type="email"
                    id="contactEmail"
                    name="email"
                    autoComplete="email"
                    maxLength={100}
                    placeholder="tu@duoc.cl"
                    aria-describedby="contactEmailHint emailError"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />

                  <small
                    id="contactEmailHint"
                    className="field-hint"
                  >
                    Permitidos: @duoc.cl, @profesor.duoc.cl y @gmail.com
                  </small>

                  <small
                    id="emailError"
                    className="field-error"
                    aria-live="polite"
                  >
                    {errors.email}
                  </small>
                </div>

                {/* ASUNTO */}
                <div className={`field ${errors.subject ? "is-invalid" : ""}`}>
                  <label htmlFor="contactSubject">
                    ASUNTO
                  </label>

                  <input
                    type="text"
                    id="contactSubject"
                    name="subject"
                    maxLength={100}
                    placeholder="Motivo del contacto"
                    aria-describedby="subjectError"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />

                  <small
                    id="subjectError"
                    className="field-error"
                    aria-live="polite"
                  >
                    {errors.subject}
                  </small>
                </div>

                {/* MENSAJE */}
                <div className={`field ${errors.message ? "is-invalid" : ""}`}>
                  <label htmlFor="contactMessage">
                    MENSAJE
                  </label>

                  <textarea
                    id="contactMessage"
                    name="message"
                    rows={5}
                    maxLength={500}
                    placeholder="Escribe tu mensaje..."
                    aria-describedby="contactMessageHint messageError"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>

                  <small
                    id="contactMessageHint"
                    className="field-hint"
                  >
                    Máximo 500 caracteres.
                  </small>

                  <small
                    id="messageError"
                    className="field-error"
                    aria-live="polite"
                  >
                    {errors.message}
                  </small>
                </div>

                {/* BOTÓN */}
                <div className="field field-full">
                  <PrimaryButton>
                    ENVIAR MENSAJE
                  </PrimaryButton>

                  {formStatus.text && (
                    <p
                      id="formMessage"
                      className={`form-message ${formStatus.type}`}
                      role="status"
                      aria-live="polite"
                    >
                      {formStatus.text}
                    </p>
                  )}
                </div>
              </div>
            </form>
          </section>

          {/* INSTAGRAM */}
          <InstagramButton />

          {/* FOOTER */}
          <AccountFooter />
        </div>
      </main>
    </div>
  );
}

export default Contacto;
