// NEXUS OS - AGENTE ALQUÍMICO (SOLVENS AMORIS)
const Agent = {
    procesarInstruccion: async function(input) {
        const text = input.toLowerCase();
        
        // Detección de intenciones con enfoque en consciencia
        if (text.includes('cliente') || text.includes('responde')) {
            return {
                comando: 'GENERAR_RESPUESTA',
                plantilla: this.generarRespuestaConsciente(text),
                payload: { tipo: 'WA_RESPONSE' }
            };
        }
        
        return { comando: 'REGISTRO_CONTABLE', plantilla: null, payload: null };
    },

    generarRespuestaConsciente: function(contexto) {
        // Respuestas impregnadas de tu filosofía
        if (contexto.includes('precio')) {
            return "El valor de esta energía (precio) inicia en $500 MXN. Todo intercambio es una forma de transmutación. ¿Deseas alinear tu proyecto con nuestra propuesta?";
        }
        if (contexto.includes('queja') || contexto.includes('enojado')) {
            return "Percibo una sombra en nuestra sincronía. Como buscador de soluciones, te pido que me entregues el número de orden; observemos juntos dónde ocurrió la ruptura para restaurar el orden.";
        }
        // Respuesta arquetípica por defecto
        return "El flujo de tu consciencia es importante para la expansión de tu empresa. ¿Qué área de tu negocio requiere hoy de nuestra mirada observadora?";
    },

    validarMonto: function(monto) {
        // Validación con toque sutil
        return (isNaN(monto) || monto <= 0) 
            ? { valido: false, error: "La cifra no es armónica. Por favor, ingresa un valor numérico real." } 
            : { valido: true };
    }
};
