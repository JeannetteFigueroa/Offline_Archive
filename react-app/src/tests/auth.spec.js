import { isAllowedEmail } from "../utils/auth.js";

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