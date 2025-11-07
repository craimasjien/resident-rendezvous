export type UserRole = 'user' | 'administrator';

export interface User {
	id: string;
	email: string;
	username: string;
	name: string;
	role: UserRole;
}

export type UserWriteData = Omit<User, 'id'>;

