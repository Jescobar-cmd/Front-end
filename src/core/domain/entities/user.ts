import { Email } from "../value-objects/Email";

export type Rol = "freelancer" | "cliente";
export type RolId = 2 | 3; // 2 = freelancer, 3 = cliente

export const rolDesdeId = (id: number | string): Rol => {
  const valor = String(id).trim().toLowerCase();
  if (valor === "2" || valor === "freelancer") return "freelancer";
  if (valor === "3" || valor === "cliente") return "cliente";
  throw new Error("El servidor devolvió un rol de usuario no válido");
};
export const idDesdeRol = (rol: Rol): RolId => (rol === "freelancer" ? 2 : 3);

interface UserData {
  id?: number | string;
  nombre: string;
  email: string;
  rol: Rol;
}

export class User {
  readonly id?: number | string;
  readonly nombre: string;
  readonly email: Email;
  readonly rol: Rol;

  constructor({ id, nombre, email, rol }: UserData) {
    this.id = id;
    this.nombre = nombre;
    this.email = new Email(email);
    this.rol = rol;
  }
}