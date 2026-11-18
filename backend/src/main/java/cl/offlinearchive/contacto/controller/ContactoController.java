package cl.offlinearchive.contacto.controller;

import cl.offlinearchive.common.exception.BadRequestException;
import cl.offlinearchive.contacto.dto.MensajeContactoRequest;
import cl.offlinearchive.contacto.dto.MensajeContactoResponse;
import cl.offlinearchive.contacto.entity.MensajeContacto;
import cl.offlinearchive.contacto.repository.MensajeContactoRepository;
import cl.offlinearchive.usuario.entity.Usuario;
import cl.offlinearchive.usuario.repository.UsuarioRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/contacto")
@Tag(name = "Contacto y Soporte", description = "Endpoints para envío de consultas ciudadanas y bandeja de entrada de administrador")
public class ContactoController {

    private final MensajeContactoRepository mensajeContactoRepository;
    private final UsuarioRepository usuarioRepository;

    public ContactoController(MensajeContactoRepository mensajeContactoRepository, UsuarioRepository usuarioRepository) {
        this.mensajeContactoRepository = mensajeContactoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping
    @Operation(
            summary = "Enviar mensaje de contacto / soporte",
            description = "Permite a cualquier visitante o cliente enviar una consulta al equipo. **Permiso: Público.**"
    )
    public ResponseEntity<Map<String, String>> enviarMensaje(
            @Valid @RequestBody MensajeContactoRequest request,
            @AuthenticationPrincipal String correoUsuario
    ) {
        Usuario usuario = null;
        if (correoUsuario != null && !correoUsuario.isBlank()) {
            usuario = usuarioRepository.findByCorreoIgnoreCase(correoUsuario).orElse(null);
        }

        MensajeContacto m = new MensajeContacto();
        m.setUsuario(usuario);
        m.setNombre(request.getNombre().trim());
        m.setCorreo(request.getCorreo().trim().toLowerCase());
        m.setAsunto(request.getAsunto().trim());
        m.setMensaje(request.getMensaje().trim());

        mensajeContactoRepository.save(m);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("mensaje", "Tu mensaje ha sido recibido con éxito."));
    }

    @GetMapping("/admin")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(
            summary = "Bandeja de entrada de mensajes de contacto",
            description = "Consulta la totalidad de mensajes recibidos de clientes. **Permiso requerido: ROL ADMIN.**"
    )
    public ResponseEntity<List<MensajeContactoResponse>> listarMensajesAdmin() {
        List<MensajeContactoResponse> responses = mensajeContactoRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(MensajeContactoResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PatchMapping("/admin/{id}/leido")
    @SecurityRequirement(name = "BearerAuth")
    @Operation(
            summary = "Marcar mensaje como leído",
            description = "Actualiza el estado de lectura de un mensaje de contacto. **Permiso requerido: ROL ADMIN.**"
    )
    public ResponseEntity<Map<String, String>> marcarComoLeido(@PathVariable Long id) {
        MensajeContacto m = mensajeContactoRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Mensaje no encontrado con id: " + id));
        m.setLeido(true);
        mensajeContactoRepository.save(m);
        return ResponseEntity.ok(Map.of("mensaje", "Mensaje marcado como leído."));
    }
}
