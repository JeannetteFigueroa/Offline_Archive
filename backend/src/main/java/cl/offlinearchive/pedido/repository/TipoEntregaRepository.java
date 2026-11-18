package cl.offlinearchive.pedido.repository;

import cl.offlinearchive.pedido.entity.TipoEntrega;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TipoEntregaRepository extends JpaRepository<TipoEntrega, Short> {
    Optional<TipoEntrega> findByCodigo(String codigo);
    List<TipoEntrega> findByActivoTrue();
}
