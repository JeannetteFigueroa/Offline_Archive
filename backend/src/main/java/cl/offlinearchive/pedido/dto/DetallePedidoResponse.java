package cl.offlinearchive.pedido.dto;

import cl.offlinearchive.pedido.entity.DetallePedido;

public class DetallePedidoResponse {
    private String codigoProducto;
    private String nombreProducto;
    private Integer precioNormal;
    private Integer precioUnitario;
    private Integer cantidad;
    private Integer subtotal;

    public DetallePedidoResponse() {}

    public DetallePedidoResponse(DetallePedido d) {
        this.codigoProducto = d.getCodigoProducto();
        this.nombreProducto = d.getNombreProducto();
        this.precioNormal = d.getPrecioNormal();
        this.precioUnitario = d.getPrecioUnitario();
        this.cantidad = d.getCantidad();
        this.subtotal = d.getSubtotal() != null ? d.getSubtotal() : (d.getPrecioUnitario() * d.getCantidad());
    }

    public String getCodigoProducto() { return codigoProducto; }
    public void setCodigoProducto(String codigoProducto) { this.codigoProducto = codigoProducto; }

    public String getNombreProducto() { return nombreProducto; }
    public void setNombreProducto(String nombreProducto) { this.nombreProducto = nombreProducto; }

    public Integer getPrecioNormal() { return precioNormal; }
    public void setPrecioNormal(Integer precioNormal) { this.precioNormal = precioNormal; }

    public Integer getPrecioUnitario() { return precioUnitario; }
    public void setPrecioUnitario(Integer precioUnitario) { this.precioUnitario = precioUnitario; }

    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }

    public Integer getSubtotal() { return subtotal; }
    public void setSubtotal(Integer subtotal) { this.subtotal = subtotal; }
}
