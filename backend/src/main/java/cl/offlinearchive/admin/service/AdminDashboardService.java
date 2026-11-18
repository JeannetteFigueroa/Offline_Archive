package cl.offlinearchive.admin.service;

import cl.offlinearchive.admin.dto.DashboardEstadisticasResponse;
import cl.offlinearchive.catalogo.entity.Producto;
import cl.offlinearchive.catalogo.repository.CategoriaRepository;
import cl.offlinearchive.catalogo.repository.ProductoRepository;
import cl.offlinearchive.pedido.entity.DetallePedido;
import cl.offlinearchive.pedido.entity.Pedido;
import cl.offlinearchive.pedido.repository.PedidoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminDashboardService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final PedidoRepository pedidoRepository;

    public AdminDashboardService(
            ProductoRepository productoRepository,
            CategoriaRepository categoriaRepository,
            PedidoRepository pedidoRepository) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
        this.pedidoRepository = pedidoRepository;
    }

    @Transactional(readOnly = true)
    public DashboardEstadisticasResponse obtenerEstadisticas() {
        DashboardEstadisticasResponse response = new DashboardEstadisticasResponse();

        List<Producto> productos = productoRepository.findAll();
        List<Pedido> pedidos = pedidoRepository.findAll();

        response.setTotalProductos(productos.size());
        response.setProductosVisibles(productos.stream().filter(Producto::isVisible).count());
        response.setProductosSinStock(productos.stream().filter(p -> p.getStock() == null || p.getStock() <= 0).count());
        response.setTotalCategorias(categoriaRepository.count());

        response.setTotalPedidos(pedidos.size());
        response.setPedidosPendientes(pedidos.stream()
                .filter(p -> p.getEstado() != null && "PENDIENTE".equalsIgnoreCase(p.getEstado().getCodigo()))
                .count());
        response.setPedidosConfirmados(pedidos.stream()
                .filter(p -> p.getEstado() != null && !"CANCELADO".equalsIgnoreCase(p.getEstado().getCodigo()))
                .count());

        long ingresos = pedidos.stream()
                .filter(p -> p.getEstado() != null && !"CANCELADO".equalsIgnoreCase(p.getEstado().getCodigo()))
                .mapToLong(p -> p.getTotal() != null ? p.getTotal() : 0)
                .sum();
        response.setTotalIngresos(ingresos);

        // Top 5 Productos más vendidos
        Map<String, Integer> conteoProductos = new HashMap<>();
        for (Pedido p : pedidos) {
            if (p.getEstado() != null && !"CANCELADO".equalsIgnoreCase(p.getEstado().getCodigo())) {
                for (DetallePedido d : p.getDetalles()) {
                    conteoProductos.merge(d.getNombreProducto(), d.getCantidad(), Integer::sum);
                }
            }
        }

        List<Map<String, Object>> topProductos = conteoProductos.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(5)
                .map(e -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("nombre", e.getKey());
                    map.put("cantidad", e.getValue());
                    return map;
                })
                .collect(Collectors.toList());
        response.setProductosMasVendidos(topProductos);

        // Pedidos agrupados por Mes
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
        Map<String, Long> pedidosMes = pedidos.stream()
                .filter(p -> p.getFecha() != null)
                .collect(Collectors.groupingBy(p -> p.getFecha().format(formatter), Collectors.counting()));

        List<Map<String, Object>> pedidosPorMesList = pedidosMes.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("mes", e.getKey());
                    map.put("total", e.getValue());
                    return map;
                })
                .collect(Collectors.toList());
        response.setPedidosPorMes(pedidosPorMesList);

        return response;
    }
}
