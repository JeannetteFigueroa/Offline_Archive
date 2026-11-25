package cl.offlinearchive.config;

import cl.offlinearchive.auth.jwt.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // 1. Documentación Swagger / OpenAPI
                        .requestMatchers(
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/v3/api-docs"
                        ).permitAll()

                        // 2. Endpoints de autenticación públicos versionados v1
                        .requestMatchers(
                                "/v1/auth/login",
                                "/v1/auth/registro",
                                "/v1/auth/refresh",
                                "/v1/auth/logout"
                        ).permitAll()

                        // 3. Catálogo, ubicaciones y consulta de pedidos públicos en modo lectura (GET)
                        .requestMatchers(HttpMethod.GET, 
                                "/v1/productos/**", 
                                "/v1/categorias/**", 
                                "/v1/ubicaciones/**", 
                                "/v1/pedidos/tipos-entrega", 
                                "/v1/pedidos/metodos-pago", 
                                "/v1/pedidos/{numeroPedido:[A-Z0-9_-]+}"
                        ).permitAll()

                        // 4. Procesamiento de pedidos y formulario de contacto (Público)
                        .requestMatchers(HttpMethod.POST, "/v1/pedidos", "/v1/contacto").permitAll()

                        // 5. Operaciones de escritura en catálogo requieren ROL ADMIN
                        .requestMatchers(HttpMethod.POST, "/v1/productos/**", "/v1/categorias/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/v1/productos/**", "/v1/categorias/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/v1/productos/**", "/v1/categorias/**").hasRole("ADMIN")

                        // 6. Perfil, cambio de contraseña y mis pedidos requieren autenticación
                        .requestMatchers("/v1/auth/perfil", "/v1/auth/cambiar-password", "/v1/pedidos/mis-pedidos").authenticated()

                        // 7. Rutas administrativas
                        .requestMatchers("/v1/admin/**", "/v1/pedidos/admin/**", "/v1/contacto/admin/**").hasRole("ADMIN")

                        // 8. Cualquier otra petición requiere autenticación
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:3000"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "X-Requested-With", "Origin"));
        configuration.setExposedHeaders(List.of("Set-Cookie", "Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
