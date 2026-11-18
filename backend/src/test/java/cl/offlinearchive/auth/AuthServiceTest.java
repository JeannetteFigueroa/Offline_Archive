package cl.offlinearchive.auth;

import cl.offlinearchive.auth.dto.AuthResponse;
import cl.offlinearchive.auth.dto.LoginRequest;
import cl.offlinearchive.auth.dto.RegistroRequest;
import cl.offlinearchive.auth.jwt.JwtService;
import cl.offlinearchive.auth.service.AuthService;
import cl.offlinearchive.common.exception.BadRequestException;
import cl.offlinearchive.common.exception.ConflictException;
import cl.offlinearchive.usuario.entity.Usuario;
import cl.offlinearchive.usuario.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.repository.query.FluentQuery;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.*;
import java.util.function.Function;

import static org.junit.jupiter.api.Assertions.*;

class AuthServiceTest {

    private AuthService authService;
    private FakeUsuarioRepository usuarioRepository;
    private PasswordEncoder passwordEncoder;
    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        usuarioRepository = new FakeUsuarioRepository();
        passwordEncoder = new BCryptPasswordEncoder();
        jwtService = new JwtService(
                "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970",
                900000,
                604800000
        );
        authService = new AuthService(usuarioRepository, passwordEncoder, jwtService, false);
    }

    @Test
    @DisplayName("Login exitoso emite tokens y cookie HttpOnly")
    void testLoginExitoso() {
        Usuario usuario = new Usuario();
        usuario.setId(1L);
        usuario.setCorreo("admin@gmail.com");
        usuario.setNombre("Admin");
        usuario.setRol("ADMIN");
        usuario.setPasswordHash(passwordEncoder.encode("Admin123"));
        usuario.setActivo(true);
        usuarioRepository.save(usuario);

        MockHttpServletResponse response = new MockHttpServletResponse();
        LoginRequest request = new LoginRequest("admin@gmail.com", "Admin123");

        AuthResponse authResponse = authService.login(request, response);

        assertNotNull(authResponse);
        assertNotNull(authResponse.getAccessToken());
        assertEquals("admin@gmail.com", authResponse.getUsuario().getCorreo());
        assertNotNull(response.getHeader("Set-Cookie"));
        assertTrue(response.getHeader("Set-Cookie").contains("offline_archive_refresh_token="));
    }

    @Test
    @DisplayName("Login con contraseña incorrecta lanza BadCredentialsException")
    void testLoginPasswordIncorrecta() {
        Usuario usuario = new Usuario();
        usuario.setCorreo("admin@gmail.com");
        usuario.setPasswordHash(passwordEncoder.encode("Admin123"));
        usuario.setActivo(true);
        usuarioRepository.save(usuario);

        MockHttpServletResponse response = new MockHttpServletResponse();
        LoginRequest request = new LoginRequest("admin@gmail.com", "WrongPassword");

        assertThrows(BadCredentialsException.class, () -> authService.login(request, response));
    }

    @Test
    @DisplayName("Registro con correo duplicado lanza ConflictException")
    void testRegistroCorreoDuplicado() {
        Usuario usuario = new Usuario();
        usuario.setCorreo("duplicado@duoc.cl");
        usuarioRepository.save(usuario);

        RegistroRequest request = new RegistroRequest();
        request.setNombre("Carlos");
        request.setApellidos("Pérez");
        request.setCorreo("duplicado@duoc.cl");
        request.setTelefono("912345678");
        request.setPassword("Password123");

        MockHttpServletResponse response = new MockHttpServletResponse();

        assertThrows(ConflictException.class, () -> authService.registro(request, response));
    }

    @Test
    @DisplayName("Registro con dominio no permitido lanza BadRequestException")
    void testRegistroDominioInvalido() {
        RegistroRequest request = new RegistroRequest();
        request.setNombre("Carlos");
        request.setApellidos("Pérez");
        request.setCorreo("carlos@yahoo.com");
        request.setTelefono("912345678");
        request.setPassword("Password123");

        MockHttpServletResponse response = new MockHttpServletResponse();

        assertThrows(BadRequestException.class, () -> authService.registro(request, response));
    }

    // Stub en memoria para pruebas ultrarrápidas y deterministas
    static class FakeUsuarioRepository implements UsuarioRepository {
        private final Map<String, Usuario> usuarios = new HashMap<>();
        private long idGen = 1L;

        @Override
        public Optional<Usuario> findByCorreoIgnoreCase(String correo) {
            return Optional.ofNullable(usuarios.get(correo.toLowerCase()));
        }

        @Override
        public boolean existsByCorreoIgnoreCase(String correo) {
            return usuarios.containsKey(correo.toLowerCase());
        }

        @Override
        public <S extends Usuario> S save(S entity) {
            if (entity.getId() == null) {
                entity.setId(idGen++);
            }
            usuarios.put(entity.getCorreo().toLowerCase(), entity);
            return entity;
        }

        @Override public Optional<Usuario> findById(Long id) { return Optional.empty(); }
        @Override public boolean existsById(Long id) { return false; }
        @Override public List<Usuario> findAll() { return new ArrayList<>(usuarios.values()); }
        @Override public List<Usuario> findAllById(Iterable<Long> longs) { return List.of(); }
        @Override public long count() { return usuarios.size(); }
        @Override public void deleteById(Long id) {}
        @Override public void delete(Usuario entity) {}
        @Override public void deleteAllById(Iterable<? extends Long> longs) {}
        @Override public void deleteAll(Iterable<? extends Usuario> entities) {}
        @Override public void deleteAll() { usuarios.clear(); }
        @Override public void flush() {}
        @Override public <S extends Usuario> S saveAndFlush(S entity) { return save(entity); }
        @Override public <S extends Usuario> List<S> saveAllAndFlush(Iterable<S> entities) { return List.of(); }
        @Override public void deleteAllInBatch(Iterable<Usuario> entities) {}
        @Override public void deleteAllByIdInBatch(Iterable<Long> longs) {}
        @Override public void deleteAllInBatch() {}
        @Override public Usuario getOne(Long aLong) { return null; }
        @Override public Usuario getById(Long aLong) { return null; }
        @Override public Usuario getReferenceById(Long aLong) { return null; }
        @Override public <S extends Usuario> Optional<S> findOne(Example<S> example) { return Optional.empty(); }
        @Override public <S extends Usuario> List<S> findAll(Example<S> example) { return List.of(); }
        @Override public <S extends Usuario> List<S> findAll(Example<S> example, Sort sort) { return List.of(); }
        @Override public <S extends Usuario> Page<S> findAll(Example<S> example, Pageable pageable) { return null; }
        @Override public <S extends Usuario> long count(Example<S> example) { return 0; }
        @Override public <S extends Usuario> boolean exists(Example<S> example) { return false; }
        @Override public <S extends Usuario, R> R findBy(Example<S> example, Function<FluentQuery.FetchableFluentQuery<S>, R> queryFunction) { return null; }
        @Override public <S extends Usuario> List<S> saveAll(Iterable<S> entities) { return List.of(); }
        @Override public List<Usuario> findAll(Sort sort) { return List.of(); }
        @Override public Page<Usuario> findAll(Pageable pageable) { return null; }
    }
}
