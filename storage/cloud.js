// NEXUS OS - CONEXIÓN CLOUD (SUPABASE)
const supabase = supabase.createClient('TU_SUPABASE_URL', 'TU_SUPABASE_ANON_KEY');

const CloudManager = {
    async guardarVenta(venta) {
        try {
            const { data, error } = await supabase
                .from('ventas')
                .insert([venta]);
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error("Error al guardar en la nube:", error);
            return { success: false, error };
        }
    }
};
