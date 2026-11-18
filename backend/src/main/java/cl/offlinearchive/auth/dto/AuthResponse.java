package cl.offlinearchive.auth.dto;

public class AuthResponse {

    private String accessToken;
    private String tokenType = "Bearer";
    private UsuarioResponse usuario;

    public AuthResponse() {}

    public AuthResponse(String accessToken, UsuarioResponse usuario) {
        this.accessToken = accessToken;
        this.tokenType = "Bearer";
        this.usuario = usuario;
    }

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public UsuarioResponse getUsuario() { return usuario; }
    public void setUsuario(UsuarioResponse usuario) { this.usuario = usuario; }
}
