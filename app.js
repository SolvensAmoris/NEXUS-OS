document.addEventListener('DOMContentLoaded', () => {
    const data = StorageManager.init();
    const chatContainer = document.getElementById('chat-container');
    const form = document.getElementById('nexus-form');
    const input = document.getElementById('user-input');
    const cashFlowDisplay = document.getElementById('cash-flow');
    const ctx = document.getElementById('myChart').getContext('2d');
    
    const chart = new Chart(ctx, {
        type: 'line',
        data: { labels: ['Historial'], datasets: [{ data: [data.caja], borderColor: '#10B981', tension: 0.4 }] },
        options: { plugins: { legend: { display: false } } }
    });

    function refreshUI(nuevoSaldo) {
        cashFlowDisplay.textContent = `$${nuevoSaldo.toLocaleString('es-MX')} MXN`;
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

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const texto = input.value.trim();
        if (!texto) return;
        agregarMensaje(texto, true);
        input.value = '';
        agregarMensaje("Analizando...", false, true);
        
        const accion = await Agent.procesarInstruccion(texto);
        chatContainer.removeChild(chatContainer.lastChild);
        
        let respuesta = accion.comando !== 'REGISTRO_CONTABLE' ? accion.plantilla : "";
        if (accion.comando === 'REGISTRO_CONTABLE') {
            const monto = texto.match(/\d+/);
            const val = monto ? Agent.validarMonto(parseInt(monto[0])) : { valido: false };
            if (monto && val.valido) {
                const nuevoSaldo = StorageManager.registrarMovimiento(texto.includes('gasto') ? 'egreso' : 'ingreso', parseInt(monto[0]));
                refreshUI(nuevoSaldo);
                respuesta = `Registro exitoso. $${monto[0]} MXN en Códice. <div class="mt-3 p-3 bg-emerald-900/20 border border-emerald-500/30 rounded-xl text-xs">🎁 ¡Tu negocio crece! <button onclick="navigator.clipboard.writeText('https://solvensamoris.github.io/NEXUS-OS/')" class="w-full bg-emerald-600 mt-2 py-2 rounded-lg font-bold text-white">Copiar link de invitado</button></div>`;
            } else { respuesta = "Error: Monto inválido."; }
        }
        setTimeout(() => agregarMensaje(respuesta, false), 300);
    });
});
