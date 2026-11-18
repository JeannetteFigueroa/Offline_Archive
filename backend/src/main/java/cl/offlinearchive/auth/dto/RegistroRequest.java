package cl.offlinearchive.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

@Schema(description = "Datos para el registro de un nuevo cliente")
public class RegistroRequest {

    @NotBlank(message = "El nombre es obligatorio.")
    @Size(max = 50, message = "El nombre no puede exceder 50 caracteres.")
    @Schema(description = "Nombre del cliente", example = "Jean", requiredMode = Schema.RequiredMode.REQUIRED)
    private String nombre;

    @NotBlank(message = "Los apellidos son obligatorios.")
    @Size(max = 100, message = "Los apellidos no pueden exceder 100 caracteres.")
    @Schema(description = "Apellidos del cliente", example = "González", requiredMode = Schema.RequiredMode.REQUIRED)
    private String apellidos;

    @NotBlank(message = "El correo es obligatorio.")
    @Email(message = "El formato de correo no es válido.")
    @Size(max = 100, message = "El correo no puede exceder 100 caracteres.")
    @Schema(description = "Correo institucional o gmail", example = "cliente@duoc.cl", requiredMode = Schema.RequiredMode.REQUIRED)
    private String correo;

    @NotBlank(message = "El teléfono es obligatorio.")
    @Pattern(regexp = "^9[0-9]{8}$", message = "El teléfono debe tener 9 dígitos y comenzar con 9.")
    @Schema(description = "Teléfono de contacto (9 dígitos comenzando con 9)", example = "912345678", requiredMode = Schema.RequiredMode.REQUIRED)
    private String telefono;

    @NotBlank(message = "La contraseña es obligatoria.")
    @Size(min = 4, max = 50, message = "La contraseña debe tener entre 4 y 50 caracteres.")
    @Schema(description = "Contraseña segura de acceso", example = "Pass1234", requiredMode = Schema.RequiredMode.REQUIRED)
    private String password;

    @Schema(description = "Fecha de nacimiento (debe tener al menos 10 años)", example = "2000-05-15")
    private LocalDate fechaNacimiento;

    @Schema(description = "Aceptación de términos y condiciones", example = "true")
    private Boolean terminosAceptados = true;

    public RegistroRequest() {}

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getApellidos() { return apellidos; }
    public void setApellidos(String apellidos) { this.apellidos = apellidos; }

    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public LocalDate getFechaNacimiento() { return fechaNacimiento; }
    public void setFechaNacimiento(LocalDate fechaNacimiento) { this.fechaNacimiento = fechaNacimiento; }

    public Boolean getTerminosAceptados() { return terminosAceptados; }
    public void setTerminosAceptados(Boolean terminosAceptados) { this.terminosAceptados = terminosAceptados; }
}
