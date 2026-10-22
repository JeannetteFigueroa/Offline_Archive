export const ALLOWED_EMAIL_DOMAINS = [
  "@duoc.cl",
  "@profesor.duoc.cl",
  "@gmail.com",
];

export const ACCOUNT_KEY = "offlineArchiveAccount";
export const SESSION_KEY = "offlineArchiveSession";
export const ADMIN_ACCOUNT_KEY = "offlineArchiveAdminAccount";
export const DEMO_ADMIN_EMAIL = "admin@gmail.com";
export const DEMO_ADMIN_PASSWORD = "Admin123";

// Cuenta de demostración solo para evaluar el frontend local.
export async function ensureDemoAdminAccount() {
  const existente = localStorage.getItem(ADMIN_ACCOUNT_KEY);
  if (existente) {
    try {
      const cuenta = JSON.parse(existente);
      if (cuenta?.email === DEMO_ADMIN_EMAIL && cuenta?.passwordHash) return cuenta;
    } catch { /* recrea la cuenta demo si el dato local está corrupto */ }
  }
  const cuenta = {
    name: "Admin",
    lastName: "Offline",
    email: DEMO_ADMIN_EMAIL,
    role: "admin",
    passwordHash: await hashPassword(DEMO_ADMIN_PASSWORD),
    createdAt: new Date().toISOString(),
    demo: true
  };
  localStorage.setItem(ADMIN_ACCOUNT_KEY, JSON.stringify(cuenta));
  return cuenta;
}

export const REGION_DATA = {
  "Arica y Parinacota": ["Arica", "Putre", "Camarones"],
  "Tarapacá": ["Iquique", "Alto Hospicio", "Pozo Almonte"],
  "Antofagasta": ["Antofagasta", "Calama", "Tocopilla"],
  "Atacama": ["Copiapó", "Caldera", "Vallenar"],
  "Coquimbo": ["La Serena", "Coquimbo", "Ovalle"],
  "Valparaíso": ["Valparaíso", "Viña del Mar", "Quilpué"],
  "Metropolitana de Santiago": ["Santiago", "Maipú", "Puente Alto"],
  "O'Higgins": ["Rancagua", "Machalí", "San Fernando"],
  "Maule": ["Talca", "Curicó", "Linares"],
  "Ñuble": ["Chillán", "San Carlos", "Bulnes"],
  "Biobío": ["Concepción", "Talcahuano", "Los Ángeles"],
  "La Araucanía": ["Temuco", "Angol", "Villarrica"],
  "Los Ríos": ["Valdivia", "La Unión", "Panguipulli"],
  "Los Lagos": ["Puerto Montt", "Osorno", "Castro"],
  "Aysén": ["Coyhaique", "Aysén", "Chile Chico"],
  "Magallanes y de la Antártica Chilena": [
    "Punta Arenas",
    "Puerto Natales",
    "Porvenir",
  ],
};

export function isAllowedEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return false;
  }

  return ALLOWED_EMAIL_DOMAINS.some((domain) =>
    normalizedEmail.endsWith(domain)
  );
}

export async function hashPassword(password) {
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

export function getStoredSession() {
  const localSession = localStorage.getItem(SESSION_KEY);
  const temporarySession = sessionStorage.getItem(SESSION_KEY);

  try {
    return JSON.parse(localSession || temporarySession || "null");
  } catch {
    return null;
  }
}

export function getAccount() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNT_KEY) || "null");
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

export function formatBirthDate(value) {
  if (!value) return "No registrada";

  const parts = value.split("-");
  if (parts.length !== 3) return value;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}
