package cl.offlinearchive.catalogo.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

@Schema(description = "Datos para crear o actualizar un producto (Exclusivo Administrador)")
public class ProductoRequest {

    @Size(max = 30, message = "El código no puede exceder 30 caracteres.")
    @Schema(description = "Código único de inventario (opcional, si se omite se autogenera en formato ITEM_XXX)", example = "ITEM_009")
    private String codigo;

    @Schema(description = "ID de la categoría a la que pertenece (opcional si se envía categoriaSlug)", example = "1")
    private Short categoriaId;

    @Schema(description = "Slug de categoría (ej: 'tops', 'bottoms') alternativo a categoriaId", example = "tops")
    private String categoriaSlug;

    @NotBlank(message = "El nombre del producto es obligatorio.")
    @Size(max = 120, message = "El nombre no puede exceder 120 caracteres.")
    @Schema(description = "Nombre descriptivo del producto", example = "Polera Oversize Archive Black", requiredMode = Schema.RequiredMode.REQUIRED)
    private String nombre;

    @Schema(description = "Descripción detallada del producto", example = "Confeccionada en algodón pesado 240 GSM.")
    private String descripcion;

    @NotNull(message = "El precio es obligatorio.")
    @Min(value = 1, message = "El precio debe ser mayor a 0 CLP.")
    @Schema(description = "Precio regular en CLP", example = "29990", requiredMode = Schema.RequiredMode.REQUIRED)
    private Integer precio;

    @Schema(description = "Precio en oferta en CLP (opcional, debe ser menor al precio normal)", example = "24990")
    private Integer precioOferta;

    @Schema(description = "URL de la imagen del producto", example = "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800")
    private String imagenUrl;

    @Schema(description = "Stock inicial de unidades", example = "10")
    private Integer stock;

    @Schema(description = "Visibilidad en catálogo público", example = "true")
    private Boolean visible = true;

    public ProductoRequest() {}

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public Short getCategoriaId() { return categoriaId; }
    public void setCategoriaId(Short categoriaId) { this.categoriaId = categoriaId; }

    public String getCategoriaSlug() { return categoriaSlug; }
    public void setCategoriaSlug(String categoriaSlug) { this.categoriaSlug = categoriaSlug; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Integer getPrecio() { return precio; }
    public void setPrecio(Integer precio) { this.precio = precio; }

    public Integer getPrecioOferta() { return precioOferta; }
    public void setPrecioOferta(Integer precioOferta) { this.precioOferta = precioOferta; }

    public String getImagenUrl() { return imagenUrl; }
    public void setImagenUrl(String imagenUrl) { this.imagenUrl = imagenUrl; }

    public Boolean getVisible() { return visible; }
    public void setVisible(Boolean visible) { this.visible = visible; }
}
