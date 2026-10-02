export class DocumentoIdentidad {
  readonly value: string;

  constructor(value: string) {
    const limpio = value.replace(/[.\s]/g, "");
    if (!/^\d{6,12}$/.test(limpio)) {
      throw new Error("El número de documento no es válido");
    }
    this.value = limpio;
  }
}