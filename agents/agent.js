// NEXUS OS - CAPA 4: AGENTE DE VENTAS AUTÓNOMO
const Agent = {
    procesarInstruccion: async function(input) {
        const text = input.toLowerCase();
        
        // Detección de necesidades de respuesta
        if (text.includes('cliente') || text.includes('responde')) {
            return {
                comando: 'GENERAR_RESPUESTA',
                plantilla: this.generarRespuestaCliente(text),
                payload: { tipo: 'WA_RESPONSE' }
            };
        }
        
        // ... (mantener lógica anterior de factura y registro contable)
        return { comando: 'REGISTRO_CONTABLE', plantilla: null, payload: null };
    },

    generarRespuestaCliente: function(contexto) {
        if (contexto.includes('precio')) {
            return "¡Hola! Gracias por preguntar. Contamos con paquetes desde $500 MXN. ¿Te gustaría conocer nuestras promociones vigentes?";
        }
        if (contexto.includes('enojado') || contexto.includes('queja')) {
            return "Lamento mucho el inconveniente. Queremos solucionarlo de inmediato; por favor, bríndame tu número de orden para revisarlo personalmente.";
        }
        return "¡Hola! Muchas gracias por contactarnos. ¿En qué puedo ayudarte hoy para que tu negocio crezca?";
    },

    validarMonto: function(monto) {
        return (isNaN(monto) || monto <= 0) ? { valido: false, error: "Monto inválido" } : { valido: true };
    }
};
