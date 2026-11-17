import { describe, expect, it } from "vitest";
import { Email } from "../../src/core/domain/value-objects/Email";
import { Telefono } from "../../src/core/domain/value-objects/telefono";
import { DocumentoIdentidad } from "../../src/core/domain/value-objects/documento";

describe("Email", () => {
  it("acepta correos validos y normaliza", () => {
    expect(new Email("  Usuario@Example.COM ").value).toBe("usuario@example.com");
    expect(Email.isValid("a@b.co")).toBe(true);
  });

  it("rechaza correos invalidos", () => {
    for (const malo of ["", "sin-arroba", "a@b", "a@@b.com", "a b@c.com", "@b.com", "a@.com", "a@b."]) {
      expect(Email.isValid(malo)).toBe(false);
    }
    expect(() => new Email("no-es-correo")).toThrow("El correo no es válido");
  });
});

describe("Telefono", () => {
  it("limpia formato y acepta numeros validos", () => {
    expect(new Telefono("+57 (300) 123-4567").value).toBe("+573001234567");
    expect(new Telefono("3001234567").value).toBe("3001234567");
  });

  it("rechaza numeros invalidos", () => {
    expect(() => new Telefono("123")).toThrow();
    expect(() => new Telefono("abc")).toThrow();
    expect(() => new Telefono("+57 300 123 4567 890 123 456")).toThrow();
  });
});

describe("DocumentoIdentidad", () => {
  it("elimina puntos y espacios", () => {
    expect(new DocumentoIdentidad("1.234.567").value).toBe("1234567");
    expect(new DocumentoIdentidad("  123456  ").value).toBe("123456");
  });

  it("rechaza documentos fuera de rango", () => {
    expect(() => new DocumentoIdentidad("12345")).toThrow();
    expect(() => new DocumentoIdentidad("1234567890123")).toThrow();
    expect(() => new DocumentoIdentidad("12a456")).toThrow();
  });
});
