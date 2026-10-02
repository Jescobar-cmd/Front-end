import { Email } from "../value-objects/Email";

export type Rol = "freelancer" | "cliente";
export type RolId = 2 | 3; // 2 = freelancer, 3 = cliente

export const rolDesdeId = (id: number): Rol => (id === 2 ? "freelancer" : "cliente");
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