package cl.offlinearchive.catalogo.controller;

import cl.offlinearchive.catalogo.dto.ProductoRequest;
import cl.offlinearchive.catalogo.dto.ProductoResponse;
import cl.offlinearchive.catalogo.service.CatalogoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/productos")
@Tag(name = "Catálogo - Productos", description = "Endpoints para consulta pública y administración de productos")
public class ProductoController {

    private final CatalogoService catalogoService;

    public ProductoController(CatalogoService catalogoService) {
        this.catalogoService = catalogoService;
    }

    @GetMapping
    @Operation(
            summary = "Listar productos visibles al público",
            description = "Retorna todos los productos disponibles con stock y precios en CLP. **Permiso: Público (sin token).**"
    )
    public ResponseEntity<List<ProductoResponse>> listarProductos(
            @Parameter(description = "Slug opcional de categoría para filtrar (ej: 'tops', 'bottoms')", example = "tops")
            @RequestParam(required = false) String categoria) {
        return ResponseEntity.ok(catalogoService.listarProductosPublicos(categoria));
    }

    @GetMapping("/admin")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(
            summary = "Listar todos los productos para administración",
            description = "Retorna todos los productos incluyendo ocultos/visibles con categoría y stock completo. **Permiso requerido: ROL ADMIN.**"
    )
    public ResponseEntity<List<ProductoResponse>> listarProductosAdmin() {
        return ResponseEntity.ok(catalogoService.listarTodosLosProductosAdmin());
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Obtener producto por ID",
            description = "Consulta la ficha técnica completa de un producto. **Permiso: Público.**"
    )
    public ResponseEntity<ProductoResponse> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(catalogoService.obtenerProductoPorId(id));
    }

    @GetMapping("/codigo/{codigo}")
    @Operation(
            summary = "Obtener producto por código comercial",
            description = "Consulta producto mediante su SKU / código único (ej: ITEM_001). **Permiso: Público.**"
    )
    public ResponseEntity<ProductoResponse> obtenerPorCodigo(@PathVariable String codigo) {
        return ResponseEntity.ok(catalogoService.obtenerProductoPorCodigo(codigo));
    }

    @PostMapping
    @SecurityRequirement(name = "BearerAuth")
    @Operation(
            summary = "Crear nuevo producto",
            description = "Crea un producto en el catálogo. Valida precio, categoría y código único. **Permiso requerido: ROL ADMIN.**"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Producto creado con éxito"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos o precio oferta mayor al precio regular"),
            @ApiResponse(responseCode = "403", description = "Acceso denegado (requiere ROL ADMIN)"),
            @ApiResponse(responseCode = "409", description = "Código de producto duplicado")
    })
    public ResponseEntity<ProductoResponse> crearProducto(@Valid @RequestBody ProductoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(catalogoService.crearProducto(request));
    }

    @PutMapping("/{id}")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(
            summary = "Actualizar producto existente",
            description = "Modifica los atributos de un producto existente. **Permiso requerido: ROL ADMIN.**"
    )
    public ResponseEntity<ProductoResponse> actualizarProducto(
            @PathVariable Long id,
            @Valid @RequestBody ProductoRequest request) {
        return ResponseEntity.ok(catalogoService.actualizarProducto(id, request));
    }

    @DeleteMapping("/{id}")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(
            summary = "Eliminar producto",
            description = "Elimina un producto del catálogo. **Permiso requerido: ROL ADMIN.**"
    )
    public ResponseEntity<Map<String, String>> eliminarProducto(@PathVariable Long id) {
        catalogoService.eliminarProducto(id);
        return ResponseEntity.ok(Map.of("mensaje", "Producto eliminado correctamente"));
    }
}
