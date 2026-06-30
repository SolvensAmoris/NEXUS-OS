const Agent = {
    procesarInstruccion: async function(texto) {
        const lower = texto.toLowerCase();
        const montoMatch = lower.match(/(\d+)/);
        const monto = montoMatch ? parseInt(montoMatch[0]) : null;

        if (!monto) {
            return { comando: 'ERROR', plantilla: '⚠️ ¿De cuánto fue la cantidad?' };
        }

        // Inferir tipo
        const tipo = lower.includes('gasto') || lower.includes('compra') ? 'egreso' : 'ingreso';
        
        // Autoclasificación inteligente
        let categoria = 'general';
        if (lower.includes('servicio') || lower.includes('asesoría')) categoria = 'servicio';
        else if (lower.includes('comida') || lower.includes('alimento')) categoria = 'alimentos';
        else if (lower.includes('renta') || lower.includes('luz')) categoria = 'fijos';

        // Estado
        let estado = lower.includes('crédito') || lower.includes('fiao') ? 'credito' : 'pagado';
        if (lower.includes('abono')) estado = 'abono';

        return {
            comando: 'REGISTRO_CONTABLE',
            datos: { tipo, monto, categoria, estado, cliente: 'anonimo', fecha: new Date().toISOString() },
            plantilla: `✅ ${tipo.toUpperCase()} de $${monto} registrado como ${categoria} (${estado}).`
        };
    }
};
