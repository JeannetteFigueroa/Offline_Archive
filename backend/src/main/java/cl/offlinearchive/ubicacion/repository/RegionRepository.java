package cl.offlinearchive.ubicacion.repository;

import cl.offlinearchive.ubicacion.entity.Region;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RegionRepository extends JpaRepository<Region, Short> {
}
