package cl.offlinearchive.catalogo.dto;

import cl.offlinearchive.catalogo.entity.Categoria;

public class CategoriaResponse {
    private Short id;
    private String slug;
    private String nombre;
    private boolean esSistema;

    public CategoriaResponse() {}

    public CategoriaResponse(Categoria c) {
        this.id = c.getId();
        this.slug = c.getSlug();
        this.nombre = c.getNombre();
        this.esSistema = c.isEsSistema();
    }

    public Short getId() { return id; }
    public void setId(Short id) { this.id = id; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public boolean isEsSistema() { return esSistema; }
    public void setEsSistema(boolean esSistema) { this.esSistema = esSistema; }
}
