import type { ProductoCarrito } from "@interfaces/productoCarrito";

export function enviarMensaje() {
  
    // Obtener los productos del carrito
    const carrito: ProductoCarrito[] = JSON.parse(localStorage.getItem('carrito') || '[]');
    let totalPrecio = 0;
    let envio;
    let pago;
    let infoCliente;
  
    const productosEnCarrito  = carrito.map(producto => {
      totalPrecio = (producto.precio * producto.cantidad) + totalPrecio
      const diseñoId = producto.diseñoId || producto.id; // Usar diseñoId si existe, sino id como fallback
      return `- ${producto.titulo} - ${diseñoId} - Talle ${producto.talla} - Cant: ${producto.cantidad} - Precio: $${producto.precio}`;
    });
  
    // Obtener la información del formulario
    const nombre = (document.querySelector('#nombre') as HTMLInputElement).value;
    const email = (document.querySelector('#email') as HTMLInputElement).value;
    const metodoPago = (document.querySelector('#metodo-pago') as HTMLInputElement).value;
    const tipoEnvio = (document.querySelector('#envio') as HTMLInputElement).value;
    const ciudad = (document.querySelector('#provincia') as HTMLInputElement).value;
    const localidad = (document.querySelector('#localidad') as HTMLInputElement).value;
    const direccion = (document.querySelector('#direccion') as HTMLInputElement).value;
    const codigoPostal = (document.querySelector('#postal') as HTMLInputElement).value;
    const aclaraciones = (document.querySelector('#aclaraciones') as HTMLInputElement).value;
  
  
    //Calcular costo de envio
    if ( tipoEnvio === "Sucursal"){
      envio = "Envio a sucursal:* $6000"
      totalPrecio += 6000;
    } else if (tipoEnvio === "Domicilio") {
      envio = "Envio a domicilio:* $8500"
      totalPrecio += 8500;
    } else if (tipoEnvio === "Motomandado") {
      envio = "Envio Motomandado a coordinar*"
    } else if (tipoEnvio === "Corrientes") {
      envio = "Retiro en Corrientes*"
    } else if (tipoEnvio === "Resistencia") {
      envio = "Retiro en Resistencia*"
    }
  
    // Calcular medios de pago
      if(metodoPago === "Transferencia"){
      pago = `por transferencia:* $${totalPrecio}`
      infoCliente = `Deberá transferir *$${totalPrecio}* al alias *wemasha* (cuenta a nombre de *Alessandro Hernan Fiorio D'Ascenzo*) y enviarnos el comprobante. `
  
    } else if (metodoPago === "Tarjeta") {
      totalPrecio = Math.round(totalPrecio / 0.85); 
      pago = `con tarjeta:* $${totalPrecio} (Hasta en 2 cuotas sin interés)`
      infoCliente = `Le enviaremos un link de pago con el monto de *$${totalPrecio}*, que corresponde al precio de lista de los artículos. El mismo podrá ser abonado hasta en 2 cuotas sin interés.`
    }
  
  
    // Generar el mensaje para WhatsApp
    let mensaje = `Hola *WeMasha!*, quisiera hacerte un pedido de:\n${productosEnCarrito.join("\n")}\n\n` +
      `*- ${envio}\n` + 
      `*- Total a pagar ${pago}\n\n` +
      "*TIEMPO DE ENTREGA ESTIMADO: 2-8 DÍAS HÁBILES*\n\n" +
      "*INFORMACIÓN PARA EL CLIENTE:*\n" +
      `${infoCliente}\n\n` +
      "*NO OLVIDE ENVIARNOS EL COMPROBANTE DE PAGO PARA CONFIRMAR SU PEDIDO.*\n\n" +
      "*DATOS DEL COMPRADOR*:\n" +
      `- Nombre y apellido: ${nombre}\n` +
      `- Email: ${email}\n` +
      `- Modalidad de pago: ${metodoPago}\n` +
      `- Tipo de Envío: ${tipoEnvio}\n` +
      `- Ciudad: ${ciudad}\n` +
      `- Localidad: ${localidad}\n` +
      `- Código Postal: ${codigoPostal}\n` +
      `- Dirección: ${direccion}\n` +
      `- Aclaraciones: ${aclaraciones}\n`;
  
    // Enviar el mensaje por WhatsApp
    window.open("https://wa.me/+543795343171?text=" + encodeURIComponent(mensaje));
  }