export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    avatar_url?: string | null;
    currency?: string;
    date_format?: string;
    language?: string;
    dark_mode?: boolean;
    report_frequency?: 'none' | 'weekly' | 'monthly';
    budget_alerts_enabled?: boolean;
}

export interface RegisterPayload {
    name: string;
    email: string;
    password: string; 
    password_confirmation: string; 
}

export interface LoginPayload {
    email: string;
    password: string;
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
    conciliado_en?: string | null;
    referencia_bancaria?: string | null;
    fecha: string;
    category_id?: number | null;
    category?: Category | null;
    tags?: Tag[];
    created_at?: string;
}

export interface TicketPayload {
    gasto: string;
    importe: number | null;
    categoria?: string;
    category_id?: number | null;
    cif: string;
    metodo_pago: string;
    conciliado: string;
    fecha: string;
    referencia_bancaria?: string | null;
    tag_ids?: number[];
}

export interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface TicketFilters {
    q?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
    category_id?: number | null;
    categoria?: string;
    metodo_pago?: string;
    conciliado?: string;
    tag?: string;
    per_page?: number;
    sort_by?: 'fecha' | 'importe' | 'created_at';
    sort_dir?: 'asc' | 'desc';
    page?: number;
}

export interface Category {
    id: number;
    user_id: number;
    name: string;
    color: string;
    icon?: string | null;
}

export interface Tag {
    id: number;
    user_id: number;
    name: string;
}

export interface Budget {
    id: number;
    user_id: number;
    category_id: number | null;
    amount: number;
    month: number;
    year: number;
    category?: Category | null;
}

export interface BudgetAlert {
    budget_id: number;
    category_id: number | null;
    category_name: string | null;
    budget: number;
    spent: number;
    ratio: number;
    status: 'ok' | 'near_limit' | 'exceeded';
}

export interface SavingsGoal {
    id: number;
    user_id: number;
    title: string;
    target_amount: number;
    start_date: string;
    end_date: string;
    is_completed: boolean;
}

export interface Reminder {
    id: number;
    user_id: number;
    ticket_id?: number | null;
    type: 'in_app' | 'email';
    title: string;
    message: string;
    send_at?: string | null;
    read_at?: string | null;
    created_at?: string;
}

export interface DashboardWidget {
    id: number;
    user_id: number;
    widget_key: string;
    position: number;
    enabled: boolean;
    settings?: Record<string, unknown> | null;
}