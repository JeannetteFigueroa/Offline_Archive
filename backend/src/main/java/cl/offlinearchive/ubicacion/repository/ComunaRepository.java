package cl.offlinearchive.ubicacion.repository;

import cl.offlinearchive.ubicacion.entity.Comuna;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComunaRepository extends JpaRepository<Comuna, Short> {
    List<Comuna> findByRegionIdOrderByNombreAsc(Short regionId);
    List<Comuna> findAllByOrderByNombreAsc();
}
