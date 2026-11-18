package cl.offlinearchive.pedido.dto;

import jakarta.validation.constraints.NotBlank;

public class ActualizarEstadoPedidoRequest {

    @NotBlank(message = "El código de estado no puede estar vacío.")
    private String estadoCodigo;

    public ActualizarEstadoPedidoRequest() {}

    public String getEstadoCodigo() { return estadoCodigo; }
    public void setEstadoCodigo(String estadoCodigo) { this.estadoCodigo = estadoCodigo; }
}
