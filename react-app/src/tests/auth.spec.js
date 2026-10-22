import { isAllowedEmail, ensureDemoAdminAccount, ADMIN_ACCOUNT_KEY, DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD, hashPassword } from "../utils/auth.js";

describe("Validación de correos", () => {
    it("deberia aceptar los dominios permitidos", () => {
        expect(isAllowedEmail("alumno@duoc.cl")).toBeTrue();
        expect(isAllowedEmail("docente@profesor.duoc.cl")).toBeTrue();
        expect(isAllowedEmail("usuario@gmail.com")).toBeTrue();
    });

    it("deberia rechazar un dominio no permitido", () => {
        expect(isAllowedEmail("usuario@hotmail.com")).toBeFalse();
    });
});

describe("Cuenta de administrador de demostración", () => {
    beforeEach(() => localStorage.removeItem(ADMIN_ACCOUNT_KEY));

    it("crea una cuenta admin separada con rol de administrador", async () => {
        const cuenta = await ensureDemoAdminAccount();
        expect(cuenta.email).toBe(DEMO_ADMIN_EMAIL);
        expect(cuenta.role).toBe("admin");
        expect(JSON.parse(localStorage.getItem(ADMIN_ACCOUNT_KEY)).email).toBe(DEMO_ADMIN_EMAIL);
        expect(cuenta.passwordHash).toBe(await hashPassword(DEMO_ADMIN_PASSWORD));
    });
});
