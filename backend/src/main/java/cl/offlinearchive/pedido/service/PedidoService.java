package cl.offlinearchive.pedido.service;

import cl.offlinearchive.catalogo.entity.Producto;
import cl.offlinearchive.catalogo.repository.ProductoRepository;
import cl.offlinearchive.common.exception.BadRequestException;
import cl.offlinearchive.pedido.dto.CrearPedidoRequest;
import cl.offlinearchive.pedido.dto.ItemPedidoRequest;
import cl.offlinearchive.pedido.dto.PedidoResponse;
import cl.offlinearchive.pedido.entity.*;
import cl.offlinearchive.pedido.repository.*;
import cl.offlinearchive.ubicacion.entity.Comuna;
import cl.offlinearchive.ubicacion.repository.ComunaRepository;
import cl.offlinearchive.usuario.entity.Usuario;
import cl.offlinearchive.usuario.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final EstadoPedidoRepository estadoPedidoRepository;
    private final TipoEntregaRepository tipoEntregaRepository;
    private final MetodoPagoRepository metodoPagoRepository;
    private final PagoRepository pagoRepository;
    private final ProductoRepository productoRepository;
    private final ComunaRepository comunaRepository;
    private final UsuarioRepository usuarioRepository;

    public PedidoService(
            PedidoRepository pedidoRepository,
            EstadoPedidoRepository estadoPedidoRepository,
            TipoEntregaRepository tipoEntregaRepository,
            MetodoPagoRepository metodoPagoRepository,
            PagoRepository pagoRepository,
            ProductoRepository productoRepository,
            ComunaRepository comunaRepository,
            UsuarioRepository usuarioRepository) {
        this.pedidoRepository = pedidoRepository;
        this.estadoPedidoRepository = estadoPedidoRepository;
        this.tipoEntregaRepository = tipoEntregaRepository;
        this.metodoPagoRepository = metodoPagoRepository;
        this.pagoRepository = pagoRepository;
        this.productoRepository = productoRepository;
        this.comunaRepository = comunaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public PedidoResponse crearPedido(CrearPedidoRequest request, String correoUsuarioAutenticado) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("El pedido debe contener al menos un producto.");
        }

        // 1. Resolver usuario (opcional si compra como invitado o autenticado)
        Usuario usuario = null;
        if (correoUsuarioAutenticado != null && !correoUsuarioAutenticado.isBlank()) {
            usuario = usuarioRepository.findByCorreoIgnoreCase(correoUsuarioAutenticado).orElse(null);
        }

        // 2. Resolver Estado inicial (PENDIENTE o CONFIRMADO)
        EstadoPedido estadoInicial = estadoPedidoRepository.findByCodigo("CONFIRMADO")
                .or(() -> estadoPedidoRepository.findByCodigo("PENDIENTE"))
                .orElseThrow(() -> new BadRequestException("Estado inicial de pedido no configurado en BD."));

        // 3. Resolver Tipo de Entrega
        String tipoCodigo = request.getTipoEntregaCodigo().trim().toUpperCase();
        TipoEntrega tipoEntrega = tipoEntregaRepository.findByCodigo(tipoCodigo)
                .orElseThrow(() -> new BadRequestException("Tipo de entrega no válido: " + request.getTipoEntregaCodigo()));

        // 4. Resolver Comuna
        Comuna comuna = null;
        if (request.getComunaId() != null) {
            comuna = comunaRepository.findById(request.getComunaId()).orElse(null);
        }
        if (comuna == null && request.getComunaNombre() != null && !request.getComunaNombre().isBlank()) {
            List<Comuna> comunas = comunaRepository.findAllByOrderByNombreAsc();
            comuna = comunas.stream()
                    .filter(c -> c.getNombre().equalsIgnoreCase(request.getComunaNombre().trim()))
                    .findFirst()
                    .orElse(null);
        }
        if (comuna == null) {
            // Comuna por defecto (Santiago)
            comuna = comunaRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new BadRequestException("No hay comunas registradas en la base de datos."));
        }

        // 5. Validar productos, calcular montos y verificar stock
        int subtotal = 0;
        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);
        pedido.setEstado(estadoInicial);
        pedido.setTipoEntrega(tipoEntrega);
        pedido.setComuna(comuna);
        pedido.setClienteNombre(request.getClienteNombre().trim());
        pedido.setClienteCorreo(request.getClienteCorreo().trim().toLowerCase());
        pedido.setClienteTelefono(request.getClienteTelefono().replace(" ", ""));
        pedido.setDireccionEntrega(request.getDireccionEntrega().trim());
        pedido.setCostoEnvio(tipoEntrega.getCosto());

        for (ItemPedidoRequest item : request.getItems()) {
            Producto prod = productoRepository.findById(item.getProductoId())
                    .orElseThrow(() -> new BadRequestException("Producto no encontrado con ID: " + item.getProductoId()));

            // Regla de negocio: Validación estricta de stock
            if (prod.getStock() < item.getCantidad()) {
                throw new BadRequestException("Stock insuficiente para el producto: " + prod.getNombre() + 
                        ". Disponible: " + prod.getStock() + " unidad(es).");
            }

            int precioUnitario = (prod.getPrecioOferta() != null && prod.getPrecioOferta() > 0)
                    ? prod.getPrecioOferta()
                    : prod.getPrecio();

            DetallePedido detalle = new DetallePedido();
            detalle.setPedido(pedido);
            detalle.setProducto(prod);
            detalle.setCodigoProducto(prod.getCodigo());
            detalle.setNombreProducto(prod.getNombre());
            detalle.setPrecioNormal(prod.getPrecio());
            detalle.setPrecioUnitario(precioUnitario);
            detalle.setCantidad(item.getCantidad());

            subtotal += (precioUnitario * item.getCantidad());
            pedido.getDetalles().add(detalle);
        }

        pedido.setSubtotal(subtotal);
        pedido.setTotal(subtotal + tipoEntrega.getCosto());

        // Al guardar el pedido, el trigger de PostgreSQL fn_detalle_registra_venta()
        // descontará automáticamente el stock de la tabla producto
        Pedido pedidoGuardado = pedidoRepository.save(pedido);

        // 6. Registrar pago
        String metodoCodigo = request.getMetodoPagoCodigo().trim().toUpperCase();
        MetodoPago metodoPago = metodoPagoRepository.findByCodigo(metodoCodigo)
                .orElseGet(() -> metodoPagoRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new BadRequestException("Método de pago no disponible.")));

        Pago pago = new Pago();
        pago.setPedido(pedidoGuardado);
        pago.setMetodoPago(metodoPago);
        pago.setMonto(pedidoGuardado.getTotal());
        pago.setEstado("APROBADO");
        pago.setReferenciaExterna("TX-" + System.currentTimeMillis());
        pagoRepository.save(pago);

        return new PedidoResponse(pedidoGuardado);
    }

    @Transactional(readOnly = true)
    public List<PedidoResponse> listarMisPedidos(String correoUsuario) {
        Usuario u = usuarioRepository.findByCorreoIgnoreCase(correoUsuario)
                .orElseThrow(() -> new BadRequestException("Usuario no encontrado"));
        return pedidoRepository.findByUsuarioIdOrderByFechaDesc(u.getId()).stream()
                .map(PedidoResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PedidoResponse> listarTodosLosPedidosAdmin() {
        return pedidoRepository.findAllOrderByFechaDesc().stream()
                .map(PedidoResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PedidoResponse obtenerPorNumero(String numeroPedido) {
        Pedido p = pedidoRepository.findByNumeroPedido(numeroPedido)
                .orElseThrow(() -> new BadRequestException("Pedido no encontrado con número: " + numeroPedido));
        return new PedidoResponse(p);
    }

    @Transactional
    public PedidoResponse actualizarEstadoPedido(Long id, String nuevoEstadoCodigo) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Pedido no encontrado con id: " + id));

        String codigoActual = pedido.getEstado().getCodigo();
        String codigoNuevo = nuevoEstadoCodigo.trim().toUpperCase();

        if (codigoActual.equalsIgnoreCase(codigoNuevo)) {
            return new PedidoResponse(pedido); // idempotente: ya está en ese estado
        }

        EstadoPedido nuevoEstado = estadoPedidoRepository.findByCodigo(codigoNuevo)
                .orElseThrow(() -> new BadRequestException("Estado de pedido no válido: " + codigoNuevo));

        // Si el pedido se anula/cancela, devolvemos las unidades al stock del producto
        if ("CANCELADO".equalsIgnoreCase(codigoNuevo) && !"CANCELADO".equalsIgnoreCase(codigoActual)) {
            for (DetallePedido d : pedido.getDetalles()) {
                if (d.getProducto() != null) {
                    Producto prod = d.getProducto();
                    int stockActual = prod.getStock() != null ? prod.getStock() : 0;
                    prod.setStock(stockActual + d.getCantidad());
                    productoRepository.save(prod);
                }
            }
        }

        pedido.setEstado(nuevoEstado);
        return new PedidoResponse(pedidoRepository.save(pedido));
    }

    @Transactional(readOnly = true)
    public List<TipoEntrega> listarTiposEntrega() {
        return tipoEntregaRepository.findByActivoTrue();
    }

    @Transactional(readOnly = true)
    public List<MetodoPago> listarMetodosPago() {
        return metodoPagoRepository.findByActivoTrue();
    }
}
