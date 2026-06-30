document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chat-container');
    const form = document.getElementById('nexus-form');
    const input = document.getElementById('user-input');
    const cashFlowDisplay = document.getElementById('cash-flow');

    // Dashboard Dinámico: Cargar datos reales
    const Dashboard = {
        actualizar: async function() {
            const { data, error } = await supabase.from('ventas').select('monto, tipo');
            if (error) return;

            let saldo = 0;
            data.forEach(v => {
                if (v.tipo === 'ingreso') saldo += v.monto;
                if (v.tipo === 'egreso') saldo -= v.monto;
            });
            cashFlowDisplay.textContent = `$${saldo.toLocaleString()}`;
        }
    };

    Dashboard.actualizar();

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const texto = input.value.trim();
        if (!texto) return;
        
        agregarMensaje(texto, true);
        input.value = '';
        
        const accion = await Agent.procesarInstruccion(texto);
        
        if (accion.comando === 'REGISTRO_CONTABLE') {
            await CloudManager.guardarVenta(accion.datos);
            await Dashboard.actualizar(); // Recalcular saldo
            agregarMensaje(accion.plantilla);
        } else {
            agregarMensaje(accion.plantilla);
        }
    });

    function agregarMensaje(texto, esUsuario = false) {
        const div = document.createElement('div');
        div.className = `flex gap-3 ${esUsuario ? 'flex-row-reverse' : ''} mb-4`;
        div.innerHTML = `<div class="w-8 h-8 rounded border ${esUsuario ? 'border-slate-600' : 'border-emerald-500'} flex items-center justify-center font-bold text-[10px]">${esUsuario ? 'Tú' : 'N'}</div><div class="${esUsuario ? 'bg-slate-800' : 'glass-panel'} p-3 rounded-2xl text-sm max-w-[85%]">${texto}</div>`;
        chatContainer.appendChild(div);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
});
