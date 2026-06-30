const Agent = {
    procesarInstruccion: async function(texto) {
        const lower = texto.toLowerCase();
        
        if (lower.includes('resumen') || lower.includes('reporte') || lower.includes('deudas')) {
            return { comando: 'REPORTE_EJECUTIVO' };
        }

        const montoMatch = lower.match(/(\d+)/);
        const monto = montoMatch ? parseInt(montoMatch[0]) : null;
        
        if (!monto) {
            return { comando: 'ERROR', plantilla: '⚠️ ¿De cuánto fue el movimiento?' };
        }
        
        const tipo = lower.includes('gasto') || lower.includes('compra') ? 'egreso' : 'ingreso';
        const clienteMatch = lower.match(/(?:a|para|de)\s+([a-z]+)/);
        const cliente = clienteMatch ? clienteMatch[1] : 'anonimo';
        
        // Etiquetado de valor para futura segmentación de pago
        const nivel = monto > 1000 ? 'VIP' : 'Standard';

        return {
            comando: 'REGISTRO_CONTABLE',
            datos: { tipo, monto, categoria: 'general', cliente, nivel, fecha: new Date().toISOString() },
            plantilla: `✅ ${tipo.toUpperCase()} de $${monto} con ${cliente} registrado. (Nivel: ${nivel})`
        };
    }
};
