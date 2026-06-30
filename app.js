document.addEventListener('DOMContentLoaded', () => {
    console.log("NEXUS OS: Inicializando sistemas...");
    
    const data = StorageManager.init();
    const chatContainer = document.getElementById('chat-container');
    const form = document.getElementById('nexus-form');
    const input = document.getElementById('user-input');
    const cashFlowDisplay = document.getElementById('cash-flow');

    if (cashFlowDisplay) cashFlowDisplay.textContent = `$${data.caja.toLocaleString('es-MX')} MXN`;

    function agregarMensaje(texto, esUsuario = false, esSistema = false) {
        const div = document.createElement('div');
        div.className = `flex gap-3 ${esUsuario ? 'flex-row-reverse' : ''} mb-4`;
        
        const avatar = esSistema 
            ? `<div class="w-8 h-8 rounded-full bg-emerald-900 flex items-center justify-center animate-spin text-xs">⚙️</div>`
            : `<div class="w-8 h-8 rounded border ${esUsuario ? 'border-slate-600 bg-slate-700' : 'border-emerald-500 bg-slate-800'} flex items-center justify-center font-bold text-xs shrink-0 text-emerald-400">${esUsuario ? 'Tú' : 'N'}</div>`;
        
        div.innerHTML = `
            ${avatar}
            <div class="${esUsuario ? 'bg-slate-800 border border-slate-700' : 'glass-panel text-emerald-50'} p-3 rounded-2xl ${esUsuario ? 'rounded-tr-none' : 'rounded-tl-none'} text-sm max-w-[85%] leading-relaxed">
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
        
        // Estado de "Procesando"
        agregarMensaje("Analizando instrucciones...", false, true);
        
        const accion = await Agent.procesarInstruccion(texto);
        
        // Eliminar mensaje de "Analizando"
        chatContainer.removeChild(chatContainer.lastChild);
        
        let respuesta = "";

        if (accion.comando !== 'REGISTRO_CONTABLE') {
            respuesta = accion.plantilla;
        } else {
            const monto = texto.match(/\d+/);
            if (monto) {
                const validacion = Agent.validarMonto(parseInt(monto[0]));
                if (!validacion.valido) {
                    respuesta = `⚠️ Error: ${validacion.error}`;
                } else {
                    const tipo = texto.toLowerCase().includes('gasto') ? 'egreso' : 'ingreso';
                    const nuevoSaldo = StorageManager.registrarMovimiento(tipo, parseInt(monto[0]));
                    if (cashFlowDisplay) cashFlowDisplay.textContent = `$${nuevoSaldo.toLocaleString('es-MX')} MXN`;
                    
                    const viralComponent = `
                        <div class="mt-3 p-3 bg-emerald-900/20 border border-emerald-500/30 rounded-xl text-xs">
                            <p class="text-emerald-300 font-bold mb-1">🎁 ¡Tu negocio está creciendo!</p>
                            <p class="text-gray-300 mb-2">Invita a otro emprendedor. Si se registra, ambos ganan 1 mes PRO gratis.</p>
                            <button onclick="navigator.clipboard.writeText('https://solvensamoris.github.io/NEXUS-OS/')" 
                                    class="w-full bg-emerald-600 py-2 rounded-lg font-bold text-white hover:bg-emerald-500 transition-all">
                                Copiar mi link de invitado
                            </button>
                        </div>
                    `;
                    respuesta = `Registro exitoso. $${monto[0]} MXN guardado en Códice. ${viralComponent}`;
                }
            } else {
                respuesta = "Comando recibido, pero falta un monto numérico.";
            }
        }
        setTimeout(() => agregarMensaje(respuesta, false), 300);
    });
});
