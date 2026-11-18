package cl.offlinearchive.pedido.controller;

import cl.offlinearchive.pedido.dto.ActualizarEstadoPedidoRequest;
import cl.offlinearchive.pedido.dto.CrearPedidoRequest;
import cl.offlinearchive.pedido.dto.PedidoResponse;
import cl.offlinearchive.pedido.entity.MetodoPago;
import cl.offlinearchive.pedido.entity.TipoEntrega;
import cl.offlinearchive.pedido.service.PedidoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pedidos")
@Tag(name = "Pedidos y Checkout", description = "Endpoints para procesamiento de órdenes de compra, pagos y seguimiento de pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @PostMapping
    @Operation(
            summary = "Procesar orden de compra (Checkout)",
            description = "Registra un pedido, valida stock disponible, calcula montos y descuenta inventario mediante triggers de PostgreSQL. **Permiso: Público y Clientes Autenticados.**"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Pedido creado y pago simulado exitoso"),
            @ApiResponse(responseCode = "400", description = "Stock insuficiente, datos inválidos o comuna no encontrada")
    })
    public ResponseEntity<PedidoResponse> crearPedido(
            @Valid @RequestBody CrearPedidoRequest request,
            @AuthenticationPrincipal String correoUsuario
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(pedidoService.crearPedido(request, correoUsuario));
    }

    @GetMapping("/mis-pedidos")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(
            summary = "Consultar historial de pedidos del cliente autenticado",
            description = "Retorna todas las órdenes de compra asociadas al usuario en sesión. **Permiso requerido: Autenticado (CLIENTE o ADMIN).**"
    )
    public ResponseEntity<List<PedidoResponse>> misPedidos(@AuthenticationPrincipal String correoUsuario) {
        return ResponseEntity.ok(pedidoService.listarMisPedidos(correoUsuario));
    }

    @GetMapping("/admin")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(
            summary = "Listar todas las órdenes de compra (Admin)",
            description = "Consulta la totalidad de pedidos del sistema ordenados del más reciente al más antiguo. **Permiso requerido: ROL ADMIN.**"
    )
    public ResponseEntity<List<PedidoResponse>> listarPedidosAdmin() {
        return ResponseEntity.ok(pedidoService.listarTodosLosPedidosAdmin());
    }

    @PatchMapping("/admin/{id}/estado")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(
            summary = "Actualizar estado de un pedido (Admin)",
            description = "Modifica el estado de un pedido (ej: CONFIRMADO, EN_PREPARACION, ENVIADO, ENTREGADO, CANCELADO). **Permiso requerido: ROL ADMIN.**"
    )
    public ResponseEntity<PedidoResponse> actualizarEstadoPedido(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarEstadoPedidoRequest request
    ) {
        return ResponseEntity.ok(pedidoService.actualizarEstadoPedido(id, request.getEstadoCodigo()));
    }

    @GetMapping("/{numeroPedido}")
    @Operation(
            summary = "Consultar estado de pedido por número de seguimiento",
            description = "Permite a un cliente o admin consultar un pedido por su código (ej: OFF-000001). **Permiso: Público.**"
    )
    public ResponseEntity<PedidoResponse> obtenerPorNumero(@PathVariable String numeroPedido) {
        return ResponseEntity.ok(pedidoService.obtenerPorNumero(numeroPedido));
    }

    @GetMapping("/tipos-entrega")
    @Operation(
            summary = "Listar opciones de entrega disponibles",
            description = "Retorna opciones de despacho (domicilio, retiro en tienda) y sus costos. **Permiso: Público.**"
    )
    public ResponseEntity<List<TipoEntrega>> listarTiposEntrega() {
        return ResponseEntity.ok(pedidoService.listarTiposEntrega());
    }

    @GetMapping("/metodos-pago")
    @Operation(
            summary = "Listar métodos de pago admitidos",
            description = "Retorna los medios de pago disponibles (Débito, Crédito, Transferencia). **Permiso: Público.**"
    )
    public ResponseEntity<List<MetodoPago>> listarMetodosPago() {
        return ResponseEntity.ok(pedidoService.listarMetodosPago());
    }
}
