const Agent = {
    procesarInstruccion: async function(texto) {
        const lower = texto.toLowerCase();
        const montoMatch = lower.match(/(\d+)/);
        const monto = montoMatch ? parseInt(montoMatch[0]) : null;

        if (!monto) {
            return { 
                comando: 'ERROR', 
                plantilla: '⚠️ Para registrar una transacción, necesito el monto. ¿De cuánto fue?' 
            };
        }

        const tipo = lower.includes('gasto') || lower.includes('compra') ? 'egreso' : 'ingreso';
        
        // Extracción inteligente de cliente
        // Busca patrones como "a juan", "para maria", "de pedro"
        const clienteMatch = lower.match(/(?:a|para|de)\s+([a-z]+)/);
        const cliente = clienteMatch ? clienteMatch[1] : 'anonimo';

        let categoria = lower.includes('servicio') ? 'servicio' : 'general';
        let estado = lower.includes('crédito') || lower.includes('fiao') ? 'credito' : 'pagado';
        if (lower.includes('abono')) estado = 'abono';

        return {
            comando: 'REGISTRO_CONTABLE',
            datos: { 
                tipo, 
                monto, 
                categoria, 
                estado, 
                cliente: cliente, 
                fecha: new Date().toISOString() 
            },
            plantilla: `✅ ${tipo.toUpperCase()} de $${monto} con ${cliente} registrado como ${estado}.`
        };
    }
};
