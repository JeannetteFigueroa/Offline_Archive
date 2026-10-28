import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Contacto from "../pages/Contacto.jsx";

afterEach(() => {
  cleanup();
});

describe("Página Contacto (Pruebas de Estado, Eventos y Renderizado Condicional)", () => {
  it("cambia correctamente el estado del formulario cuando el usuario introduce texto en los campos", () => {
    render(
      <MemoryRouter>
        <Contacto />
      </MemoryRouter>
    );

    const inputNombre = screen.getByPlaceholderText("Tu nombre");
    const inputEmail = screen.getByPlaceholderText("tu@duoc.cl");
    const inputAsunto = screen.getByPlaceholderText("Motivo del contacto");
    const inputMensaje = screen.getByPlaceholderText("Escribe tu mensaje...");

    fireEvent.change(inputNombre, { target: { value: "Jeannette Figueroa" } });
    fireEvent.change(inputEmail, { target: { value: "jeannette@duoc.cl" } });
    fireEvent.change(inputAsunto, { target: { value: "Consulta de producto" } });
    fireEvent.change(inputMensaje, { target: { value: "¿Tienen stock disponible en talla M?" } });

    expect(inputNombre.value).toBe("Jeannette Figueroa");
    expect(inputEmail.value).toBe("jeannette@duoc.cl");
    expect(inputAsunto.value).toBe("Consulta de producto");
    expect(inputMensaje.value).toBe("¿Tienen stock disponible en talla M?");
  });

  it("renderizado condicional: los mensajes de error solo se muestran cuando hay un error presente", () => {
    render(
      <MemoryRouter>
        <Contacto />
      </MemoryRouter>
    );

    // Inicialmente no deben existir mensajes de error en pantalla
    expect(screen.queryByText("Ingresa tu nombre.")).toBeNull();
    expect(screen.queryByText("Ingresa tu correo.")).toBeNull();
    expect(screen.queryByText("Ingresa el motivo de tu mensaje.")).toBeNull();
    expect(screen.queryByText("Escribe un mensaje.")).toBeNull();

    // Enviamos el formulario vacío
    const botonEnviar = screen.getByRole("button", { name: /enviar mensaje/i });
    fireEvent.click(botonEnviar);

    // Ahora sí se muestran condicionalmente los errores
    expect(screen.getByText("Ingresa tu nombre.")).toBeTruthy();
    expect(screen.getByText("Ingresa tu correo.")).toBeTruthy();
    expect(screen.getByText("Ingresa el motivo de tu mensaje.")).toBeTruthy();
    expect(screen.getByText("Escribe un mensaje.")).toBeTruthy();
    expect(
      screen.getByText("HAY ERRORES EN EL FORMULARIO. POR FAVOR, REVISA LOS CAMPOS MARCADOS.")
    ).toBeTruthy();
  });

  it("renderizado condicional: rechaza correos con dominios no permitidos y valida correctamente correos válidos", () => {
    render(
      <MemoryRouter>
        <Contacto />
      </MemoryRouter>
    );

    const inputNombre = screen.getByPlaceholderText("Tu nombre");
    const inputEmail = screen.getByPlaceholderText("tu@duoc.cl");
    const inputAsunto = screen.getByPlaceholderText("Motivo del contacto");
    const inputMensaje = screen.getByPlaceholderText("Escribe tu mensaje...");
    const botonEnviar = screen.getByRole("button", { name: /enviar mensaje/i });

    // Llenar campos con correo inválido (@hotmail.com)
    fireEvent.change(inputNombre, { target: { value: "Misael Rojas" } });
    fireEvent.change(inputEmail, { target: { value: "misael@hotmail.com" } });
    fireEvent.change(inputAsunto, { target: { value: "Consulta" } });
    fireEvent.change(inputMensaje, { target: { value: "Texto de prueba" } });
    fireEvent.click(botonEnviar);

    expect(
      screen.getByText("Solo se permiten correos @duoc.cl, @profesor.duoc.cl y @gmail.com")
    ).toBeTruthy();

    // Corregir a correo permitido (@duoc.cl)
    fireEvent.change(inputEmail, { target: { value: "misael@duoc.cl" } });
    fireEvent.click(botonEnviar);

    // Debe mostrar condicionalmente el mensaje de éxito
    expect(screen.getByText("MENSAJE VALIDADO CORRECTAMENTE.")).toBeTruthy();
    expect(screen.queryByText("Solo se permiten correos @duoc.cl, @profesor.duoc.cl y @gmail.com")).toBeNull();
  });
});
