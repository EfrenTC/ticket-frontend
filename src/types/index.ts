export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
}

export interface RegisterPayload {
    name: string;
    email: string;
    password: string; 
    password_confirmation: string; 
}

export interface LoginPayload {
    email: string;
    password: '';
    remember: boolean;
}

export interface AuthErrors {
    [key: string]: string[];
}