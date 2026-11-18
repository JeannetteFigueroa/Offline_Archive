package cl.offlinearchive.catalogo.dto;

import cl.offlinearchive.catalogo.entity.Producto;

public class ProductoResponse {
    private Long id;
    private String codigo;
    private Short categoriaId;
    private String categoriaNombre;
    private String categoriaSlug;
    private String nombre;
    private String descripcion;
    private Integer precio;
    private Integer precioOferta;
    private Integer precioEfectivo;
    private boolean enOferta;
    private Integer descuentoPorcentaje;
    private Integer stock;
    private String imagenUrl;
    private boolean visible;

    public ProductoResponse() {}

    public ProductoResponse(Producto p) {
        this.id = p.getId();
        this.codigo = p.getCodigo();
        if (p.getCategoria() != null) {
            this.categoriaId = p.getCategoria().getId();
            this.categoriaNombre = p.getCategoria().getNombre();
            this.categoriaSlug = p.getCategoria().getSlug();
        }
        this.nombre = p.getNombre();
        this.descripcion = p.getDescripcion();
        this.precio = p.getPrecio();
        this.precioOferta = p.getPrecioOferta();
        this.stock = p.getStock();
        this.imagenUrl = p.getImagenUrl();
        this.visible = p.isVisible();

        if (p.getPrecioOferta() != null && p.getPrecioOferta() > 0 && p.getPrecioOferta() < p.getPrecio()) {
            this.enOferta = true;
            this.precioEfectivo = p.getPrecioOferta();
            this.descuentoPorcentaje = (int) Math.round(((double) (p.getPrecio() - p.getPrecioOferta()) / p.getPrecio()) * 100);
        } else {
            this.enOferta = false;
            this.precioEfectivo = p.getPrecio();
            this.descuentoPorcentaje = 0;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public Short getCategoriaId() { return categoriaId; }
    public void setCategoriaId(Short categoriaId) { this.categoriaId = categoriaId; }

    public String getCategoriaNombre() { return categoriaNombre; }
    public void setCategoriaNombre(String categoriaNombre) { this.categoriaNombre = categoriaNombre; }

    public String getCategoriaSlug() { return categoriaSlug; }
    public void setCategoriaSlug(String categoriaSlug) { this.categoriaSlug = categoriaSlug; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Integer getPrecio() { return precio; }
    public void setPrecio(Integer precio) { this.precio = precio; }

    public Integer getPrecioOferta() { return precioOferta; }
    public void setPrecioOferta(Integer precioOferta) { this.precioOferta = precioOferta; }

    public Integer getPrecioEfectivo() { return precioEfectivo; }
    public void setPrecioEfectivo(Integer precioEfectivo) { this.precioEfectivo = precioEfectivo; }

    public boolean isEnOferta() { return enOferta; }
    public void setEnOferta(boolean enOferta) { this.enOferta = enOferta; }

    public Integer getDescuentoPorcentaje() { return descuentoPorcentaje; }
    public void setDescuentoPorcentaje(Integer descuentoPorcentaje) { this.descuentoPorcentaje = descuentoPorcentaje; }

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }

    public String getImagenUrl() { return imagenUrl; }
    public void setImagenUrl(String imagenUrl) { this.imagenUrl = imagenUrl; }

    public boolean isVisible() { return visible; }
    public void setVisible(boolean visible) { this.visible = visible; }
}
