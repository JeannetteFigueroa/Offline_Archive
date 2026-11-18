package cl.offlinearchive.catalogo.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

/**
 * Entidad que mapea la tabla `producto` del MER oficial.
 * El campo `stock` es mantenido por el trigger `trg_movimiento_stock_after`
 * en PostgreSQL; desde Java solo lo leemos.
 */
@Entity
@Table(name = "producto")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String codigo;

    /** Relación ManyToOne hacia categoría (categoria_id FK). */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @Column(nullable = false, length = 120)
    private String nombre;

    @Column(columnDefinition = "text")
    private String descripcion;

    /** Precio normal en CLP (entero, el peso no usa decimales). */
    @Column(nullable = false)
    private Integer precio;

    /** Precio con descuento/oferta en CLP; null si no hay oferta activa. */
    @Column(name = "precio_oferta")
    private Integer precioOferta;

    /** Stock actual; actualizado automáticamente por trigger en PostgreSQL. */
    @Column(nullable = false)
    private Integer stock = 0;

    @Column(name = "imagen_url", columnDefinition = "text")
    private String imagenUrl;

    /** Si false, el producto no aparece en el catálogo público. */
    @Column(nullable = false)
    private boolean visible = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
    }

    @PreUpdate
    void onUpdate() { updatedAt = OffsetDateTime.now(); }

    // ── Getters y setters ──────────────────────────────────────────────────────

    public Long getId() { return id; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public Categoria getCategoria() { return categoria; }
    public void setCategoria(Categoria categoria) { this.categoria = categoria; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Integer getPrecio() { return precio; }
    public void setPrecio(Integer precio) { this.precio = precio; }

    public Integer getPrecioOferta() { return precioOferta; }
    public void setPrecioOferta(Integer precioOferta) { this.precioOferta = precioOferta; }

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }

    public String getImagenUrl() { return imagenUrl; }
    public void setImagenUrl(String imagenUrl) { this.imagenUrl = imagenUrl; }

    public boolean isVisible() { return visible; }
    public void setVisible(boolean visible) { this.visible = visible; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
