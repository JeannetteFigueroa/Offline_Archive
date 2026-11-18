package cl.offlinearchive.auth.controller;

import cl.offlinearchive.auth.dto.AuthResponse;
import cl.offlinearchive.auth.dto.LoginRequest;
import cl.offlinearchive.auth.dto.RegistroRequest;
import cl.offlinearchive.auth.dto.UsuarioResponse;
import cl.offlinearchive.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@Tag(name = "Autenticación", description = "Gestión de sesiones, registro y tokens JWT (Access y Refresh Tokens)")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión", description = "Autentica credenciales y retorna un Access Token en el body y un Refresh Token en Cookie HttpOnly.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Autenticación exitosa"),
            @ApiResponse(responseCode = "401", description = "Credenciales incorrectas"),
            @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos")
    })
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response
    ) {
        AuthResponse authResponse = authService.login(request, response);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/registro")
    @Operation(summary = "Registrar nuevo cliente", description = "Crea una cuenta con rol CLIENTE, encripta la clave con BCrypt y retorna sesión iniciada.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Usuario registrado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos o dominio de correo no permitido"),
            @ApiResponse(responseCode = "409", description = "El correo ya se encuentra registrado")
    })
    public ResponseEntity<AuthResponse> registro(
            @Valid @RequestBody RegistroRequest request,
            HttpServletResponse response
    ) {
        AuthResponse authResponse = authService.registro(request, response);
        return ResponseEntity.status(HttpStatus.CREATED).body(authResponse);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Renovar sesión (Access Token)", description = "Lee la Cookie HttpOnly del Refresh Token, lo valida y emite un nuevo Access Token con rotación.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Sesión renovada con éxito"),
            @ApiResponse(responseCode = "401", description = "Refresh Token inválido o expirado")
    })
    public ResponseEntity<AuthResponse> refresh(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        AuthResponse authResponse = authService.refresh(request, response);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/logout")
    @Operation(summary = "Cerrar sesión", description = "Invalida la sesión eliminando la Cookie HttpOnly del Refresh Token.")
    @ApiResponse(responseCode = "200", description = "Sesión cerrada correctamente")
    public ResponseEntity<Map<String, String>> logout(HttpServletResponse response) {
        authService.logout(response);
        return ResponseEntity.ok(Map.of("mensaje", "Sesión cerrada exitosamente"));
    }

    @GetMapping("/perfil")
    @Operation(summary = "Consultar perfil del usuario autenticado", description = "Retorna los datos de la cuenta activa a partir del Access Token.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Perfil obtenido"),
            @ApiResponse(responseCode = "401", description = "No autenticado o token vencido")
    })
    public ResponseEntity<UsuarioResponse> perfil(@AuthenticationPrincipal String correo) {
        if (correo == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UsuarioResponse usuario = authService.obtenerPerfil(correo);
        return ResponseEntity.ok(usuario);
    }

    @PostMapping("/cambiar-password")
    @Operation(summary = "Cambiar contraseña del usuario autenticado", description = "Verifica la contraseña actual y actualiza la contraseña en PostgreSQL usando BCrypt.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Contraseña actualizada exitosamente"),
            @ApiResponse(responseCode = "400", description = "Contraseña actual incorrecta o formato inválido"),
            @ApiResponse(responseCode = "401", description = "No autenticado")
    })
    public ResponseEntity<Map<String, String>> cambiarPassword(
            @AuthenticationPrincipal String correo,
            @Valid @RequestBody cl.offlinearchive.auth.dto.CambiarPasswordRequest request
    ) {
        if (correo == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        authService.cambiarPassword(correo, request);
        return ResponseEntity.ok(Map.of("mensaje", "Contraseña actualizada exitosamente."));
    }
}
