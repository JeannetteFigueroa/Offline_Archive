package cl.offlinearchive.catalogo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "Datos para crear o actualizar una categoría (Exclusivo Administrador)")
public class CategoriaRequest {

    @NotBlank(message = "El nombre de la categoría es obligatorio.")
    @Size(max = 60, message = "El nombre no puede superar 60 caracteres.")
    @Schema(description = "Nombre visible de la categoría", example = "Edición Limitada", requiredMode = Schema.RequiredMode.REQUIRED)
    private String nombre;

    @NotBlank(message = "El slug de la categoría es obligatorio.")
    @Pattern(regexp = "^[a-z0-9]+(-[a-z0-9]+)*$", message = "El slug debe estar en minúsculas y separado por guiones (ej: edicion-limitada).")
    @Size(max = 60, message = "El slug no puede superar 60 caracteres.")
    @Schema(description = "Identificador URL friendly", example = "edicion-limitada", requiredMode = Schema.RequiredMode.REQUIRED)
    private String slug;

    public CategoriaRequest() {}

    public CategoriaRequest(String nombre, String slug) {
        this.nombre = nombre;
        this.slug = slug;
    }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
}
