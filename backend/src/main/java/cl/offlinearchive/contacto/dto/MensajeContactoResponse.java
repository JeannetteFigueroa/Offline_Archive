package cl.offlinearchive.contacto.dto;

import cl.offlinearchive.contacto.entity.MensajeContacto;
import java.time.OffsetDateTime;

public class MensajeContactoResponse {
    private Long id;
    private Long usuarioId;
    private String nombre;
    private String correo;
    private String asunto;
    private String mensaje;
    private boolean leido;
    private OffsetDateTime createdAt;

    public MensajeContactoResponse() {}

    public MensajeContactoResponse(MensajeContacto m) {
        this.id = m.getId();
        if (m.getUsuario() != null) {
            this.usuarioId = m.getUsuario().getId();
        }
        this.nombre = m.getNombre();
        this.correo = m.getCorreo();
        this.asunto = m.getAsunto();
        this.mensaje = m.getMensaje();
        this.leido = m.isLeido();
        this.createdAt = m.getCreatedAt();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }

    public String getAsunto() { return asunto; }
    public void setAsunto(String asunto) { this.asunto = asunto; }

    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }

    public boolean isLeido() { return leido; }
    public void setLeido(boolean leido) { this.leido = leido; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
