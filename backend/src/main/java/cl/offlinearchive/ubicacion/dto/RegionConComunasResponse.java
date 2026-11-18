package cl.offlinearchive.ubicacion.dto;

import java.util.List;

public class RegionConComunasResponse {
    private Short id;
    private String nombre;
    private List<String> comunas;

    public RegionConComunasResponse() {}

    public RegionConComunasResponse(Short id, String nombre, List<String> comunas) {
        this.id = id;
        this.nombre = nombre;
        this.comunas = comunas;
    }

    public Short getId() { return id; }
    public void setId(Short id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public List<String> getComunas() { return comunas; }
    public void setComunas(List<String> comunas) { this.comunas = comunas; }
}
