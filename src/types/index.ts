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

export interface Ticket {
    id: number;
    user_id: number;
    gasto: string;
    importe: number;
    categoria: 'Restauración' | 'Aparcamiento' | 'Peaje' | 'Transporte' | 'Alojamiento' | 'Gasolina' | 'Otros';
    cif: string;
    metodo_pago: 'Efectivo' | 'Tarjeta' | 'Otros';
    conciliado: 'pendiente' | 'terminado';
    fecha: string;
    created_at?: string;
}

export interface TicketPayload {
    gasto: string;
    importe: number | null;
    categoria: string;
    cif: string;
    metodo_pago: string;
    conciliado: string;
    fecha: string;
}