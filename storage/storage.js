// NEXUS OS - CAPA 1: CÓDICE (MEMORIA LOCAL)
const StorageManager = {
    getKey: () => 'nexus_os_data',
    
    init: function() {
        // Si no hay datos, crea la base de datos inicial
        if (!localStorage.getItem(this.getKey())) {
            localStorage.setItem(this.getKey(), JSON.stringify({ caja: 0, transacciones: [] }));
        }
        return this.getData();
    },
    
    getData: function() {
        return JSON.parse(localStorage.getItem(this.getKey()));
    },
    
    saveData: function(data) {
        localStorage.setItem(this.getKey(), JSON.stringify(data));
    },
    
    registrarMovimiento: function(tipo, monto) {
        const data = this.getData();
        
        // Lógica contable básica
        if (tipo === 'ingreso') data.caja += monto;
        if (tipo === 'egreso') data.caja -= monto;
        
        // Guardar el registro histórico
        data.transacciones.push({ 
            id: Date.now(),
            tipo: tipo, 
            monto: monto, 
            fecha: new Date().toISOString() 
        });
        
        this.saveData(data);
        return data.caja; // Devuelve el nuevo saldo
    }
};
