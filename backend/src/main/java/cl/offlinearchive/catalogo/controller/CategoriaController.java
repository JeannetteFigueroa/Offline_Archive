package cl.offlinearchive.catalogo.controller;

import cl.offlinearchive.catalogo.dto.CategoriaRequest;
import cl.offlinearchive.catalogo.dto.CategoriaResponse;
import cl.offlinearchive.catalogo.service.CatalogoService;
import io.swagger.v3.oas.annotations.Operation;
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
@RequestMapping("/v1/categorias")
@Tag(name = "Catálogo - Categorías", description = "Endpoints para consulta pública y administración de categorías")
public class CategoriaController {

    private final CatalogoService catalogoService;

    public CategoriaController(CatalogoService catalogoService) {
        this.catalogoService = catalogoService;
    }

    @GetMapping
    @Operation(
            summary = "Listar todas las categorías del catálogo",
            description = "Retorna las categorías activas (ej: Tops, Bottoms, Accesorios). **Permiso: Público (sin token).**"
    )
    public ResponseEntity<List<CategoriaResponse>> listarCategorias() {
        return ResponseEntity.ok(catalogoService.listarCategorias());
    }

    @PostMapping
    @SecurityRequirement(name = "BearerAuth")
    @Operation(
            summary = "Crear nueva categoría",
            description = "Crea una categoría en el catálogo con slug único. **Permiso requerido: ROL ADMIN.**"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Categoría creada con éxito"),
            @ApiResponse(responseCode = "400", description = "Formato inválido de slug"),
            @ApiResponse(responseCode = "403", description = "Acceso denegado (requiere ROL ADMIN)"),
            @ApiResponse(responseCode = "409", description = "Nombre o slug duplicado")
    })
    public ResponseEntity<CategoriaResponse> crearCategoria(@Valid @RequestBody CategoriaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(catalogoService.crearCategoria(request));
    }

    @DeleteMapping("/{id}")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(
            summary = "Eliminar categoría",
            description = "Elimina una categoría si no es protegida por el sistema (es_sistema = false). **Permiso requerido: ROL ADMIN.**"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Categoría eliminada con éxito"),
            @ApiResponse(responseCode = "400", description = "No se puede eliminar una categoría protegida del sistema"),
            @ApiResponse(responseCode = "403", description = "Acceso denegado (requiere ROL ADMIN)")
    })
    public ResponseEntity<Map<String, String>> eliminarCategoria(@PathVariable Short id) {
        catalogoService.eliminarCategoria(id);
        return ResponseEntity.ok(Map.of("mensaje", "Categoría eliminada correctamente"));
    }
}
