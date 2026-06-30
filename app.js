document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chat-container');
    const form = document.getElementById('nexus-form');
    const input = document.getElementById('user-input');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const texto = input.value.trim();
        if (!texto) return;
        
        agregarMensaje(texto, true);
        input.value = '';
        
        const accion = await Agent.procesarInstruccion(texto);
        
        if (accion.comando === 'REGISTRO_CONTABLE') {
            await CloudManager.guardarVenta(accion.datos);
            agregarMensaje(accion.plantilla);
            
            // Viralización rápida
            if (navigator.share) {
                navigator.share({
                    title: 'NEXUS OS',
                    text: `Registro en mi negocio: ${accion.plantilla}`,
                    url: 'https://solvensamoris.github.io/'
                });
            }
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
