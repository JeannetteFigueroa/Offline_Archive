package cl.offlinearchive.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Solicitud para cambio de contraseña de usuario autenticado")
public class CambiarPasswordRequest {

    @NotBlank(message = "La contraseña actual es obligatoria.")
    @Schema(description = "Contraseña actual del usuario", example = "Admin123")
    private String passwordActual;

    @NotBlank(message = "La nueva contraseña es obligatoria.")
    @Size(min = 4, max = 100, message = "La nueva contraseña debe tener entre 4 y 100 caracteres.")
    @Schema(description = "Nueva contraseña a establecer", example = "NuevaClave2026")
    private String nuevaPassword;

    public CambiarPasswordRequest() {}

    public CambiarPasswordRequest(String passwordActual, String nuevaPassword) {
        this.passwordActual = passwordActual;
        this.nuevaPassword = nuevaPassword;
    }

    public String getPasswordActual() { return passwordActual; }
    public void setPasswordActual(String passwordActual) { this.passwordActual = passwordActual; }

    public String getNuevaPassword() { return nuevaPassword; }
    public void setNuevaPassword(String nuevaPassword) { this.nuevaPassword = nuevaPassword; }
}
