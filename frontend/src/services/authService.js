/**
 * authService.js
 *
 * Servicio de autenticación que encapsula las operaciones de login,
 * registro, refresh, perfil y logout contra la API de Spring Boot.
 */

import { api, setAccessToken, clearAccessToken } from "./api";
import { SESSION_KEY, ACCOUNT_KEY, clearSession } from "../utils/auth";

export const authService = {
  /**
   * Inicia sesión contra el backend de Spring Boot.
   *
   * @param {string} correo - Correo electrónico
   * @param {string} password - Contraseña en texto plano
   * @param {boolean} remember - Si se debe recordar la sesión
   * @returns {Promise<any>}
   */
  async login(correo, password, remember = false) {
    const data = await api.post("/auth/login", { correo, password });

    if (data?.accessToken) {
      setAccessToken(data.accessToken);

      // Sincroniza sesión con el frontend respetando la estructura existente
      const usuario = data.usuario;
      const isRoleAdmin = usuario.rol?.toUpperCase() === "ADMIN";

      const session = {
        email: usuario.correo,
        role: isRoleAdmin ? "admin" : "customer",
        name: usuario.nombre,
        lastName: usuario.apellidos,
        loggedAt: new Date().toISOString()
      };

      const accountData = {
        id: usuario.id,
        name: usuario.nombre,
        lastName: usuario.apellidos,
        email: usuario.correo,
        phone: usuario.telefono,
        birthDate: usuario.fechaNacimiento,
        role: isRoleAdmin ? "admin" : "customer"
      };

      clearSession();
      // La sesión admin siempre se persiste en localStorage para sobrevivir
      // a recargas y navegación entre pestañas. El refresh token HttpOnly
      // protege la renovación del access token de forma segura.
      if (remember || isRoleAdmin) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      } else {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      }

      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(accountData));
    }

    return data;
  },

  /**
   * Registra un nuevo cliente en el backend de Spring Boot.
   *
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<any>}
   */
  async registro(userData) {
    const payload = {
      nombre: userData.name || userData.nombre,
      apellidos: userData.lastName || userData.apellidos,
      correo: userData.email || userData.correo,
      telefono: userData.phone || userData.telefono,
      password: userData.password,
      fechaNacimiento: userData.birthDate || userData.fechaNacimiento || null,
      terminosAceptados: true
    };

    const data = await api.post("/auth/registro", payload);

    if (data?.accessToken) {
      setAccessToken(data.accessToken);

      const usuario = data.usuario;
      const session = {
        email: usuario.correo,
        role: "customer",
        name: usuario.nombre,
        lastName: usuario.apellidos,
        loggedAt: new Date().toISOString()
      };

      const accountData = {
        id: usuario.id,
        name: usuario.nombre,
        lastName: usuario.apellidos,
        email: usuario.correo,
        phone: usuario.telefono,
        birthDate: usuario.fechaNacimiento,
        role: "customer"
      };

      clearSession();
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(accountData));
    }

    return data;
  },

  /**
   * Intenta renovar la sesión en segundo plano usando la Cookie HttpOnly.
   *
   * @returns {Promise<string|null>} Nuevo access token o null
   */
  async renovarSesion() {
    try {
      const data = await api.post("/auth/refresh");
      if (data?.accessToken) {
        setAccessToken(data.accessToken);
        return data.accessToken;
      }
      return null;
    } catch {
      clearAccessToken();
      return null;
    }
  },

  /**
   * Consulta los datos del usuario actualmente autenticado.
   *
   * @returns {Promise<any>}
   */
  async getPerfil() {
    return await api.get("/auth/perfil");
  },

  /**
   * Actualiza la contraseña del usuario autenticado en PostgreSQL.
   *
   * @param {{ passwordActual: string, nuevaPassword: string }} payload
   * @returns {Promise<any>}
   */
  async cambiarPassword(payload) {
    return await api.post("/auth/cambiar-password", payload);
  },

  /**
   * Cierra la sesión en el servidor y limpia el estado local.
   */
  async logout() {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignora error de red si el servidor ya no responde
    } finally {
      clearAccessToken();
      clearSession();
    }
  }
};

export default authService;
