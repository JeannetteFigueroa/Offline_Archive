package cl.offlinearchive.admin.controller;

import cl.offlinearchive.admin.dto.DashboardEstadisticasResponse;
import cl.offlinearchive.admin.service.AdminDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/dashboard")
@Tag(name = "Administración - Dashboard", description = "Métricas comerciales y estadísticas calculadas desde PostgreSQL")
@SecurityRequirement(name = "BearerAuth")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    public AdminDashboardController(AdminDashboardService adminDashboardService) {
        this.adminDashboardService = adminDashboardService;
    }

    @GetMapping
    @Operation(
            summary = "Obtener estadísticas comerciales del Dashboard",
            description = "Calcula totales de inventario, ventas, ingresos y ranking de productos más vendidos desde PostgreSQL. **Permiso requerido: ROL ADMIN.**"
    )
    public ResponseEntity<DashboardEstadisticasResponse> obtenerEstadisticas() {
        return ResponseEntity.ok(adminDashboardService.obtenerEstadisticas());
    }
}
