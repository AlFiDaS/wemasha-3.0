export function saveCarrito() {
  const form = document.querySelector("form") as HTMLFormElement | null;
  const btnSubmit = document.querySelector("#btn-submit") as HTMLButtonElement | null;
  if (!form || !btnSubmit) return;

  const alertSuccess = document.querySelector("#alert-success") as HTMLParagraphElement | null;
  const alertError   = form.querySelector("#alert-error") as HTMLParagraphElement | null;

  btnSubmit.setAttribute("disabled", "disabled");

  // Inputs
  const tallaElement   = form.querySelector("#talle")  as HTMLSelectElement | null;
  const cantidadEl     = form.querySelector("#cantidad") as HTMLInputElement | null;
  const prendaEl       = form.querySelector("#prenda") as HTMLInputElement | null;
  const imageEl        = form.querySelector("#image")  as HTMLInputElement | null;
  const diseñoEl       = form.querySelector("#diseño") as HTMLInputElement | null;
  const priceEl        = form.querySelector("#price")  as HTMLInputElement | null;

  // Valores con fallback
  const talla    = (tallaElement?.value ?? "0").trim();
  const cantidad = Math.max(1, parseInt(cantidadEl?.value ?? "1", 10) || 1);
  const prenda   = (prendaEl?.value ?? "").trim();
  const image    = (imageEl?.value ?? "").trim();
  const diseño   = (diseñoEl?.value ?? "").trim();
  const precio   = parseFloat(priceEl?.value ?? "0") || 0;

  // Validaciones básicas
  if (talla === "0" || cantidad <= 0 || !prenda || !diseño) {
    alertError?.classList.remove("hidden");
    btnSubmit.removeAttribute("disabled");
    setTimeout(() => alertError?.classList.add("hidden"), 2500);
    return;
  }

  // Producto
  const producto = {
    id: diseño,          // tu identificador de diseño
    titulo: prenda,
    precio,
    image,
    talla,
    cantidad,
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
  btnSubmit.removeAttribute("disabled");
  alertSuccess?.classList.remove("hidden");
  if (tallaElement) tallaElement.value = "0";
  if (cantidadEl) cantidadEl.value = "";
  setTimeout(() => alertSuccess?.classList.add("hidden"), 2500);
}
