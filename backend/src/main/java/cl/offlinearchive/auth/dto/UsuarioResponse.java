package cl.offlinearchive.auth.dto;

import cl.offlinearchive.usuario.entity.Usuario;
import java.time.LocalDate;

public class UsuarioResponse {

    private Long id;
    private String nombre;
    private String apellidos;
    private String correo;
    private String telefono;
    private String rol;
    private LocalDate fechaNacimiento;
    private Boolean activo;

    public UsuarioResponse() {}

    public UsuarioResponse(Usuario usuario) {
        if (usuario != null) {
            this.id = usuario.getId();
            this.nombre = usuario.getNombre();
            this.apellidos = usuario.getApellidos();
            this.correo = usuario.getCorreo();
            this.telefono = usuario.getTelefono();
            this.rol = usuario.getRol();
            this.fechaNacimiento = usuario.getFechaNacimiento();
            this.activo = usuario.getActivo();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getApellidos() { return apellidos; }
    public void setApellidos(String apellidos) { this.apellidos = apellidos; }

    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }

    public LocalDate getFechaNacimiento() { return fechaNacimiento; }
    public void setFechaNacimiento(LocalDate fechaNacimiento) { this.fechaNacimiento = fechaNacimiento; }

    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
}
