package cl.offlinearchive.contacto.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Formulario de contacto y soporte")
public class MensajeContactoRequest {

    @NotBlank(message = "El nombre es obligatorio.")
    @Size(max = 100, message = "El nombre no puede superar 100 caracteres.")
    @Schema(description = "Nombre de la persona que escribe", example = "Jean González", requiredMode = Schema.RequiredMode.REQUIRED)
    private String nombre;

    @NotBlank(message = "El correo es obligatorio.")
    @Email(message = "El correo no tiene un formato válido.")
    @Size(max = 100, message = "El correo no puede superar 100 caracteres.")
    @Schema(description = "Correo electrónico de respuesta", example = "contacto@duoc.cl", requiredMode = Schema.RequiredMode.REQUIRED)
    private String correo;

    @NotBlank(message = "El asunto es obligatorio.")
    @Size(max = 100, message = "El asunto no puede superar 100 caracteres.")
    @Schema(description = "Motivo del mensaje", example = "Consulta sobre disponibilidad de despacho", requiredMode = Schema.RequiredMode.REQUIRED)
    private String asunto;

    @NotBlank(message = "El mensaje es obligatorio.")
    @Size(max = 500, message = "El mensaje no puede superar 500 caracteres.")
    @Schema(description = "Detalle de la consulta", example = "Hola, quisiera saber cuándo tendrán reposición del vinilo ITEM_001.", requiredMode = Schema.RequiredMode.REQUIRED)
    private String mensaje;

    public MensajeContactoRequest() {}

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }

    public String getAsunto() { return asunto; }
    public void setAsunto(String asunto) { this.asunto = asunto; }

    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }
}
