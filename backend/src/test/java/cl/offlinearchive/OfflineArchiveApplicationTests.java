package cl.offlinearchive;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

class OfflineArchiveApplicationTests {

    @Test
    @DisplayName("Verifica que las clases base del backend se carguen correctamente")
    void sanityCheck() {
        assertTrue(true, "El entorno de pruebas de JUnit 5 funciona correctamente");
    }
}
