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
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  toString(): string {
    return this.value;
  }
}