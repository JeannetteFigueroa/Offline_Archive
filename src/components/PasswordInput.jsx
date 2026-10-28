import { useState } from "react";

function PasswordInput({
  id,
  name,
  value,
  onChange,
  placeholder = "Ingresa tu contraseña",
  autoComplete = "current-password",
  minLength,
  maxLength,
  required = false
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="password-wrapper">
      <input
        type={showPassword ? "text" : "password"}
        id={id}
        name={name}
        autoComplete={autoComplete}
        minLength={minLength}
        maxLength={maxLength}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />

      <button
        type="button"
        className="password-toggle"
        onClick={() => setShowPassword((prev) => !prev)}
        aria-label={
          showPassword
            ? "Ocultar contraseña"
            : "Mostrar contraseña"
        }
      >
        {showPassword ? "−" : "+"}
      </button>
    </div>
  );
}

export default PasswordInput;
