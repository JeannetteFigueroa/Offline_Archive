/* =========================================================
   AUTH.JS
   Validaciones y comportamiento compartido por LOGIN y REGISTRO.
   ========================================================= */

/* ---------- 1. Reglas generales del formulario ---------- */

// Dominios permitidos por la pauta de la evaluación.
const ALLOWED_EMAIL_DOMAINS = [
  "@gmail.com",
  "@hotmail.com",
  "@yahoo.com",
  "@outlook.com",
];

// Regiones y comunas: el requisito indica trabajar las regiones
// desde un arreglo JavaScript y actualizar las comunas al cambiar región.
const REGION_DATA = {
  "Arica y Parinacota": ["Arica", "Putre", "Camarones"],
  Tarapacá: ["Iquique", "Alto Hospicio", "Pozo Almonte"],
  Antofagasta: ["Antofagasta", "Calama", "Tocopilla"],
  Atacama: ["Copiapó", "Caldera", "Vallenar"],
  Coquimbo: ["La Serena", "Coquimbo", "Ovalle"],
  Valparaíso: ["Valparaíso", "Viña del Mar", "Quilpué"],
  "Metropolitana de Santiago": ["Santiago", "Maipú", "Puente Alto"],
  "O'Higgins": ["Rancagua", "Machalí", "San Fernando"],
  Maule: ["Talca", "Curicó", "Linares"],
  Ñuble: ["Chillán", "San Carlos", "Bulnes"],
  Biobío: ["Concepción", "Talcahuano", "Los Ángeles"],
  "La Araucanía": ["Temuco", "Angol", "Villarrica"],
  "Los Ríos": ["Valdivia", "La Unión", "Panguipulli"],
  "Los Lagos": ["Puerto Montt", "Osorno", "Castro"],
  Aysén: ["Coyhaique", "Aysén", "Chile Chico"],
  "Magallanes y de la Antártica Chilena": [
    "Punta Arenas",
    "Puerto Natales",
    "Porvenir",
  ],
};

/* ---------- 2. Funciones reutilizables de validación ---------- */

// Valida que el correo termine en uno de los dominios autorizados.
function isAllowedEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return false;
  }

  return ALLOWED_EMAIL_DOMAINS.some((domain) =>
    normalizedEmail.endsWith(domain),
  );
}

// Valida RUT sin puntos ni guion.
// Ejemplo válido: 19011022K
function isValidRut(rut) {
  const normalizedRut = rut.trim().toUpperCase();

  if (!/^[0-9]{7,8}[0-9K]$/.test(normalizedRut)) {
    return false;
  }

  const body = normalizedRut.slice(0, -1);
  const verifier = normalizedRut.slice(-1);

  let multiplier = 2;
  let sum = 0;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = 11 - (sum % 11);
  const expectedVerifier =
    remainder === 11 ? "0" : remainder === 10 ? "K" : String(remainder);

  return verifier === expectedVerifier;
}

// Muestra un mensaje debajo de un campo y cambia su estado visual.
function setFieldState(fieldId, errorId, isValid, message = "") {
  const field = document.getElementById(fieldId);
  const errorElement = document.getElementById(errorId);

  if (!field || !errorElement) return isValid;

  const wrapper = field.closest(".field") || field.parentElement;
  wrapper.classList.toggle("is-valid", isValid);
  wrapper.classList.toggle("is-invalid", !isValid);

  errorElement.textContent = isValid ? "" : message;

  field.setAttribute("aria-invalid", String(!isValid));
  return isValid;
}

// Valida nombre/apellidos con una regla sencilla de campos obligatorios.
function validateRequiredText(fieldId, errorId, label, maxLength) {
  const field = document.getElementById(fieldId);
  const value = field.value.trim();

  if (!value) {
    return setFieldState(fieldId, errorId, false, `${label} es obligatorio.`);
  }

  if (value.length > maxLength) {
    return setFieldState(
      fieldId,
      errorId,
      false,
      `${label} no puede superar los ${maxLength} caracteres.`,
    );
  }

  return setFieldState(fieldId, errorId, true);
}

// Valida el correo según la pauta.
function validateEmailField(fieldId, errorId) {
  const field = document.getElementById(fieldId);
  const value = field.value.trim();

  if (!value) {
    return setFieldState(fieldId, errorId, false, "El correo es obligatorio.");
  }

  if (value.length > 100) {
    return setFieldState(
      fieldId,
      errorId,
      false,
      "El correo no puede superar los 100 caracteres.",
    );
  }

  if (!isAllowedEmail(value)) {
    return setFieldState(
      fieldId,
      errorId,
      false,
      "Solo se permiten correos @gmail.com, @hotmail.com, @yahoo.com, @outlook.com",
    );
  }

  return setFieldState(fieldId, errorId, true);
}

// Valida contraseña según la pauta: requerida y de 4 a 10 caracteres.
function validatePasswordField(fieldId, errorId) {
  const field = document.getElementById(fieldId);
  const value = field.value;

  if (!value) {
    return setFieldState(
      fieldId,
      errorId,
      false,
      "La contraseña es obligatoria.",
    );
  }

  if (value.length < 4 || value.length > 10) {
    return setFieldState(
      fieldId,
      errorId,
      false,
      "La contraseña debe tener entre 4 y 10 caracteres.",
    );
  }

  return setFieldState(fieldId, errorId, true);
}

/* ---------- 3. Mostrar / ocultar contraseñas ---------- */

document.querySelectorAll("[data-password-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const inputId = button.dataset.passwordToggle;
    const input = document.getElementById(inputId);

    if (!input) return;

    const showing = input.type === "text";
    input.type = showing ? "password" : "text";
    button.textContent = showing ? "+" : "−";
    button.setAttribute(
      "aria-label",
      showing ? "Mostrar contraseña" : "Ocultar contraseña",
    );
  });
});

/* ---------- 4. LOGIN ---------- */

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  const email = document.getElementById("loginEmail");
  const password = document.getElementById("loginPassword");
  const message = document.getElementById("loginMessage");

  const validateLogin = () => {
    const emailValid = validateEmailField("loginEmail", "loginEmailError");
    const passwordValid = validatePasswordField(
      "loginPassword",
      "loginPasswordError",
    );

    return emailValid && passwordValid;
  };

  // Validación en tiempo real.
  email.addEventListener("input", () => {
    validateEmailField("loginEmail", "loginEmailError");
  });

  email.addEventListener("blur", () => {
    validateEmailField("loginEmail", "loginEmailError");
  });

  password.addEventListener("input", () => {
    validatePasswordField("loginPassword", "loginPasswordError");
  });

  password.addEventListener("blur", () => {
    validatePasswordField("loginPassword", "loginPasswordError");
  });

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    message.textContent = "";
    message.className = "form-message";

    if (!validateLogin()) {
      message.textContent = "Revisa los campos marcados antes de continuar.";
      message.classList.add("error");
      return;
    }

    // En esta etapa no existe backend. Se simula un login exitoso.
    message.textContent =
      "Datos válidos. Inicio de sesión preparado para conectar con el backend.";
    message.classList.add("success");
  });
}

/* ---------- 5. REGISTRO ---------- */

const registerForm = document.getElementById("registerForm");

if (registerForm) {
  const rut = document.getElementById("registerRut");
  const name = document.getElementById("registerName");
  const lastName = document.getElementById("registerLastName");
  const email = document.getElementById("registerEmail");
  const password = document.getElementById("registerPassword");
  const passwordConfirm = document.getElementById("registerPasswordConfirm");
  const region = document.getElementById("region");
  const commune = document.getElementById("commune");
  const address = document.getElementById("address");
  const terms = document.getElementById("terms");
  const message = document.getElementById("registerMessage");

  // Carga las regiones del arreglo JavaScript.
  Object.keys(REGION_DATA).forEach((regionName) => {
    const option = document.createElement("option");
    option.value = regionName;
    option.textContent = regionName;
    region.appendChild(option);
  });

  // Cambia dinámicamente las comunas según la región seleccionada.
  region.addEventListener("change", () => {
    const selectedRegion = region.value;

    commune.innerHTML = "";

    if (!selectedRegion) {
      commune.disabled = true;
      commune.innerHTML =
        '<option value="">Primero selecciona una región</option>';
      return;
    }

    commune.disabled = false;

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Selecciona una comuna";
    commune.appendChild(placeholder);

    REGION_DATA[selectedRegion].forEach((communeName) => {
      const option = document.createElement("option");
      option.value = communeName;
      option.textContent = communeName;
      commune.appendChild(option);
    });
  });

  // Validación individual del RUT.
  const validateRutField = () => {
    const value = rut.value.trim().toUpperCase();

    if (!value) {
      return setFieldState(
        "registerRut",
        "registerRutError",
        false,
        "El RUT es obligatorio.",
      );
    }

    if (value.includes(".") || value.includes("-")) {
      return setFieldState(
        "registerRut",
        "registerRutError",
        false,
        "El RUT debe ingresarse sin puntos ni guion.",
      );
    }

    if (value.length < 7 || value.length > 9) {
      return setFieldState(
        "registerRut",
        "registerRutError",
        false,
        "El RUT debe tener entre 7 y 9 caracteres.",
      );
    }

    if (!isValidRut(value)) {
      return setFieldState(
        "registerRut",
        "registerRutError",
        false,
        "El RUT ingresado no es válido.",
      );
    }

    rut.value = value;
    return setFieldState("registerRut", "registerRutError", true);
  };

  const validateConfirmPassword = () => {
    const validLength = validatePasswordField(
      "registerPasswordConfirm",
      "registerPasswordConfirmError",
    );

    if (!validLength) return false;

    if (passwordConfirm.value !== password.value) {
      return setFieldState(
        "registerPasswordConfirm",
        "registerPasswordConfirmError",
        false,
        "Las contraseñas no coinciden.",
      );
    }

    return setFieldState(
      "registerPasswordConfirm",
      "registerPasswordConfirmError",
      true,
    );
  };

  // Validaciones en tiempo real.
  rut.addEventListener("input", validateRutField);
  rut.addEventListener("blur", validateRutField);

  name.addEventListener("input", () => {
    validateRequiredText("registerName", "registerNameError", "El nombre", 50);
  });

  lastName.addEventListener("input", () => {
    validateRequiredText(
      "registerLastName",
      "registerLastNameError",
      "Los apellidos",
      100,
    );
  });

  email.addEventListener("input", () => {
    validateEmailField("registerEmail", "registerEmailError");
  });

  password.addEventListener("input", () => {
    validatePasswordField("registerPassword", "registerPasswordError");
    if (passwordConfirm.value) validateConfirmPassword();
  });

  passwordConfirm.addEventListener("input", validateConfirmPassword);

  region.addEventListener("blur", () => {
    setFieldState(
      "region",
      "regionError",
      Boolean(region.value),
      "Debes seleccionar una región.",
    );
  });

  commune.addEventListener("change", () => {
    setFieldState(
      "commune",
      "communeError",
      Boolean(commune.value),
      "Debes seleccionar una comuna.",
    );
  });

  address.addEventListener("input", () => {
    const value = address.value.trim();

    if (!value) {
      setFieldState(
        "address",
        "addressError",
        false,
        "La dirección es obligatoria.",
      );
      return;
    }

    if (value.length > 300) {
      setFieldState(
        "address",
        "addressError",
        false,
        "La dirección no puede superar los 300 caracteres.",
      );
      return;
    }

    setFieldState("address", "addressError", true);
  });

  // Validación completa al enviar.
  registerForm.addEventListener("submit", (event) => {
    event.preventDefault();

    message.textContent = "";
    message.className = "form-message";

    const rutValid = validateRutField();
    const nameValid = validateRequiredText(
      "registerName",
      "registerNameError",
      "El nombre",
      50,
    );
    const lastNameValid = validateRequiredText(
      "registerLastName",
      "registerLastNameError",
      "Los apellidos",
      100,
    );
    const emailValid = validateEmailField(
      "registerEmail",
      "registerEmailError",
    );
    const passwordValid = validatePasswordField(
      "registerPassword",
      "registerPasswordError",
    );
    const confirmValid = validateConfirmPassword();

    const regionValid = setFieldState(
      "region",
      "regionError",
      Boolean(region.value),
      "Debes seleccionar una región.",
    );

    const communeValid = setFieldState(
      "commune",
      "communeError",
      Boolean(commune.value),
      "Debes seleccionar una comuna.",
    );

    const addressValue = address.value.trim();
    const addressValid = Boolean(addressValue) && addressValue.length <= 300;

    setFieldState(
      "address",
      "addressError",
      addressValid,
      !addressValue
        ? "La dirección es obligatoria."
        : "La dirección no puede superar los 300 caracteres.",
    );

    const termsValid = terms.checked;
    document.getElementById("termsError").textContent = termsValid
      ? ""
      : "Debes aceptar los términos y condiciones.";

    const formIsValid =
      rutValid &&
      nameValid &&
      lastNameValid &&
      emailValid &&
      passwordValid &&
      confirmValid &&
      regionValid &&
      communeValid &&
      addressValid &&
      termsValid;

    if (!formIsValid) {
      message.textContent =
        "El formulario contiene errores. Corrige los campos marcados.";
      message.classList.add("error");
      return;
    }

    // No guardamos contraseñas en localStorage: este proyecto es frontend
    // y el almacenamiento de credenciales debe realizarse posteriormente
    // en el backend de forma segura.
    message.textContent =
      "Registro validado correctamente. Listo para conectar con el backend.";
    message.classList.add("success");

    registerForm.reset();
    commune.disabled = true;
    commune.innerHTML =
      '<option value="">Primero selecciona una región</option>';
  });
}

/* ---------- 6. Acción del enlace "olvidaste contraseña" ---------- */

const forgotPassword = document.getElementById("forgotPassword");

if (forgotPassword) {
  forgotPassword.addEventListener("click", () => {
    const message = document.getElementById("loginMessage");
    message.textContent =
      "Recuperación de contraseña disponible en una etapa posterior.";
    message.className = "form-message success";
  });
}
