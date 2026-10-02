import { Email } from "../value-objects/Email";

export type Rol = "freelancer" | "cliente";
export type RolId = 2 | 3; // 2 = freelancer, 3 = cliente

interface UserData {
	id?: string;
	username: string;
	email: string;
	rol: Rol;
}

export class User {
	readonly id?: string;
	readonly username: string;
	readonly email: Email;
	readonly rol: Rol;

	constructor({ id, username, email, rol }: UserData) {
		this.id = id;
		this.username = username;
		this.email = new Email(email);
		this.rol = rol;
	}
}