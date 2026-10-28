function PrimaryButton({
  type = "submit",
  onClick,
  children,
  className = ""
}) {
  return (
    <button
      type={type}
      className={`primary-button ${className}`.trim()}
      onClick={onClick}
    >
      <span>{children}</span>
      <span aria-hidden="true">→</span>
    </button>
  );
}

export default PrimaryButton;
