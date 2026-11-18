package cl.offlinearchive.pedido.repository;

import cl.offlinearchive.pedido.entity.EstadoPedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EstadoPedidoRepository extends JpaRepository<EstadoPedido, Short> {
    Optional<EstadoPedido> findByCodigo(String codigo);
}
