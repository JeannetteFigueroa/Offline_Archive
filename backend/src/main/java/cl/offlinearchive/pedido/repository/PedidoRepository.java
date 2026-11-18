package cl.offlinearchive.pedido.repository;

import cl.offlinearchive.pedido.entity.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    @Query("SELECT p FROM Pedido p " +
           "JOIN FETCH p.estado " +
           "JOIN FETCH p.tipoEntrega " +
           "JOIN FETCH p.comuna " +
           "LEFT JOIN FETCH p.usuario " +
           "WHERE p.id = :id")
    Optional<Pedido> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT p FROM Pedido p " +
           "JOIN FETCH p.estado " +
           "JOIN FETCH p.tipoEntrega " +
           "JOIN FETCH p.comuna " +
           "WHERE p.numeroPedido = :numeroPedido")
    Optional<Pedido> findByNumeroPedido(@Param("numeroPedido") String numeroPedido);

    @Query("SELECT p FROM Pedido p " +
           "JOIN FETCH p.estado " +
           "JOIN FETCH p.tipoEntrega " +
           "JOIN FETCH p.comuna " +
           "WHERE p.usuario.id = :usuarioId ORDER BY p.fecha DESC")
    List<Pedido> findByUsuarioIdOrderByFechaDesc(@Param("usuarioId") Long usuarioId);

    @Query("SELECT p FROM Pedido p " +
           "JOIN FETCH p.estado " +
           "JOIN FETCH p.tipoEntrega " +
           "JOIN FETCH p.comuna " +
           "ORDER BY p.fecha DESC")
    List<Pedido> findAllOrderByFechaDesc();
}
