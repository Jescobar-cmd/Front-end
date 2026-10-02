export class Telefono {
  readonly value: string;

  constructor(value: string) {
    const limpio = value.replace(/[\s()-]/g, "");
    if (!/^\+?\d{7,15}$/.test(limpio)) {
      throw new Error("El número de teléfono no es válido");
    }
    this.value = limpio;
  }
}