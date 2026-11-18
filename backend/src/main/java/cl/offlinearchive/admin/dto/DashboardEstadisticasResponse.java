package cl.offlinearchive.admin.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import java.util.Map;

@Schema(description = "Métricas estadísticas consolidadas del Dashboard Administrativo")
public class DashboardEstadisticasResponse {

    private long totalProductos;
    private long productosVisibles;
    private long productosSinStock;
    private long totalCategorias;
    private long totalPedidos;
    private long pedidosPendientes;
    private long pedidosConfirmados;
    private long totalIngresos;
    private List<Map<String, Object>> productosMasVendidos;
    private List<Map<String, Object>> pedidosPorMes;

    public DashboardEstadisticasResponse() {}

    public long getTotalProductos() { return totalProductos; }
    public void setTotalProductos(long totalProductos) { this.totalProductos = totalProductos; }

    public long getProductosVisibles() { return productosVisibles; }
    public void setProductosVisibles(long productosVisibles) { this.productosVisibles = productosVisibles; }

    public long getProductosSinStock() { return productosSinStock; }
    public void setProductosSinStock(long productosSinStock) { this.productosSinStock = productosSinStock; }

    public long getTotalCategorias() { return totalCategorias; }
    public void setTotalCategorias(long totalCategorias) { this.totalCategorias = totalCategorias; }

    public long getTotalPedidos() { return totalPedidos; }
    public void setTotalPedidos(long totalPedidos) { this.totalPedidos = totalPedidos; }

    public long getPedidosPendientes() { return pedidosPendientes; }
    public void setPedidosPendientes(long pedidosPendientes) { this.pedidosPendientes = pedidosPendientes; }

    public long getPedidosConfirmados() { return pedidosConfirmados; }
    public void setPedidosConfirmados(long pedidosConfirmados) { this.pedidosConfirmados = pedidosConfirmados; }

    public long getTotalIngresos() { return totalIngresos; }
    public void setTotalIngresos(long totalIngresos) { this.totalIngresos = totalIngresos; }

    public List<Map<String, Object>> getProductosMasVendidos() { return productosMasVendidos; }
    public void setProductosMasVendidos(List<Map<String, Object>> productosMasVendidos) { this.productosMasVendidos = productosMasVendidos; }

    public List<Map<String, Object>> getPedidosPorMes() { return pedidosPorMes; }
    public void setPedidosPorMes(List<Map<String, Object>> pedidosPorMes) { this.pedidosPorMes = pedidosPorMes; }
}
