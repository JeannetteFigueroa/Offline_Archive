package cl.offlinearchive.pedido.dto;

import cl.offlinearchive.pedido.entity.Pedido;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class PedidoResponse {
    private Long id;
    private String numeroPedido;
    private String estadoCodigo;
    private String estadoNombre;
    private String tipoEntregaCodigo;
    private String tipoEntregaNombre;
    private String comunaNombre;
    private String clienteNombre;
    private String clienteCorreo;
    private String clienteTelefono;
    private String direccionEntrega;
    private Integer subtotal;
    private Integer costoEnvio;
    private Integer total;
    private OffsetDateTime fecha;
    private List<DetallePedidoResponse> detalles;

    public PedidoResponse() {}

    public PedidoResponse(Pedido p) {
        this.id = p.getId();
        this.numeroPedido = p.getNumeroPedido();
        if (p.getEstado() != null) {
            this.estadoCodigo = p.getEstado().getCodigo();
            this.estadoNombre = p.getEstado().getNombre();
        }
        if (p.getTipoEntrega() != null) {
            this.tipoEntregaCodigo = p.getTipoEntrega().getCodigo();
            this.tipoEntregaNombre = p.getTipoEntrega().getNombre();
        }
        if (p.getComuna() != null) {
            this.comunaNombre = p.getComuna().getNombre();
        }
        this.clienteNombre = p.getClienteNombre();
        this.clienteCorreo = p.getClienteCorreo();
        this.clienteTelefono = p.getClienteTelefono();
        this.direccionEntrega = p.getDireccionEntrega();
        this.subtotal = p.getSubtotal();
        this.costoEnvio = p.getCostoEnvio();
        this.total = p.getTotal();
        this.fecha = p.getFecha();
        if (p.getDetalles() != null) {
            this.detalles = p.getDetalles().stream()
                    .map(DetallePedidoResponse::new)
                    .collect(Collectors.toList());
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNumeroPedido() { return numeroPedido; }
    public void setNumeroPedido(String numeroPedido) { this.numeroPedido = numeroPedido; }

    public String getEstadoCodigo() { return estadoCodigo; }
    public void setEstadoCodigo(String estadoCodigo) { this.estadoCodigo = estadoCodigo; }

    public String getEstadoNombre() { return estadoNombre; }
    public void setEstadoNombre(String estadoNombre) { this.estadoNombre = estadoNombre; }

    public String getTipoEntregaCodigo() { return tipoEntregaCodigo; }
    public void setTipoEntregaCodigo(String tipoEntregaCodigo) { this.tipoEntregaCodigo = tipoEntregaCodigo; }

    public String getTipoEntregaNombre() { return tipoEntregaNombre; }
    public void setTipoEntregaNombre(String tipoEntregaNombre) { this.tipoEntregaNombre = tipoEntregaNombre; }

    public String getComunaNombre() { return comunaNombre; }
    public void setComunaNombre(String comunaNombre) { this.comunaNombre = comunaNombre; }

    public String getClienteNombre() { return clienteNombre; }
    public void setClienteNombre(String clienteNombre) { this.clienteNombre = clienteNombre; }

    public String getClienteCorreo() { return clienteCorreo; }
    public void setClienteCorreo(String clienteCorreo) { this.clienteCorreo = clienteCorreo; }

    public String getClienteTelefono() { return clienteTelefono; }
    public void setClienteTelefono(String clienteTelefono) { this.clienteTelefono = clienteTelefono; }

    public String getDireccionEntrega() { return direccionEntrega; }
    public void setDireccionEntrega(String direccionEntrega) { this.direccionEntrega = direccionEntrega; }

    public Integer getSubtotal() { return subtotal; }
    public void setSubtotal(Integer subtotal) { this.subtotal = subtotal; }

    public Integer getCostoEnvio() { return costoEnvio; }
    public void setCostoEnvio(Integer costoEnvio) { this.costoEnvio = costoEnvio; }

    public Integer getTotal() { return total; }
    public void setTotal(Integer total) { this.total = total; }

    public OffsetDateTime getFecha() { return fecha; }
    public void setFecha(OffsetDateTime fecha) { this.fecha = fecha; }

    public List<DetallePedidoResponse> getDetalles() { return detalles; }
    public void setDetalles(List<DetallePedidoResponse> detalles) { this.detalles = detalles; }
}
