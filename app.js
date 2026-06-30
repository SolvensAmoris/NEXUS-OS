document.addEventListener('DOMContentLoaded', () => {
    const data = StorageManager.init();
    const chatContainer = document.getElementById('chat-container');
    const form = document.getElementById('nexus-form');
    const input = document.getElementById('user-input');
    const cashFlowDisplay = document.getElementById('cash-flow');
    const ctx = document.getElementById('myChart').getContext('2d');
    
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
        div.innerHTML = `<div class="w-8 h-8 rounded border ${esUsuario ? 'border-slate-600 bg-slate-700' : 'border-emerald-500 bg-slate-800'} flex items-center justify-center font-bold text-xs shrink-0 text-emerald-400">${esUsuario ? 'Tú' : 'N'}</div><div class="${esUsuario ? 'bg-slate-800 border border-slate-700' : 'glass-panel text-emerald-50'} p-3 rounded-2xl ${esUsuario ? 'rounded-tr-none' : 'rounded-tl-none'} text-sm max-w-[85%]">${texto}</div>`;
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
        
        if (accion.comando === 'REGISTRO_CONTABLE') {
            const monto = texto.match(/\d+/);
            if (monto) {
                const montoVal = parseInt(monto[0]);
                const tipo = texto.toLowerCase().includes('gasto') ? 'egreso' : 'ingreso';
                const nuevoSaldo = StorageManager.registrarMovimiento(tipo, montoVal);
                
                // Conexión a la nube
                await CloudManager.guardarVenta({ tipo, monto: montoVal, fecha: new Date().toISOString() });
                
                refreshUI(nuevoSaldo);
                agregarMensaje(`Registro exitoso. Saldo actual: $${nuevoSaldo.toLocaleString('es-MX')}.`);
            }
        } else {
            agregarMensaje(accion.plantilla);
        }
    });
});
