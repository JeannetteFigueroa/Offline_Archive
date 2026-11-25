package cl.offlinearchive.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "BearerAuth";

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("(Off)line Archive API v1")
                        .version("1.0.0 (v1)")
                        .description("API REST versionada (/api/v1) para la tienda online (Off)line Archive. " +
                                "Permite gestionar el catálogo, pedidos, inventario, usuarios y autenticación segura con JWT.")
                        .contact(new Contact()
                                .name("Equipo de Desarrollo (Off)line Archive")
                                .email("contacto@offlinearchive.cl"))
                        .license(new License().name("Apache 2.0").url("https://springdoc.org")))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME, new SecurityScheme()
                                .name(SECURITY_SCHEME_NAME)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Ingresa el Access Token JWT generado al iniciar sesión (ej: Bearer eyJhbGciOi...)")));
    }
}
