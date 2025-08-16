export function saveCarrito() {
  const btnSubmit = document.querySelector("#btn-submit") as HTMLButtonElement | null;
  if (!btnSubmit) return;

  const alertSuccess = document.querySelector("#alert-success") as HTMLDivElement | null;
  const talleError = document.querySelector("#talle-error") as HTMLParagraphElement | null;

  // Inputs
  const talleSeleccionado = document.querySelector("#talle-seleccionado") as HTMLInputElement | null;
  const prendaEl = document.querySelector("#prenda") as HTMLInputElement | null;
  const imageEl = document.querySelector("#image") as HTMLInputElement | null;
  const diseñoEl = document.querySelector("#diseño") as HTMLInputElement | null;
  const diseñoIdEl = document.querySelector("#diseño-id") as HTMLInputElement | null;
  const priceEl = document.querySelector("#price") as HTMLInputElement | null;

  // Valores con fallback
  const talla = (talleSeleccionado?.value ?? "").trim();
  const cantidad = 1; // Siempre agregar 1 unidad
  const prenda = (prendaEl?.value ?? "").trim();
  const image = (imageEl?.value ?? "").trim();
  const diseño = (diseñoEl?.value ?? "").trim();
  const diseñoId = (diseñoIdEl?.value ?? "").trim();
  const precio = parseFloat(priceEl?.value ?? "0") || 0;

  // Validaciones básicas
  if (!talla || !prenda || !diseño) {
    talleError?.classList.remove("hidden");
    setTimeout(() => talleError?.classList.add("hidden"), 2500);
    return;
  }

  // Producto
  const producto = {
    id: diseñoId,        // ID técnico para identificación
    titulo: prenda,
    precio,
    image,
    talla,
    cantidad,
    diseño: diseño,      // Nombre amigable para mostrar en carrito
    diseñoId: diseñoId,  // ID técnico para mensaje de WhatsApp
    url: window.location.pathname, // URL actual del producto
  };

  // Leer carrito
  let carrito: typeof producto[] = [];
  try {
    carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
    if (!Array.isArray(carrito)) carrito = [];
  } catch {
    carrito = [];
  }

  // Merge por (id + talla + titulo)
  const index = carrito.findIndex(
    (item) => item.id === producto.id && item.talla === producto.talla && item.titulo === producto.titulo
  );
  if (index > -1) {
    carrito[index].cantidad += producto.cantidad;
  } else {
    carrito.push(producto);
  }

  // Guardar y notificar
  localStorage.setItem("carrito", JSON.stringify(carrito));
  window.dispatchEvent(new Event("carrito:actualizado")); // <-- importante para actualizar badges

  // UI feedback
  alertSuccess?.classList.remove("hidden");
  setTimeout(() => alertSuccess?.classList.add("hidden"), 2500);
}
