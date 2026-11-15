import { Email } from "../value-objects/Email";

export type Rol = "administrador" | "freelancer" | "cliente" | "moderador";
export type RolId = 1 | 2 | 3 | 4; // 1 = administrador, 2 = freelancer, 3 = cliente, 4 = moderador

const ROLES_POR_ID: Record<string, Rol> = {
  "1": "administrador",
  admin: "administrador",
  administrador: "administrador",
  "2": "freelancer",
  freelancer: "freelancer",
  "3": "cliente",
  cliente: "cliente",
  "4": "moderador",
  moderador: "moderador",
};

const IDS_POR_ROL: Record<Rol, RolId> = {
  administrador: 1,
  freelancer: 2,
  cliente: 3,
  moderador: 4,
};

const ETIQUETAS_POR_ROL: Record<Rol, string> = {
  administrador: "Administrador",
  freelancer: "Freelancer",
  cliente: "Cliente",
  moderador: "Moderador",
};

export const rolDesdeId = (id: number | string): Rol => {
  const valor = String(id).trim().toLowerCase();
  const rol = ROLES_POR_ID[valor];
  if (!rol) {
    throw new Error("El servidor devolvió un rol de usuario no válido");
  }
  return rol;
};

export const idDesdeRol = (rol: Rol): RolId => IDS_POR_ROL[rol];

export const rolLabel = (rol: Rol): string => ETIQUETAS_POR_ROL[rol];

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
