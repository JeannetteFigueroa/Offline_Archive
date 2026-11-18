package cl.offlinearchive.catalogo.repository;

import cl.offlinearchive.catalogo.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Short> {
    Optional<Categoria> findBySlug(String slug);
    boolean existsBySlug(String slug);
    boolean existsByNombreIgnoreCase(String nombre);
}
