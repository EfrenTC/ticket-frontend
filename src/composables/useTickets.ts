import { ref } from 'vue';
import api from '../services/api.service';
import type { Ticket, TicketPayload, AuthErrors } from '../types';

export function useTickets() {
    const tickets = ref<Ticket[]>([]);
    const currentTicket = ref<Ticket | null>(null);
    const loading = ref(false);
    const errors = ref<AuthErrors>({});

    const fetchTickets = async () => {
        loading.value = true;
        try {
            const response = await api.get('/api/tickets');
            tickets.value = response.data;
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
            await api.delete(`/api/tickets/${id}`);
            tickets.value = tickets.value.filter(t => t.id !== id);
        } catch (e: any) {
            console.error("Error al borrar ticket", e);
        }
    };

    return { 
        tickets, 
        currentTicket, 
        loading, 
        errors, 
        fetchTickets, 
        getTicket, 
        createTicket, 
        updateTicket, 
        deleteTicket 
    };
}