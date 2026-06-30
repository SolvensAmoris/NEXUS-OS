// Reemplazar con las credenciales de tu proyecto Supabase
const SUPABASE_URL = "https://TU_PROYECTO.supabase.co";
const SUPABASE_ANON_KEY = "TU_ANON_KEY";

const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const core = {
    async init() {
        if (!supabase) return console.error("Error: Supabase no inicializado.");
        
        // Verificar sesión activa
        const { data: { session } } = await supabase.auth.getSession();
        this.updateUI(session);

        // Escuchar cambios de estado en el portal auth
        supabase.auth.onAuthStateChange((_event, session) => {
            this.updateUI(session);
        });

        // Registrar Service Worker para soporte offline (PWA)
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').catch(err => console.log("SW Error", err));
        }
    },

    async register() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) alert(`Error de Transmutación: ${error.message}`);
        else alert("Registro exitoso. Revisa tu correo o inicia sesión directamente.");
    },

    async login() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) alert(`Acceso Denegado: ${error.message}`);
    },

    async logout() {
        await supabase.auth.signOut();
    },

    updateUI(session) {
        const authSec = document.getElementById('auth-section');
        const dashSec = document.getElementById('dashboard-section');
        const userDisp = document.getElementById('user-display');
        const premiumSec = document.getElementById('premium-section');

        if (session) {
            authSec.classList.add('hidden');
            dashSec.classList.remove('hidden');
            userDisp.innerText = session.user.email;
            
            // Iniciar verificación de nivel de acceso
            this.verificarAcceso(session.user.id);
        } else {
            authSec.classList.remove('hidden');
            dashSec.classList.add('hidden');
            if (premiumSec) premiumSec.classList.add('hidden');
        }
    },

    async verificarAcceso(userId) {
        const premiumSec = document.getElementById('premium-section');
        const premiumContent = document.getElementById('premium-content');
        const btnPay = document.getElementById('btn-pay');
        const statusDisp = document.getElementById('status-display');

        premiumSec.classList.remove('hidden');
        statusDisp.innerText = "Consultando el Oráculo...";
        statusDisp.style.color = "var(--text-light)";

        try {
            // Lectura de la tabla suscripciones (Protegida por RLS)
            const { data, error } = await supabase
                .from('suscripciones')
                .select('estado_pago')
                .eq('user_id', userId)
                .single();

            if (error || !data) {
                // Sin registro: Ofrecer la llave de acceso
                statusDisp.innerText = "No Iniciado";
                btnPay.classList.remove('hidden');
                premiumContent.classList.add('hidden');
                return;
            }

            if (data.estado_pago === 'paid') {
                // Pago confirmado: Revelar contenido exclusivo
                statusDisp.innerText = "Activo (Convergencia Completada)";
                statusDisp.style.color = "#4ade80"; // Verde
                btnPay.classList.add('hidden');
                premiumContent.classList.remove('hidden');
            } else {
                // Pago pendiente (Ej. Ticket OXXO emitido pero no pagado)
                statusDisp.innerText = `Pendiente (${data.estado_pago})`;
                statusDisp.style.color = "#facc15"; // Amarillo
                btnPay.classList.add('hidden'); 
                premiumContent.classList.add('hidden');
            }
        } catch (err) {
            console.error("Fallo dimensional al verificar acceso:", err);
            statusDisp.innerText = "Error de sincronización";
        }
    },

    async iniciarPago() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Debes iniciar sesión para transmutar pagos.");

            // Invocación a la Edge Function
            const { data, error } = await supabase.functions.invoke('stripe-checkout', {
                body: { 
                    priceId: 'price_TU_ID_DE_PRECIO_STRIPE_MXN', 
                    isSubscription: false // Cambiar a true si es SaaS
                }
            });

            if (error) throw error;
            
            // Redirección al portal de Stripe
            if (data.url) window.location.href = data.url;

        } catch (error) {
            console.error("Fallo en la invocación de pago:", error);
            alert(`Error de Convergencia: ${error.message}`);
        }
    }
};

window.addEventListener('DOMContentLoaded', () => core.init());
