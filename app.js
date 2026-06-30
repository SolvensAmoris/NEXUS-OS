const SUPABASE_URL = "https://TU_PROYECTO.supabase.co";
const SUPABASE_ANON_KEY = "TU_ANON_KEY";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const core = {
    async init() {
        const { data: { session } } = await supabase.auth.getSession();
        this.updateUI(session);
        supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                document.cookie = `nexus-auth-token=${session.access_token}; path=/; max-age=${session.expires_in}; secure; samesite=strict`;
            } else {
                document.cookie = `nexus-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
            }
            this.updateUI(session);
        });
    },

    async register() { /* ... login/register omitidos por brevedad, usa los anteriores ... */ },
    async login() { /* ... */ },
    async logout() { await supabase.auth.signOut(); },

    updateUI(session) {
        const authSec = document.getElementById('auth-section');
        const dashSec = document.getElementById('dashboard-section');
        const premiumSec = document.getElementById('premium-section');
        if (session) {
            authSec.classList.add('hidden');
            dashSec.classList.remove('hidden');
            this.verificarAcceso(session.user.id);
        } else {
            authSec.classList.remove('hidden');
            dashSec.classList.add('hidden');
            premiumSec.classList.add('hidden');
        }
    },

    async verificarAcceso(userId) {
        const { data } = await supabase.from('suscripciones').select('estado_pago').eq('user_id', userId).single();
        if (data?.estado_pago === 'paid') {
            document.getElementById('status-display').innerText = "Activo";
            document.getElementById('premium-content').classList.remove('hidden');
            document.getElementById('btn-pay').classList.add('hidden');
        } else {
            document.getElementById('status-display').innerText = "Pendiente";
            document.getElementById('btn-pay').classList.remove('hidden');
        }
        document.getElementById('premium-section').classList.remove('hidden');
    },

    async iniciarPago() {
        const { data } = await supabase.functions.invoke('stripe-checkout');
        if (data.url) window.location.href = data.url;
    },

    async gestionarPortal() {
        const { data } = await supabase.functions.invoke('stripe-portal');
        if (data.url) window.location.href = data.url;
    }
};

window.addEventListener('DOMContentLoaded', () => core.init());
