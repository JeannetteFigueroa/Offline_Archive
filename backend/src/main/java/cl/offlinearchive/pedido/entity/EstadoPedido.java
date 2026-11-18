package cl.offlinearchive.pedido.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "estado_pedido")
public class EstadoPedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Short id;

    @Column(nullable = false, unique = true, length = 20)
    private String codigo;

    @Column(nullable = false, length = 60)
    private String nombre;

    @Column(nullable = false)
    private Short orden;

    @Column(name = "es_final", nullable = false)
    private boolean esFinal = false;

    public EstadoPedido() {}

    public Short getId() { return id; }
    public void setId(Short id) { this.id = id; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public Short getOrden() { return orden; }
    public void setOrden(Short orden) { this.orden = orden; }

    public boolean isEsFinal() { return esFinal; }
    public void setEsFinal(boolean esFinal) { this.esFinal = esFinal; }
}
