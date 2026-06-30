const StorageManager = {
    init: function() {
        if (!localStorage.getItem('nexus_data')) {
            const initialData = { caja: 0, transacciones: [] };
            localStorage.setItem('nexus_data', JSON.stringify(initialData));
            return initialData;
        }
        return JSON.parse(localStorage.getItem('nexus_data'));
    },
    getData: function() { return JSON.parse(localStorage.getItem('nexus_data')); },
    registrarMovimiento: function(tipo, monto) {
        const data = this.getData();
        if (tipo === 'ingreso') data.caja += monto;
        else data.caja -= monto;
        data.transacciones.push({ id: Date.now(), tipo, monto, fecha: new Date().toLocaleDateString() });
        localStorage.setItem('nexus_data', JSON.stringify(data));
        return data.caja;
    },
    exportarCSV: function() {
        const data = this.getData();
        let csvContent = "data:text/csv;charset=utf-8,ID,Tipo,Monto,Fecha\n";
        data.transacciones.forEach(row => { csvContent += `${row.id},${row.tipo},${row.monto},${row.fecha}\n`; });
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", "NEXUS_OS_Reporte.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
