package cl.offlinearchive.pedido.repository;

import cl.offlinearchive.pedido.entity.MetodoPago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MetodoPagoRepository extends JpaRepository<MetodoPago, Short> {
    Optional<MetodoPago> findByCodigo(String codigo);
    List<MetodoPago> findByActivoTrue();
}
