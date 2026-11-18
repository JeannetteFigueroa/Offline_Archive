package cl.offlinearchive.catalogo.service;

import cl.offlinearchive.catalogo.dto.CategoriaRequest;
import cl.offlinearchive.catalogo.dto.CategoriaResponse;
import cl.offlinearchive.catalogo.dto.ProductoRequest;
import cl.offlinearchive.catalogo.dto.ProductoResponse;
import cl.offlinearchive.catalogo.entity.Categoria;
import cl.offlinearchive.catalogo.entity.Producto;
import cl.offlinearchive.catalogo.repository.CategoriaRepository;
import cl.offlinearchive.catalogo.repository.ProductoRepository;
import cl.offlinearchive.common.exception.BadRequestException;
import cl.offlinearchive.common.exception.ConflictException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CatalogoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;

    public CatalogoService(ProductoRepository productoRepository, CategoriaRepository categoriaRepository) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
    }

    // ── Métodos Públicos (Catálogo) ─────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CategoriaResponse> listarCategorias() {
        return categoriaRepository.findAll().stream()
                .map(CategoriaResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductoResponse> listarProductosPublicos(String categoriaSlug) {
        List<Producto> productos;
        if (categoriaSlug != null && !categoriaSlug.isBlank()) {
            productos = productoRepository.findByVisibleTrueAndCategoriaSlug(categoriaSlug.trim().toLowerCase());
        } else {
            productos = productoRepository.findAllVisibleWithCategoria();
        }
        return productos.stream().map(ProductoResponse::new).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductoResponse> listarTodosLosProductosAdmin() {
        return productoRepository.findAllWithCategoria().stream()
                .map(ProductoResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductoResponse obtenerProductoPorId(Long id) {
        Producto p = productoRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Producto no encontrado con id: " + id));
        return new ProductoResponse(p);
    }

    @Transactional(readOnly = true)
    public ProductoResponse obtenerProductoPorCodigo(String codigo) {
        Producto p = productoRepository.findByCodigo(codigo)
                .orElseThrow(() -> new BadRequestException("Producto no encontrado con código: " + codigo));
        return new ProductoResponse(p);
    }

    // ── Métodos de Gestión Administrativa (ADMIN ONLY) ──────────────────────────

    @Transactional
    public CategoriaResponse crearCategoria(CategoriaRequest request) {
        String slug = request.getSlug().trim().toLowerCase();
        if (categoriaRepository.existsBySlug(slug)) {
            throw new ConflictException("Ya existe una categoría con el slug: " + slug);
        }
        if (categoriaRepository.existsByNombreIgnoreCase(request.getNombre().trim())) {
            throw new ConflictException("Ya existe una categoría con el nombre: " + request.getNombre().trim());
        }

        Categoria c = new Categoria();
        c.setSlug(slug);
        c.setNombre(request.getNombre().trim());
        c.setEsSistema(false);

        return new CategoriaResponse(categoriaRepository.save(c));
    }

    @Transactional
    public void eliminarCategoria(Short id) {
        Categoria c = categoriaRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Categoría no encontrada con id: " + id));

        if (c.isEsSistema()) {
            throw new BadRequestException("No es posible eliminar una categoría base del sistema.");
        }

        categoriaRepository.delete(c);
    }

    @Transactional
    public ProductoResponse crearProducto(ProductoRequest request) {
        String codigo = (request.getCodigo() != null && !request.getCodigo().isBlank())
                ? request.getCodigo().trim().toUpperCase()
                : generarCodigoUnico();

        if (productoRepository.existsByCodigo(codigo)) {
            throw new ConflictException("Ya existe un producto con el código: " + codigo);
        }

        validarReglasPrecio(request.getPrecio(), request.getPrecioOferta());

        Categoria cat = null;
        if (request.getCategoriaId() != null) {
            cat = categoriaRepository.findById(request.getCategoriaId()).orElse(null);
        }
        if (cat == null && request.getCategoriaSlug() != null && !request.getCategoriaSlug().isBlank()) {
            cat = categoriaRepository.findBySlug(request.getCategoriaSlug().trim().toLowerCase()).orElse(null);
        }
        if (cat == null) {
            cat = categoriaRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new BadRequestException("No existen categorías registradas en el sistema."));
        }

        Producto p = new Producto();
        p.setCodigo(codigo);
        p.setCategoria(cat);
        p.setNombre(request.getNombre().trim());
        p.setDescripcion(request.getDescripcion() != null ? request.getDescripcion().trim() : null);
        p.setPrecio(request.getPrecio());
        p.setPrecioOferta(request.getPrecioOferta());
        p.setStock(request.getStock() != null && request.getStock() >= 0 ? request.getStock() : 0);
        p.setImagenUrl(request.getImagenUrl());
        p.setVisible(request.getVisible() != null ? request.getVisible() : true);

        return new ProductoResponse(productoRepository.save(p));
    }

    private String generarCodigoUnico() {
        long count = productoRepository.count() + 1;
        String cand = String.format("ITEM_%03d", count);
        while (productoRepository.existsByCodigo(cand)) {
            count++;
            cand = String.format("ITEM_%03d", count);
        }
        return cand;
    }

    @Transactional
    public ProductoResponse actualizarProducto(Long id, ProductoRequest request) {
        Producto p = productoRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Producto no encontrado con id: " + id));

        if (request.getCodigo() != null && !request.getCodigo().isBlank()) {
            String nuevoCodigo = request.getCodigo().trim().toUpperCase();
            if (!p.getCodigo().equalsIgnoreCase(nuevoCodigo) && productoRepository.existsByCodigo(nuevoCodigo)) {
                throw new ConflictException("Ya existe otro producto con el código: " + nuevoCodigo);
            }
            p.setCodigo(nuevoCodigo);
        }

        validarReglasPrecio(request.getPrecio(), request.getPrecioOferta());

        if (request.getCategoriaId() != null) {
            Categoria cat = categoriaRepository.findById(request.getCategoriaId())
                    .orElseThrow(() -> new BadRequestException("Categoría no encontrada con id: " + request.getCategoriaId()));
            p.setCategoria(cat);
        } else if (request.getCategoriaSlug() != null && !request.getCategoriaSlug().isBlank()) {
            categoriaRepository.findBySlug(request.getCategoriaSlug().trim().toLowerCase())
                    .ifPresent(p::setCategoria);
        }

        p.setNombre(request.getNombre().trim());
        p.setDescripcion(request.getDescripcion() != null ? request.getDescripcion().trim() : null);
        p.setPrecio(request.getPrecio());
        p.setPrecioOferta(request.getPrecioOferta());
        if (request.getStock() != null && request.getStock() >= 0) {
            p.setStock(request.getStock());
        }
        if (request.getVisible() != null) {
            p.setVisible(request.getVisible());
        }
        if (request.getImagenUrl() != null) {
            p.setImagenUrl(request.getImagenUrl());
        }

        return new ProductoResponse(productoRepository.save(p));
    }

    @Transactional
    public void eliminarProducto(Long id) {
        Producto p = productoRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Producto no encontrado con id: " + id));
        try {
            productoRepository.delete(p);
            productoRepository.flush();
        } catch (Exception e) {
            // Si el producto tiene referencias históricas en pedidos o stock, se desactiva del catálogo
            p.setVisible(false);
            productoRepository.save(p);
        }
    }

    // ── Reglas de Negocio ───────────────────────────────────────────────────────

    private void validarReglasPrecio(Integer precio, Integer precioOferta) {
        if (precio == null || precio <= 0) {
            throw new BadRequestException("El precio debe ser un valor positivo en pesos chilenos.");
        }
        if (precioOferta != null && precioOferta > 0) {
            if (precioOferta >= precio) {
                throw new BadRequestException("El precio de oferta (" + precioOferta + ") debe ser estrictamente menor al precio regular (" + precio + ").");
            }
        }
    }
}
