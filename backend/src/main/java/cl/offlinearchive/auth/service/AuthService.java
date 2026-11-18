package cl.offlinearchive.auth.service;

import cl.offlinearchive.auth.dto.AuthResponse;
import cl.offlinearchive.auth.dto.LoginRequest;
import cl.offlinearchive.auth.dto.RegistroRequest;
import cl.offlinearchive.auth.dto.UsuarioResponse;
import cl.offlinearchive.auth.jwt.JwtService;
import cl.offlinearchive.common.exception.BadRequestException;
import cl.offlinearchive.common.exception.ConflictException;
import cl.offlinearchive.usuario.entity.Usuario;
import cl.offlinearchive.usuario.repository.UsuarioRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;

@Service
public class AuthService {

    private static final String REFRESH_COOKIE_NAME = "offline_archive_refresh_token";

    private static final List<String> ALLOWED_EMAIL_DOMAINS = List.of(
            "@duoc.cl",
            "@profesor.duoc.cl",
            "@gmail.com"
    );

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final boolean isSecureCookie;

    public AuthService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            @Value("${app.jwt.cookie-secure:false}") boolean isSecureCookie
    ) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.isSecureCookie = isSecureCookie;
    }

    @Transactional
    public AuthResponse login(LoginRequest request, HttpServletResponse response) {
        String correo = request.getCorreo().trim().toLowerCase();

        Usuario usuario = usuarioRepository.findByCorreoIgnoreCase(correo)
                .orElseThrow(() -> new BadCredentialsException("Credenciales inválidas."));

        if (!passwordEncoder.matches(request.getPassword(), usuario.getPasswordHash())) {
            throw new BadCredentialsException("Credenciales inválidas.");
        }

        if (Boolean.FALSE.equals(usuario.getActivo())) {
            throw new BadRequestException("La cuenta de usuario se encuentra inactiva.");
        }

        return emitTokensAndBuildResponse(usuario, response);
    }

    @Transactional
    public AuthResponse registro(RegistroRequest request, HttpServletResponse response) {
        String correo = request.getCorreo().trim().toLowerCase();

        // Validación de dominios requerida por la tienda
        boolean domainValid = ALLOWED_EMAIL_DOMAINS.stream().anyMatch(correo::endsWith);
        if (!domainValid) {
            throw new BadRequestException("Solo se permiten correos @duoc.cl, @profesor.duoc.cl y @gmail.com");
        }

        // Regla de negocio: Fecha de nacimiento válida (no futura y edad mínima 10 años)
        if (request.getFechaNacimiento() != null) {
            LocalDate hoy = LocalDate.now();
            if (request.getFechaNacimiento().isAfter(hoy)) {
                throw new BadRequestException("La fecha de nacimiento no puede ser una fecha futura.");
            }
            if (request.getFechaNacimiento().isAfter(hoy.minusYears(10))) {
                throw new BadRequestException("Debes tener al menos 10 años para registrarte en la plataforma.");
            }
            if (request.getFechaNacimiento().isBefore(hoy.minusYears(120))) {
                throw new BadRequestException("Por favor ingresa una fecha de nacimiento válida.");
            }
        }

        if (usuarioRepository.existsByCorreoIgnoreCase(correo)) {
            throw new ConflictException("El correo ya se encuentra registrado.");
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre().trim());
        usuario.setApellidos(request.getApellidos().trim());
        usuario.setCorreo(correo);
        usuario.setTelefono(request.getTelefono().trim());
        usuario.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        usuario.setFechaNacimiento(request.getFechaNacimiento());
        usuario.setRol("CLIENTE"); // Seguridad: nunca permitir registro directo como ADMIN
        usuario.setActivo(true);
        usuario.setTerminosAceptadosAt(Boolean.TRUE.equals(request.getTerminosAceptados()) ? OffsetDateTime.now() : null);

        Usuario guardado = usuarioRepository.save(usuario);

        return emitTokensAndBuildResponse(guardado, response);
    }

    public AuthResponse refresh(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = extractRefreshTokenFromCookies(request);

        if (refreshToken == null || !jwtService.isRefreshTokenValid(refreshToken)) {
            throw new BadCredentialsException("Refresh token inválido, expirado o inexistente.");
        }

        String correo = jwtService.extractUsername(refreshToken);
        Usuario usuario = usuarioRepository.findByCorreoIgnoreCase(correo)
                .orElseThrow(() -> new BadCredentialsException("El usuario ya no existe."));

        if (Boolean.FALSE.equals(usuario.getActivo())) {
            throw new BadRequestException("La cuenta de usuario se encuentra inactiva.");
        }

        // Rotación de tokens: se emite nuevo Access Token y nuevo Refresh Token
        return emitTokensAndBuildResponse(usuario, response);
    }

    public void logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(isSecureCookie)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        SecurityContextHolder.clearContext();
    }

    @Transactional(readOnly = true)
    public UsuarioResponse obtenerPerfil(String correo) {
        Usuario usuario = usuarioRepository.findByCorreoIgnoreCase(correo)
                .orElseThrow(() -> new BadRequestException("Usuario no encontrado."));

        return new UsuarioResponse(usuario);
    }

    @Transactional
    public void cambiarPassword(String correo, cl.offlinearchive.auth.dto.CambiarPasswordRequest request) {
        Usuario usuario = usuarioRepository.findByCorreoIgnoreCase(correo)
                .orElseThrow(() -> new BadRequestException("Usuario no encontrado."));

        if (!passwordEncoder.matches(request.getPasswordActual(), usuario.getPasswordHash())) {
            throw new BadRequestException("La contraseña actual no es correcta.");
        }

        if (passwordEncoder.matches(request.getNuevaPassword(), usuario.getPasswordHash())) {
            throw new BadRequestException("La nueva contraseña debe ser diferente a la contraseña actual.");
        }

        usuario.setPasswordHash(passwordEncoder.encode(request.getNuevaPassword()));
        usuarioRepository.save(usuario);
    }

    private AuthResponse emitTokensAndBuildResponse(Usuario usuario, HttpServletResponse response) {
        String accessToken = jwtService.generateAccessToken(
                usuario.getCorreo(),
                usuario.getId(),
                usuario.getRol(),
                usuario.getNombre()
        );

        String refreshToken = jwtService.generateRefreshToken(usuario.getCorreo());

        long maxAgeSeconds = jwtService.getRefreshTokenExpirationMs() / 1000;

        ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE_NAME, refreshToken)
                .httpOnly(true)
                .secure(isSecureCookie)
                .path("/")
                .maxAge(maxAgeSeconds)
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return new AuthResponse(accessToken, new UsuarioResponse(usuario));
    }

    private String extractRefreshTokenFromCookies(HttpServletRequest request) {
        if (request.getCookies() == null) return null;

        return Arrays.stream(request.getCookies())
                .filter(c -> REFRESH_COOKIE_NAME.equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }
}
