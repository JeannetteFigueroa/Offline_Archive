/**
 * api.js
 *
 * Cliente HTTP centralizado para la comunicación con la API REST de Spring Boot.
 *
 * Características:
 *  - URL base configurable mediante variable de entorno VITE_API_URL.
 *  - Access Token mantenido en memoria (seguridad contra XSS).
 *  - Envío automático de cookies HttpOnly (credentials: 'include') para Refresh Token.
 *  - Interceptor automático: detecta respuestas 401 (token expirado), solicita
 *    un nuevo token en /auth/refresh y reintenta la petición original.
 *  - Cola de peticiones para evitar renovaciones concurrentes duplicadas.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// Access Token mantenido en memoria
let currentAccessToken = null;

// Control de concurrencia para la renovación del token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const setAccessToken = (token) => {
  currentAccessToken = token;
  if (token) {
    try {
      sessionStorage.setItem("offlineArchiveAccessToken", token);
    } catch {
      // ignore
    }
  }
};

export const getAccessToken = () => {
  if (!currentAccessToken) {
    try {
      currentAccessToken = sessionStorage.getItem("offlineArchiveAccessToken") || null;
    } catch {
      currentAccessToken = null;
    }
  }
  return currentAccessToken;
};

export const clearAccessToken = () => {
  currentAccessToken = null;
  try {
    sessionStorage.removeItem("offlineArchiveAccessToken");
  } catch {
    // ignore
  }
};

/**
 * Realiza una petición HTTP con manejo automático de tokens y errores.
 *
 * @param {string} endpoint - Ruta relativa (ej: "/auth/login")
 * @param {RequestInit} options - Opciones de fetch
 * @param {boolean} isRetry - Indica si es un reintento post-refresh
 * @returns {Promise<any>}
 */
export async function apiRequest(endpoint, options = {}, isRetry = false) {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const token = getAccessToken();
  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
    credentials: "include" // Permite enviar y recibir la cookie HttpOnly del Refresh Token
  };

  try {
    const response = await fetch(url, config);

    // Caso: No autorizado (Access Token expirado o inválido)
    if (response.status === 401 && !isRetry && !endpoint.includes("/auth/login") && !endpoint.includes("/auth/refresh")) {
      if (isRefreshing) {
        // Encolar peticiones paralelas mientras se renueva
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          options.headers = {
            ...(options.headers || {}),
            Authorization: `Bearer ${newToken}`
          };
          return apiRequest(endpoint, options, true);
        });
      }

      isRefreshing = true;

      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include"
        });

        if (!refreshResponse.ok) {
          throw new Error("No se pudo renovar la sesión");
        }

        const data = await refreshResponse.json();
        const newAccessToken = data.accessToken;
        setAccessToken(newAccessToken);
        processQueue(null, newAccessToken);

        // Reintentar la petición original con el nuevo token
        options.headers = {
          ...(options.headers || {}),
          Authorization: `Bearer ${newAccessToken}`
        };
        return apiRequest(endpoint, options, true);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        clearAccessToken();
        window.dispatchEvent(new CustomEvent("auth:expired"));
        throw refreshErr;
      } finally {
        isRefreshing = false;
      }
    }

    // Manejo de respuestas no exitosas (4xx, 5xx)
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const error = new Error(
        errorBody.message || errorBody.error || `Error HTTP ${response.status}`
      );
      error.status = response.status;
      error.body = errorBody;
      throw error;
    }

    // Si la respuesta no tiene contenido (204)
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (err) {
    throw err;
  }
}

export const api = {
  get: (endpoint, options) => apiRequest(endpoint, { ...options, method: "GET" }),
  post: (endpoint, body, options) =>
    apiRequest(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined
    }),
  put: (endpoint, body, options) =>
    apiRequest(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined
    }),
  patch: (endpoint, body, options) =>
    apiRequest(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined
    }),
  delete: (endpoint, options) => apiRequest(endpoint, { ...options, method: "DELETE" })
};

export default api;
