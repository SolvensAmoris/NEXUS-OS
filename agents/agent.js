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

        // Inteligencia: Detectar condiciones de venta
        let estado = 'pagado';
        if (lower.includes('crédito') || lower.includes('fiao') || lower.includes('pendiente')) estado = 'credito';
        if (lower.includes('abono') || lower.includes('parcial')) estado = 'abono';

        const tipo = lower.includes('gasto') || lower.includes('compra') ? 'egreso' : 'ingreso';

        return {
            comando: 'REGISTRO_CONTABLE',
            datos: {
                tipo,
                monto,
                estado,
                fecha: new Date().toISOString()
            },
            plantilla: `✅ ${tipo === 'ingreso' ? 'Ingreso' : 'Egreso'} de $${monto} registrado como: ${estado}.`
        };
    }
};
