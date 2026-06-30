document.addEventListener('DOMContentLoaded', () => {
    const data = StorageManager.init();
    const chatContainer = document.getElementById('chat-container');
    const form = document.getElementById('nexus-form');
    const input = document.getElementById('user-input');
    const cashFlowDisplay = document.getElementById('cash-flow');
    const ctx = document.getElementById('myChart').getContext('2d');
    
    // Tu Link de Stripe va aquí abajo, entre las comillas
    const STRIPE_LINK = 'https://buy.stripe.com/TU_LINK_DE_STRIPE'; 
    
    const chart = new Chart(ctx, {
        type: 'line',
        data: { labels: ['Inicio'], datasets: [{ data: [data.caja], borderColor: '#10B981', tension: 0.4, fill: true, backgroundColor: 'rgba(16, 185, 129, 0.1)' }] },
        options: { plugins: { legend: { display: false } }, scales: { y: { display: false } } }
    });

    function refreshUI(nuevoSaldo) {
        cashFlowDisplay.textContent = `$${nuevoSaldo.toLocaleString('es-MX')}`;
        chart.data.datasets[0].data.push(nuevoSaldo);
        chart.update();
    }

    function agregarMensaje(texto, esUsuario = false, esSistema = false) {
        const div = document.createElement('div');
        div.className = `flex gap-3 ${esUsuario ? 'flex-row-reverse' : ''} mb-4`;
        const avatar = esSistema ? `<div class="w-8 h-8 rounded-full bg-emerald-900 flex items-center justify-center animate-spin text-xs">⚙️</div>` : `<div class="w-8 h-8 rounded border ${esUsuario ? 'border-slate-600 bg-slate-700' : 'border-emerald-500 bg-slate-800'} flex items-center justify-center font-bold text-xs shrink-0 text-emerald-400">${esUsuario ? 'Tú' : 'N'}</div>`;
        div.innerHTML = `${avatar}<div class="${esUsuario ? 'bg-slate-800 border border-slate-700' : 'glass-panel text-emerald-50'} p-3 rounded-2xl ${esUsuario ? 'rounded-tr-none' : 'rounded-tl-none'} text-sm max-w-[85%] leading-relaxed">${texto}</div>`;
        chatContainer.appendChild(div);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    window.copiarYAbrirWA = (texto) => {
        navigator.clipboard.writeText(texto);
        window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const texto = input.value.trim();
        if (!texto) return;
        
        agregarMensaje(texto, true);
        input.value = '';
        agregarMensaje("Procesando...", false, true);
        
        const accion = await Agent.procesarInstruccion(texto);
        chatContainer.removeChild(chatContainer.lastChild);
        
        let respuesta = "";

        if (accion.comando === 'GENERAR_RESPUESTA') {
            const textoRespuesta = accion.plantilla;
            respuesta = `
                <div class="mb-2">${textoRespuesta}</div>
                <button onclick="copiarYAbrirWA('${textoRespuesta.replace(/'/g, "\\'")}')" 
                        class="w-full bg-emerald-600 py-2 rounded-lg font-bold text-white text-xs mt-2 hover:bg-emerald-500 transition-all">
                    Copiar y enviar por WhatsApp
                </button>`;
        } else if (accion.comando === 'REGISTRO_CONTABLE') {
            const monto = texto.match(/\d+/);
            const val = monto ? Agent.validarMonto(parseInt(monto[0])) : { valido: false };
            
            // Lógica de Monetización: Límite de 5 registros
            const dataActual = StorageManager.getData();
            if (monto && val.valido && dataActual.transacciones.length < 5) {
                const tipo = texto.toLowerCase().includes('gasto') ? 'egreso' : 'ingreso';
                const montoVal = parseInt(monto[0]);
                
                const nuevoSaldo = StorageManager.registrarMovimiento(tipo, montoVal);
                await CloudManager.guardarVenta({ tipo, monto: montoVal, fecha: new Date().toISOString() });
                
                refreshUI(nuevoSaldo);
                respuesta = `Éxito. Saldo: $${nuevoSaldo.toLocaleString('es-MX')}. <div class="mt-3 p-3 bg-emerald-900/20 border border-emerald-500/30 rounded-xl text-xs"><p class="text-emerald-300 font-bold mb-1">🎁 ¡Tu negocio crece!</p></div>`;
            } else if (dataActual.transacciones.length >= 5) {
                respuesta = `
                    <div class="p-4 bg-amber-900/20 border border-amber-500 rounded-xl text-center">
                        <p class="text-amber-300 font-bold mb-2">Tu ciclo gratuito ha culminado.</p>
                        <p class="text-xs mb-4 text-slate-300">Para continuar la transmutación y el registro, adquiere tu Licencia Pro Solvens Amoris.</p>
                        <button onclick="window.open('${STRIPE_LINK}', '_blank')" 
                                class="w-full bg-amber-600 py-2 rounded-lg font-bold text-white text-xs hover:bg-amber-500 transition-all">
                            Activar Acceso Ilimitado
                        </button>
                    </div>`;
            } else {
                respuesta = "Error: Monto inválido o no detectado.";
            }
        } else {
            respuesta = accion.plantilla;
        }
        
        setTimeout(() => agregarMensaje(respuesta, false), 300);
    });
});
