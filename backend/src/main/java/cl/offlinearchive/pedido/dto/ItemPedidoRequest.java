package cl.offlinearchive.pedido.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Elemento del carrito a comprar")
public class ItemPedidoRequest {

    @NotNull(message = "El ID de producto es obligatorio.")
    @Schema(description = "ID del producto", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long productoId;

    @NotNull(message = "La cantidad es obligatoria.")
    @Min(value = 1, message = "La cantidad mínima por producto es 1.")
    @Schema(description = "Cantidad de unidades", example = "2", requiredMode = Schema.RequiredMode.REQUIRED)
    private Integer cantidad;

    public ItemPedidoRequest() {}

    public Long getProductoId() { return productoId; }
    public void setProductoId(Long productoId) { this.productoId = productoId; }

    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
}
