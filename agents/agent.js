const Agent = {
    procesarInstruccion: async function(texto) {
        const lowerTexto = texto.toLowerCase();
        
        // Extracción de datos
        const montoMatch = lowerTexto.match(/(\d+)/);
        const monto = montoMatch ? parseInt(montoMatch[0]) : null;
        
        if (!monto) {
            return {
                comando: 'ERROR',
                plantilla: '⚠️ Para registrar una transacción, necesito el monto. Por favor, especifica la cantidad.'
            };
        }

        // Determinación de tipo y entidad
        const tipo = lowerTexto.includes('gasto') || lowerTexto.includes('compra') ? 'egreso' : 'ingreso';
        const cliente = this.detectarEntidad(lowerTexto, ['juan', 'maria', 'empresa', 'cliente']);
        const categoria = lowerTexto.includes('servicio') ? 'servicio' : 'general';

        return {
            comando: 'REGISTRO_CONTABLE',
            datos: {
                tipo: tipo,
                monto: monto,
                cliente: cliente,
                categoria: categoria,
                fecha: new Date().toISOString()
            },
            plantilla: `✅ Registro procesado: ${tipo.toUpperCase()} de $${monto} registrado con éxito.`
        };
    },

    detectarEntidad: function(texto, lista) {
        for (let item of lista) {
            if (texto.includes(item)) return item;
        }
        return 'anonimo';
    }
};
