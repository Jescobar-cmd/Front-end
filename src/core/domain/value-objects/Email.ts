export class Email {
  readonly value: string;

  constructor(value: string) {
    const normalized = value.trim().toLowerCase();
    if (!Email.isValid(normalized)) {
      throw new Error("El correo no es válido");
    }
    this.value = normalized;
  }

  static isValid(value: string): boolean {
    const arroba = value.indexOf("@");
    if (arroba <= 0 || arroba !== value.lastIndexOf("@")) return false;
    const dominio = value.slice(arroba + 1);
    const punto = dominio.lastIndexOf(".");
    if (punto <= 0 || punto === dominio.length - 1) return false;
    return !value.split("").some((c) => c.charCodeAt(0) <= 32);
  }

  toString(): string {
    return this.value;
  }
}