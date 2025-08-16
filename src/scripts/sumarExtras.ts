export function sumarEnvio( total: number ){
    const envioSelect = document.querySelector('#envio') as HTMLSelectElement;

    if (total === 0 || undefined || null){
        return 0;
    }

    //Calcular costo de envio
    if ( envioSelect.value === "Sucursal"){
        const totalPrecio = total + 6000;
        return totalPrecio;
    } else if (envioSelect.value === "Domicilio") {
        const totalPrecio = total + 8500;
        return totalPrecio;
    } else {
        const totalPrecio = total;
        return totalPrecio;
    }
}

export function sumarMetodoPago( total: number ){
    const metodoPagoSelect = document.querySelector('#metodo-pago') as HTMLSelectElement;

    if (total === 0 || undefined || null){
        return 0;
    }

    // Removemos el console.log que estaba causando logs repetidos
    // console.log(total);

    if ( metodoPagoSelect.value === "Tarjeta") {
        const totalPrecio = Math.round(total / 0.85); 
        return totalPrecio;
    } else {
        const totalPrecio = total;
        return totalPrecio;
    }
}