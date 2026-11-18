package cl.offlinearchive.pedido.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import java.util.List;

@Schema(description = "Datos para procesar una orden de compra (Checkout)")
public class CrearPedidoRequest {

    @NotBlank(message = "El nombre del comprador es obligatorio.")
    @Schema(description = "Nombre completo del comprador", example = "Jean González", requiredMode = Schema.RequiredMode.REQUIRED)
    private String clienteNombre;

    @NotBlank(message = "El correo es obligatorio.")
    @Email(message = "El formato de correo no es válido.")
    @Schema(description = "Correo de confirmación", example = "cliente@duoc.cl", requiredMode = Schema.RequiredMode.REQUIRED)
    private String clienteCorreo;

    @NotBlank(message = "El teléfono es obligatorio.")
    @Pattern(regexp = "^9[0-9]{8}$", message = "El teléfono debe tener 9 dígitos y comenzar con 9.")
    @Schema(description = "Teléfono de contacto", example = "912345678", requiredMode = Schema.RequiredMode.REQUIRED)
    private String clienteTelefono;

    @Schema(description = "Código de comuna", example = "1")
    private Short comunaId;

    @Schema(description = "Nombre de la comuna (si no se envía comunaId)", example = "Santiago")
    private String comunaNombre;

    @NotBlank(message = "La dirección de entrega es obligatoria.")
    @Schema(description = "Dirección física o sucursal de retiro", example = "Av. Providencia 2124", requiredMode = Schema.RequiredMode.REQUIRED)
    private String direccionEntrega;

    @NotBlank(message = "El código del tipo de entrega es obligatorio (DOMICILIO o RETIRO).")
    @Schema(description = "Código de tipo de entrega", example = "DOMICILIO", requiredMode = Schema.RequiredMode.REQUIRED)
    private String tipoEntregaCodigo;

    @NotBlank(message = "El método de pago es obligatorio.")
    @Schema(description = "Código del método de pago (DEBITO, CREDITO, TRANSFERENCIA)", example = "DEBITO", requiredMode = Schema.RequiredMode.REQUIRED)
    private String metodoPagoCodigo;

    @NotEmpty(message = "El pedido debe contener al menos un producto.")
    @Valid
    @Schema(description = "Listado de productos y cantidades a comprar", requiredMode = Schema.RequiredMode.REQUIRED)
    private List<ItemPedidoRequest> items;

    public CrearPedidoRequest() {}

    public String getClienteNombre() { return clienteNombre; }
    public void setClienteNombre(String clienteNombre) { this.clienteNombre = clienteNombre; }

    public String getClienteCorreo() { return clienteCorreo; }
    public void setClienteCorreo(String clienteCorreo) { this.clienteCorreo = clienteCorreo; }

    public String getClienteTelefono() { return clienteTelefono; }
    public void setClienteTelefono(String clienteTelefono) { this.clienteTelefono = clienteTelefono; }

    public Short getComunaId() { return comunaId; }
    public void setComunaId(Short comunaId) { this.comunaId = comunaId; }

    public String getComunaNombre() { return comunaNombre; }
    public void setComunaNombre(String comunaNombre) { this.comunaNombre = comunaNombre; }

    public String getDireccionEntrega() { return direccionEntrega; }
    public void setDireccionEntrega(String direccionEntrega) { this.direccionEntrega = direccionEntrega; }

    public String getTipoEntregaCodigo() { return tipoEntregaCodigo; }
    public void setTipoEntregaCodigo(String tipoEntregaCodigo) { this.tipoEntregaCodigo = tipoEntregaCodigo; }

    public String getMetodoPagoCodigo() { return metodoPagoCodigo; }
    public void setMetodoPagoCodigo(String metodoPagoCodigo) { this.metodoPagoCodigo = metodoPagoCodigo; }

    public List<ItemPedidoRequest> getItems() { return items; }
    public void setItems(List<ItemPedidoRequest> items) { this.items = items; }
}
