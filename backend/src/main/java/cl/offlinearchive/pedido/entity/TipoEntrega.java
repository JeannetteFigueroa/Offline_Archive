package cl.offlinearchive.pedido.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "tipo_entrega")
public class TipoEntrega {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Short id;

    @Column(nullable = false, unique = true, length = 20)
    private String codigo;

    @Column(nullable = false, length = 60)
    private String nombre;

    @Column(nullable = false)
    private Integer costo = 0;

    @Column(nullable = false)
    private boolean activo = true;

    public TipoEntrega() {}

    public Short getId() { return id; }
    public void setId(Short id) { this.id = id; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public Integer getCosto() { return costo; }
    public void setCosto(Integer costo) { this.costo = costo; }

    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }
}
