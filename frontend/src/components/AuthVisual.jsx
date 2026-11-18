function AuthVisual({
  systemCode = "SYSTEM_01 / ACCESS",
  status = "ONLINE",
  statusTag = "ARCHIVE / 2003",
  children
}) {
  return (
    <section
      className="auth-visual"
      aria-label="Identidad de la tienda"
    >
      <div className="scanline"></div>

      <div className="visual-content">
        <p className="eyebrow">
          {systemCode}
        </p>

        <h1 className="title">
          (Off)line <span>Archive</span>
        </h1>

        <div className="body-copy">
          {children}
        </div>

        <div className="system-readout">
          <span>{statusTag}</span>
          <span>
            STATUS: <b>{status}</b>
          </span>
        </div>
      </div>
    </section>
  );
}

export default AuthVisual;
