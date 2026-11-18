package cl.offlinearchive.catalogo.repository;

import cl.offlinearchive.catalogo.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    Optional<Producto> findByCodigo(String codigo);
    boolean existsByCodigo(String codigo);

    List<Producto> findByVisibleTrue();

    @Query("SELECT p FROM Producto p JOIN FETCH p.categoria WHERE p.visible = true")
    List<Producto> findAllVisibleWithCategoria();

    @Query("SELECT p FROM Producto p JOIN FETCH p.categoria WHERE p.visible = true AND p.categoria.slug = :slug")
    List<Producto> findByVisibleTrueAndCategoriaSlug(@Param("slug") String slug);

    @Query("SELECT p FROM Producto p JOIN FETCH p.categoria")
    List<Producto> findAllWithCategoria();
}
