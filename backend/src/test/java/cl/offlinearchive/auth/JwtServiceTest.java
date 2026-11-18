package cl.offlinearchive.auth;

import cl.offlinearchive.auth.jwt.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(
                "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970",
                900000,   // 15 min
                604800000 // 7 días
        );
    }

    @Test
    @DisplayName("Genera y valida un Access Token correctamente")
    void testGenerateAndValidateAccessToken() {
        String token = jwtService.generateAccessToken("cliente@duoc.cl", 1L, "CLIENTE", "Juan");

        assertNotNull(token);
        assertTrue(jwtService.isAccessTokenValid(token));
        assertFalse(jwtService.isRefreshTokenValid(token));
        assertEquals("cliente@duoc.cl", jwtService.extractUsername(token));
        assertEquals("CLIENTE", jwtService.extractRol(token));
        assertEquals("ACCESS", jwtService.extractType(token));
    }

    @Test
    @DisplayName("Genera y valida un Refresh Token correctamente")
    void testGenerateAndValidateRefreshToken() {
        String token = jwtService.generateRefreshToken("cliente@duoc.cl");

        assertNotNull(token);
        assertTrue(jwtService.isRefreshTokenValid(token));
        assertFalse(jwtService.isAccessTokenValid(token));
        assertEquals("cliente@duoc.cl", jwtService.extractUsername(token));
        assertEquals("REFRESH", jwtService.extractType(token));
    }
}
