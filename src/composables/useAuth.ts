import { ref } from 'vue';
import api from '../services/api.service';
import { useRouter } from 'vue-router';
import type { RegisterPayload, LoginPayload, AuthErrors, User } from '../types';

export function useAuth() {
    const user = ref<User | null>(null);
    const errors = ref<AuthErrors>({});
    const router = useRouter();

 const getCsrfCookie = () => api.get('/sanctum/csrf-cookie');

const register = async (form: RegisterPayload) => {
    errors.value = {};
    try {
        await getCsrfCookie();
        await api.post('/register', form); 
        await router.push({ name: 'home' });
    } catch (e: any) {
        if (e.response?.status === 422) {
            errors.value = e.response.data.errors;
        }
    }
};

    const login = async (form: LoginPayload) => {
        errors.value = {};
        try {
            await getCsrfCookie();
            await api.post('/login', form);
            await router.push({ name: 'home' });
        } catch (e: any) {
            if (e.response?.status === 422) {
                errors.value = e.response.data.errors;
            }
        }
    };

    return { user, errors, register, login };
}