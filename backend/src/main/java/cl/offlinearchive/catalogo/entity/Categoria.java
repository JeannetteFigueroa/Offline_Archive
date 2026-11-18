package cl.offlinearchive.catalogo.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

/**
 * Entidad que mapea la tabla `categoria` del MER oficial.
 * Representa una categoría de productos (ej: vinilo, cassette, cd, merch).
 */
@Entity
@Table(name = "categoria")
public class Categoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Short id;

    @Column(nullable = false, unique = true, length = 60)
    private String slug;

    @Column(nullable = false, unique = true, length = 60)
    private String nombre;

    /** Si es true, el sistema la protege (no se puede eliminar desde la API). */
    @Column(name = "es_sistema", nullable = false)
    private boolean esSistema = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = OffsetDateTime.now();
    }

    // ── Getters y setters ──────────────────────────────────────────────────────

    public Short getId() { return id; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public boolean isEsSistema() { return esSistema; }
    public void setEsSistema(boolean esSistema) { this.esSistema = esSistema; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
}
