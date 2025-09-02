import { preciosEnvio } from "@lib/precios";

export function sumarEnvio( total: number ){
    const envioSelect = document.querySelector('#envio') as HTMLSelectElement;
    
    if (total === 0 || undefined || null){
        return 0;
    }

    if (envioSelect.value === "Sucursal") {
        const totalPrecio = total + preciosEnvio.sucursal;
        return totalPrecio;
    } else if (envioSelect.value === "Domicilio") {
        const totalPrecio = total + preciosEnvio.domicilio;
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

    // Ahora el precio base es con tarjeta, para transferencia se aplica descuento del 15%
    if ( metodoPagoSelect.value === "Transferencia") {
        const totalPrecio = Math.round(total * 0.85); 
        return totalPrecio;
    } else {
        const totalPrecio = total;
        return totalPrecio;
    }
}