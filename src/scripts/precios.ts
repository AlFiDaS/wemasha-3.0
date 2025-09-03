import { precios } from "@lib/precios";

export function getPrecios() {
  // Seleccionar todos los elementos con la clase "precio"
  const precioElements: NodeListOf<HTMLParagraphElement> = document.querySelectorAll<HTMLParagraphElement>(".precio");
  const priceInput = document.querySelector("#price") as HTMLInputElement;

  precioElements.forEach((precioElement) => {
    // Obtener el valor del atributo "aria-label"
    const precioSlug = precioElement.getAttribute("aria-label");

    if (!precioSlug) {
      console.error("El atributo aria-label no está definido en este elemento.");
      return;
    }

    // Buscar el precio correspondiente en el array
    const precioData = precios.find((t) => t.slug === precioSlug);

    if (!precioData) {
      console.error(`No se encontró un precio para el slug: ${precioSlug}`);
      return;
    }

    // Actualizar el contenido del elemento con el precio encontrado
    if(priceInput) priceInput.value = precioData.precio.toString();
    
    // Calcular precio por transferencia (15% de descuento)
    const precioTransferencia = Math.round(precioData.precio * 0.85);
    const precioCuota = Math.round(precioData.precio / 2);
    
    // Crear el HTML completo con precio principal, cuotas y descuento por transferencia
    const precioHTML = `
      <div class="flex flex-col gap-1">
        <div class="text-2xl font-bold text-pink-500">
          AR$${precioData.precio.toLocaleString('es-AR')}
        </div>
        <div class="text-xs text-gray-600 leading-tight">
          Hasta 2 cuotas de $${precioCuota.toLocaleString('es-AR')}
        </div>
        <div class="text-xs text-green-600 font-medium leading-tight">
          Transferencia: $${precioTransferencia.toLocaleString('es-AR')}
        </div>
      </div>
    `;
    
    // Actualizar el contenido del elemento
    precioElement.innerHTML = precioHTML;
  });
}