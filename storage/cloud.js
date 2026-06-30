const supabaseUrl = 'https://tfxqiddzudcgfiwducwi.supabase.co';
const supabaseKey = 'sb_publishable_WkTUcPrIVb2VWl6GzLxkmQ_CPeJbzMD';

const supabase = supabase.createClient(supabaseUrl, supabaseKey);

const CloudManager = {
    guardarVenta: async function(datos) {
        try {
            // Se inserta todo en minúsculas para mantener la estética
            const { data, error } = await supabase
                .from('ventas')
                .insert([{
                    tipo: (datos.tipo || 'ingreso').toLowerCase(),
                    monto: datos.monto || 0,
                    fecha: datos.fecha || new Date().toISOString(),
                    categoria: (datos.categoria || 'n/a').toLowerCase(),
                    cliente: (datos.cliente || 'n/a').toLowerCase(),
                    metodo_pago: (datos.metodo_pago || 'n/a').toLowerCase(),
                    notas: (datos.notas || '').toLowerCase()
                }]);
            
            if (error) throw error;
            return data;
        } catch (err) {
            console.error("Error al registrar:", err);
            return null;
        }
    }
};
