package cl.offlinearchive.ubicacion.controller;

import cl.offlinearchive.ubicacion.dto.RegionConComunasResponse;
import cl.offlinearchive.ubicacion.entity.Comuna;
import cl.offlinearchive.ubicacion.entity.Region;
import cl.offlinearchive.ubicacion.repository.ComunaRepository;
import cl.offlinearchive.ubicacion.repository.RegionRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/ubicaciones")
@Tag(name = "Ubicaciones - Regiones y Comunas", description = "Endpoints de cobertura territorial para formularios de despacho y registro")
public class UbicacionController {

    private final RegionRepository regionRepository;
    private final ComunaRepository comunaRepository;

    public UbicacionController(RegionRepository regionRepository, ComunaRepository comunaRepository) {
        this.regionRepository = regionRepository;
        this.comunaRepository = comunaRepository;
    }

    @GetMapping("/regiones")
    @Operation(
            summary = "Listar regiones con sus comunas asociadas",
            description = "Retorna el listado completo de las 16 regiones de Chile con sus respectivas comunas. **Permiso: Público (sin token).**"
    )
    public ResponseEntity<List<RegionConComunasResponse>> listarRegionesConComunas() {
        List<Region> regiones = regionRepository.findAll();
        List<Comuna> todasComunas = comunaRepository.findAllByOrderByNombreAsc();

        List<RegionConComunasResponse> resultado = regiones.stream().map(reg -> {
            List<String> comunasDeRegion = todasComunas.stream()
                    .filter(c -> c.getRegion().getId().equals(reg.getId()))
                    .map(Comuna::getNombre)
                    .collect(Collectors.toList());
            return new RegionConComunasResponse(reg.getId(), reg.getNombre(), comunasDeRegion);
        }).collect(Collectors.toList());

        return ResponseEntity.ok(resultado);
    }
}
