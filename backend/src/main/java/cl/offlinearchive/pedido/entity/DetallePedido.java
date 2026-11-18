package cl.offlinearchive.pedido.entity;

import cl.offlinearchive.catalogo.entity.Producto;
import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "detalle_pedido")
@IdClass(DetallePedido.DetallePedidoId.class)
public class DetallePedido {

    @Id
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pedido_id", nullable = false)
    private Pedido pedido;

    @Id
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @Column(name = "codigo_producto", nullable = false, length = 30)
    private String codigoProducto;

    @Column(name = "nombre_producto", nullable = false, length = 120)
    private String nombreProducto;

    @Column(name = "precio_normal", nullable = false)
    private Integer precioNormal;

    @Column(name = "precio_unitario", nullable = false)
    private Integer precioUnitario;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(name = "subtotal", insertable = false, updatable = false)
    private Integer subtotal;

    public DetallePedido() {}

    public Pedido getPedido() { return pedido; }
    public void setPedido(Pedido pedido) { this.pedido = pedido; }

    public Producto getProducto() { return producto; }
    public void setProducto(Producto producto) { this.producto = producto; }

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

    public static class DetallePedidoId implements Serializable {
        private Long pedido;
        private Long producto;

        public DetallePedidoId() {}

        public DetallePedidoId(Long pedido, Long producto) {
            this.pedido = pedido;
            this.producto = producto;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            DetallePedidoId that = (DetallePedidoId) o;
            return Objects.equals(pedido, that.pedido) && Objects.equals(producto, that.producto);
        }

        @Override
        public int hashCode() {
            return Objects.hash(pedido, producto);
        }
    }
}
