document.addEventListener('DOMContentLoaded', () => {
    console.log("NEXUS OS: Inicializando sistemas...");
    
    const data = StorageManager.init();
    const chatContainer = document.getElementById('chat-container');
    const form = document.getElementById('nexus-form');
    const input = document.getElementById('user-input');
    const cashFlowDisplay = document.getElementById('cash-flow');

    if (cashFlowDisplay) cashFlowDisplay.textContent = `$${data.caja.toLocaleString('es-MX')} MXN`;

    function agregarMensaje(texto, esUsuario = false) {
        const div = document.createElement('div');
        div.className = `flex gap-3 ${esUsuario ? 'flex-row-reverse' : ''} mb-4`;
        div.innerHTML = `
            <div class="w-8 h-8 rounded border ${esUsuario ? 'border-slate-600 bg-slate-700' : 'border-emerald-500 bg-slate-800'} flex items-center justify-center font-bold text-xs shrink-0 text-emerald-400">
                ${esUsuario ? 'Tú' : 'N'}
            </div>
            <div class="${esUsuario ? 'bg-slate-800 border border-slate-700' : 'glass-panel'} p-3 rounded-2xl text-sm max-w-[85%] text-emerald-50">
                ${texto}
            </div>`;
        chatContainer.appendChild(div);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const texto = input.value.trim();
        if (!texto) return;
        
        agregarMensaje(texto, true);
        input.value = '';
        
        const accion = await Agent.procesarInstruccion(texto);
        let respuesta = "";

        if (accion.comando !== 'REGISTRO_CONTABLE') {
            respuesta = `Agente activo: ${accion.comando}. Ejecutando automatización...`;
        } else {
            const monto = texto.match(/\d+/);
            if (monto) {
                const tipo = texto.toLowerCase().includes('gasto') ? 'egreso' : 'ingreso';
                const nuevoSaldo = StorageManager.registrarMovimiento(tipo, parseInt(monto[0]));
                if (cashFlowDisplay) cashFlowDisplay.textContent = `$${nuevoSaldo.toLocaleString('es-MX')} MXN`;
                respuesta = `Registro exitoso en Códice.`;
            } else {
                respuesta = "Comando recibido, pero falta un monto numérico.";
            }
        }
        setTimeout(() => agregarMensaje(respuesta, false), 300);
    });
});
