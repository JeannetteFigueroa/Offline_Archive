package cl.offlinearchive.ubicacion.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "comuna")
public class Comuna {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Short id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "region_id", nullable = false)
    private Region region;

    @Column(nullable = false, length = 60)
    private String nombre;

    public Comuna() {}

    public Short getId() { return id; }
    public void setId(Short id) { this.id = id; }

    public Region getRegion() { return region; }
    public void setRegion(Region region) { this.region = region; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
}
