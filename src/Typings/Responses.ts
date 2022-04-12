export interface LoginResponse {
	errors?: string[];
	username?: string;
	isAdmin?: boolean;
}

export interface MeResponse {
	username?: string;
	isAdmin?: boolean;
  errors?: string[];
}

export interface RegisterResponse {
	username?: string;
	isAdmin?: boolean;
  errors?: string[];
}

