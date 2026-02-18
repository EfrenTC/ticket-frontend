import { ref } from 'vue';
import api from '../services/api.service';
import type {
    Ticket,
    TicketPayload,
    AuthErrors,
    PaginatedResponse,
    PaginationMeta,
    TicketFilters,
} from '../types';

export function useTickets() {
    const tickets = ref<Ticket[]>([]);
    const currentTicket = ref<Ticket | null>(null);
    const loading = ref(false);
    const errors = ref<AuthErrors>({});
    const pagination = ref<PaginationMeta>({
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
    });

    const fetchTickets = async (filters: TicketFilters = {}) => {
        loading.value = true;
        try {
            const response = await api.get<PaginatedResponse<Ticket>>('/api/tickets', { params: filters });
            tickets.value = response.data?.data ?? [];
            pagination.value = {
                current_page: response.data?.current_page ?? 1,
                last_page: response.data?.last_page ?? 1,
                per_page: response.data?.per_page ?? 15,
                total: response.data?.total ?? 0,
            };
        } catch (e: any) {
            console.error("Error al obtener tickets", e);
        } finally {
            loading.value = false;
        }
    };

    const getTicket = async (id: number) => {
        loading.value = true;
        try {
            const response = await api.get(`/api/tickets/${id}`);
            currentTicket.value = response.data;
        } catch (e: any) {
            console.error("Error al obtener el ticket", e);
        } finally {
            loading.value = false;
        }
    };

    const createTicket = async (payload: TicketPayload) => {
        errors.value = {};
        loading.value = true;
        try {
            await api.post('/api/tickets', payload);
            return true;
        } catch (e: any) {
            if (e.response?.status === 422) {
                errors.value = e.response.data.errors;
            }
            return false;
        } finally {
            loading.value = false;
        }
    };

    const updateTicket = async (id: number, payload: TicketPayload) => {
        errors.value = {};
        loading.value = true;
        try {
            await api.put(`/api/tickets/${id}`, payload);
            return true;
        } catch (e: any) {
            if (e.response?.status === 422) {
                errors.value = e.response.data.errors;
            }
            return false;
        } finally {
            loading.value = false;
        }
    };

    const deleteTicket = async (id: number) => {
        try {
            await api.delete(`/api/tickets/${id}`, {
                data: { confirm: true },
            });
            tickets.value = tickets.value.filter(t => t.id !== id);
            pagination.value.total = Math.max(0, pagination.value.total - 1);
        } catch (e: any) {
            console.error("Error al borrar ticket", e);
        }
    };

    return { 
        tickets, 
        currentTicket, 
        loading, 
        errors, 
        pagination,
        fetchTickets, 
        getTicket, 
        createTicket, 
        updateTicket, 
        deleteTicket 
    };
}