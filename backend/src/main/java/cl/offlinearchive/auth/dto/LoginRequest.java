package cl.offlinearchive.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Credenciales requeridas para autenticación de usuarios")
public class LoginRequest {

    @NotBlank(message = "El correo es obligatorio.")
    @Email(message = "El formato de correo no es válido.")
    @Schema(description = "Correo registrado del usuario", example = "admin@gmail.com", requiredMode = Schema.RequiredMode.REQUIRED)
    private String correo;

    @NotBlank(message = "La contraseña es obligatoria.")
    @Schema(description = "Contraseña en texto plano", example = "Admin123", requiredMode = Schema.RequiredMode.REQUIRED)
    private String password;

    public LoginRequest() {}

    public LoginRequest(String correo, String password) {
        this.correo = correo;
        this.password = password;
    }

    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
