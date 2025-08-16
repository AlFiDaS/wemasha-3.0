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
    
    // Formatear el precio sin espacios que puedan causar saltos de línea
    const precioFormateado = `AR$${precioData.precio.toLocaleString('es-AR')}`;
    precioElement.textContent = precioFormateado;
    
    // Asegurar que el precio se mantenga en una sola línea
    precioElement.style.whiteSpace = 'nowrap';
    precioElement.style.wordBreak = 'keep-all';
    precioElement.style.overflowWrap = 'normal';
    precioElement.style.hyphens = 'none';
    precioElement.style.display = 'inline-block';
  });
}