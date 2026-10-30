import type { DatosOferta } from "../entities/oferta";

/** Mismas reglas que el backend (oferta.schemas.ts) para no gastar una petición en datos inválidos. */
export function validarIdOferta(id: number): void {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("El id de la oferta no es válido");
  }
}

export function validarTituloOferta(titulo: string): void {
  if (titulo.length < 5) throw new Error("El título debe tener al menos 5 caracteres");
  if (titulo.length > 200) throw new Error("El título no puede exceder 200 caracteres");
}

export function validarDescripcionOferta(descripcion: string): void {
  if (descripcion.length < 10) throw new Error("La descripción debe tener al menos 10 caracteres");
  if (descripcion.length > 5000) throw new Error("La descripción no puede exceder 5000 caracteres");
}

export function validarCamposOpcionalesOferta(datos: DatosOferta): void {
  const { presupuesto, plazoDias, categoriaId, imagenUrl, habilidadIds } = datos;

  if (presupuesto != null && (!Number.isFinite(presupuesto) || presupuesto < 0)) {
    throw new Error("El presupuesto no puede ser negativo");
  }
  if (plazoDias != null && (!Number.isInteger(plazoDias) || plazoDias < 1)) {
    throw new Error("El plazo debe ser un número entero de al menos 1 día");
  }
  if (categoriaId != null && (!Number.isInteger(categoriaId) || categoriaId <= 0)) {
    throw new Error("La categoría debe ser un id válido");
  }
  if (imagenUrl) {
    if (imagenUrl.length > 500) throw new Error("La URL de la imagen no puede exceder 500 caracteres");
    if (!/^https?:\/\/.+/.test(imagenUrl)) throw new Error("La imagen debe ser una URL válida (http o https)");
  }
  if (habilidadIds && habilidadIds.length > 20) {
    throw new Error("No puedes asignar más de 20 habilidades");
  }
}