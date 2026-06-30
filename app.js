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
        
        // Lógica para manejar reporte o registro
        if (accion.comando === 'REPORTE_EJECUTIVO') {
            const { data, error } = await supabase.from('ventas').select('monto, cliente, estado').eq('estado', 'credito');
            if (error) {
                agregarMensaje("❌ Error al consultar cuentas.");
            } else {
                let mensajeResumen = "📊 **Cuentas por Cobrar:**\n";
                if (data.length === 0) {
                    mensajeResumen = "✅ No tienes deudas pendientes.";
                } else {
                    data.forEach(v => mensajeResumen += `- ${v.cliente.toUpperCase()}: $${v.monto}\n`);
                }
                agregarMensaje(mensajeResumen);
            }
        } else if (accion.comando === 'REGISTRO_CONTABLE') {
            await CloudManager.guardarVenta(accion.datos);
            agregarMensaje(accion.plantilla);
            
            if (navigator.share) {
                setTimeout(() => {
                    if (confirm("¿Quieres compartir este registro?")) {
                        navigator.share({
                            title: 'NEXUS OS',
                            text: `Registro: ${accion.plantilla}. ¡Uso NEXUS OS!`,
                            url: 'https://solvensamoris.github.io/'
                        });
                    }
                }, 1000);
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
