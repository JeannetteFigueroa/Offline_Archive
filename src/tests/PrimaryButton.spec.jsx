import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import PrimaryButton from "../components/PrimaryButton.jsx";

afterEach(() => {
  cleanup();
});

describe("Componente PrimaryButton (Pruebas de Props y Eventos)", () => {
  it("recibe y renderiza correctamente la etiqueta enviada mediante children (props)", () => {
    render(
      <PrimaryButton onClick={() => {}}>
        ENVIAR MENSAJE
      </PrimaryButton>
    );

    expect(screen.getByText("ENVIAR MENSAJE")).toBeTruthy();
  });

  it("recibe la función de evento onClick y la ejecuta al hacer clic", () => {
    const handleClick = jasmine.createSpy("handleClick");

    render(
      <PrimaryButton onClick={handleClick}>
        CONFIRMAR COMPRA
      </PrimaryButton>
    );

    const boton = screen.getByRole("button", { name: /confirmar compra/i });
    fireEvent.click(boton);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("recibe y aplica correctamente el tipo de botón y clases personalizadas mediante props", () => {
    render(
      <PrimaryButton type="button" className="custom-class" onClick={() => {}}>
        BOTON TEST
      </PrimaryButton>
    );

    const boton = screen.getByRole("button", { name: /boton test/i });
    expect(boton.getAttribute("type")).toBe("button");
    expect(boton.className).toContain("custom-class");
  });
});
