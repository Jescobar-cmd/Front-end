import { describe, expect, it } from "vitest";
import {
  errorMessage,
  formatDate,
  formatMoney,
  isActive,
  isCancelled,
  isCompleted,
  isPending,
  isPendingPayment,
  normalizedState,
  pagoEstadoLabel,
  roleLabel,
  statusLabel,
} from "../../src/features/chat-contracts/chatContractsUtils";

describe("chatContractsUtils", () => {
  it("errorMessage devuelve fallback para errores desconocidos", () => {
    expect(errorMessage(new Error("fallo de red"), "fallback")).toBe("fallo de red");
    expect(errorMessage("raro", "fallback")).toBe("fallback");
    expect(errorMessage(null, "fallback")).toBe("fallback");
  });

  it("errorMessage explica errores HTTP conocidos", () => {
    const error = Object.assign(new Error("detalle"), { status: 403 });
    expect(errorMessage(error, "fallback")).toContain("No tienes permiso");
  });

  it("formatMoney formatea pesos colombianos", () => {
    expect(formatMoney(150000)).toContain("150.000");
  });

  it("formatDate maneja vacios y fechas invalidas", () => {
    expect(formatDate(undefined)).toBe("Sin fecha");
    expect(formatDate("")).toBe("Sin fecha");
    expect(formatDate("no-es-fecha")).toBe("no-es-fecha");
  });

  it("normalizedState normaliza el estado", () => {
    expect(normalizedState("  Activo  ")).toBe("activo");
  });

  it("predicados de estado", () => {
    expect(isPending("pendiente")).toBe(true);
    expect(isPending("PENDING")).toBe(true);
    expect(isPending("otro")).toBe(false);
    expect(isActive("activo")).toBe(true);
    expect(isCompleted("COMPLETED")).toBe(true);
    expect(isCancelled("cancelada")).toBe(true);
    expect(isPendingPayment("pendiente_pago")).toBe(true);
    expect(isPendingPayment("pendiente")).toBe(false);
  });

  it("labels de estado, pago y rol", () => {
    expect(statusLabel("activo")).toBe("Activo");
    expect(statusLabel("desconocido")).toBe("desconocido");
    expect(pagoEstadoLabel("retenido")).toBe("Pago retenido en FirstGig");
    expect(roleLabel(2)).toBe("Freelancer");
    expect(roleLabel(3)).toBe("Cliente");
    expect(roleLabel(undefined)).toBe("Participante");
  });
});
