package cl.offlinearchive.config;

import cl.offlinearchive.usuario.entity.Usuario;
import cl.offlinearchive.usuario.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminDataLoader {

    private static final Logger log = LoggerFactory.getLogger(AdminDataLoader.class);

    @Bean
    public CommandLineRunner initAdminUser(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String adminEmail = "admin@gmail.com";
            Usuario admin = usuarioRepository.findByCorreoIgnoreCase(adminEmail).orElse(null);

            if (admin == null) {
                log.info("Inicializando usuario administrador: {}", adminEmail);
                admin = new Usuario();
                admin.setNombre("Admin");
                admin.setApellidos("Offline");
                admin.setCorreo(adminEmail);
                admin.setTelefono("912345678");
                admin.setRol("ADMIN");
                admin.setActivo(true);
            } else {
                admin.setRol("ADMIN");
                admin.setActivo(true);
            }

            // Asegurar que la contraseña de admin sea válida y compatible con el PasswordEncoder activo
            admin.setPasswordHash(passwordEncoder.encode("Admin123"));
            usuarioRepository.save(admin);
            log.info("Usuario administrador listo y activo para autenticación: correo={}, rol={}", admin.getCorreo(), admin.getRol());
        };
    }
}
