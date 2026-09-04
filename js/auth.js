/* =========================================================
   AUTH.JS

   Validaciones y simulación de Login / Registro.
   En esta etapa no existe backend.
   ========================================================= */

/* =========================================================
   1. DATOS GENERALES
   ========================================================= */

const ALLOWED_EMAIL_DOMAINS = [
  "@duoc.cl",
  "@profesor.duoc.cl",
  "@gmail.com",
];

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

const ACCOUNT_KEY = "offlineArchiveAccount";
const SESSION_KEY = "offlineArchiveSession";

/* =========================================================
   2. VALIDACIONES REUTILIZABLES
   ========================================================= */

function isAllowedEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return false;
  }

  return ALLOWED_EMAIL_DOMAINS.some((domain) =>
    normalizedEmail.endsWith(domain),
  );
}


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
      "Solo se permiten correos @duoc.cl, @profesor.duoc.cl y @gmail.com",
    );
  }

  return setFieldState(fieldId, errorId, true);
}

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

/* =========================================================
   3. HASH PARA LA SIMULACIÓN

   No se guarda la contraseña en texto plano.
   Si el navegador permite Web Crypto se usa SHA-256.
   El fallback permite que la demo funcione también al abrir
   el proyecto localmente sin servidor.
   ========================================================= */

async function hashPassword(password) {
  if (window.crypto?.subtle) {
    const data = new TextEncoder().encode(password);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);

    return Array.from(new Uint8Array(hashBuffer))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  let hash = 2166136261;

  for (let i = 0; i < password.length; i++) {
    hash ^= password.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return `fallback-${(hash >>> 0).toString(16)}`;
}

/* =========================================================
   4. CONTRASEÑAS: MOSTRAR / OCULTAR
   ========================================================= */

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

/* =========================================================
   5. LOGIN
   ========================================================= */

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  const email = document.getElementById("loginEmail");
  const password = document.getElementById("loginPassword");
  const rememberMe = document.getElementById("rememberMe");
  const message = document.getElementById("loginMessage");

  const validateLogin = () => {
    const emailValid = validateEmailField("loginEmail", "loginEmailError");
    const passwordValid = validatePasswordField(
      "loginPassword",
      "loginPasswordError",
    );

    return emailValid && passwordValid;
  };

  email.addEventListener("input", () =>
    validateEmailField("loginEmail", "loginEmailError"),
  );

  email.addEventListener("blur", () =>
    validateEmailField("loginEmail", "loginEmailError"),
  );

  password.addEventListener("input", () =>
    validatePasswordField("loginPassword", "loginPasswordError"),
  );

  password.addEventListener("blur", () =>
    validatePasswordField("loginPassword", "loginPasswordError"),
  );

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    message.textContent = "";
    message.className = "form-message";

    if (!validateLogin()) {
      message.textContent = "Revisa los campos marcados antes de continuar.";
      message.classList.add("error");
      return;
    }

    const account = JSON.parse(localStorage.getItem(ACCOUNT_KEY) || "null");

    if (!account) {
      message.textContent = "No existe una cuenta registrada. Crea una cuenta primero.";
      message.classList.add("error");
      return;
    }

    const passwordHash = await hashPassword(password.value);

    if (
      account.email !== email.value.trim().toLowerCase() ||
      account.passwordHash !== passwordHash
    ) {
      message.textContent = "Correo o contraseña incorrectos.";
      message.classList.add("error");
      return;
    }

    const session = {
      email: account.email,
      loggedAt: new Date().toISOString(),
    };

    if (rememberMe?.checked) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }

    message.textContent = "Inicio de sesión correcto. Entrando a tu cuenta...";
    message.classList.add("success");

    setTimeout(() => {
      window.location.href = "cuenta.html";
    }, 700);
  });
}

/* =========================================================
   6. REGISTRO
   ========================================================= */

const registerForm = document.getElementById("registerForm");

if (registerForm) {
  const name = document.getElementById("registerName");
  const lastName = document.getElementById("registerLastName");
  const email = document.getElementById("registerEmail");
  const password = document.getElementById("registerPassword");
  const passwordConfirm = document.getElementById("registerPasswordConfirm");
  const birthDate = document.getElementById("birthDate");
  const region = document.getElementById("region");
  const commune = document.getElementById("commune");
  const address = document.getElementById("address");
  const terms = document.getElementById("terms");
  const message = document.getElementById("registerMessage");

  /* ---------- Cargar regiones ---------- */

  Object.keys(REGION_DATA).forEach((regionName) => {
    const option = document.createElement("option");
    option.value = regionName;
    option.textContent = regionName;
    region.appendChild(option);
  });

  /* ---------- Cambiar comunas ---------- */

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

    setFieldState(
      "region",
      "regionError",
      true,
      "",
    );

    setFieldState(
      "commune",
      "communeError",
      false,
      "Debes seleccionar una comuna.",
    );
  });

  /* ---------- Validación de campos ---------- */


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


  name.addEventListener("input", () =>
    validateRequiredText("registerName", "registerNameError", "El nombre", 50),
  );

  lastName.addEventListener("input", () =>
    validateRequiredText(
      "registerLastName",
      "registerLastNameError",
      "Los apellidos",
      100,
    ),
  );

  email.addEventListener("input", () =>
    validateEmailField("registerEmail", "registerEmailError"),
  );

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

  /* ---------- Crear cuenta simulada ---------- */

  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    message.textContent = "";
    message.className = "form-message";

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

    const normalizedEmail = email.value.trim().toLowerCase();
    const existingAccount = JSON.parse(
      localStorage.getItem(ACCOUNT_KEY) || "null",
    );

    if (existingAccount?.email === normalizedEmail) {
      message.textContent = "Ya existe una cuenta con ese correo.";
      message.classList.add("error");
      return;
    }

    const passwordHash = await hashPassword(password.value);

    const account = {
      name: name.value.trim(),
      lastName: lastName.value.trim(),
      email: normalizedEmail,
      passwordHash,
      birthDate: birthDate.value || "",
      region: region.value,
      commune: commune.value,
      address: addressValue,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));

    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        email: account.email,
        loggedAt: new Date().toISOString(),
      }),
    );

    message.textContent =
      "Cuenta creada correctamente. Volviendo al archivo...";
    message.classList.add("success");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 700);
  });
}

/* =========================================================
   7. RECUPERAR CONTRASEÑA - SIMULACIÓN
   ========================================================= */

const forgotPassword = document.getElementById("forgotPassword");

if (forgotPassword) {
  forgotPassword.addEventListener("click", () => {
    const message = document.getElementById("loginMessage");
    message.textContent =
      "Recuperación de contraseña disponible en una etapa posterior.";
    message.className = "form-message success";
  });
}
