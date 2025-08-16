import type { ProductoCarrito } from "@interfaces/productoCarrito";
import { cargarCarrito } from "@scripts/getCarrito";

// ----------------- Badge helpers -----------------
export function getCartTotalCount(): number {
  try {
    const carrito: ProductoCarrito[] = JSON.parse(localStorage.getItem("carrito") || "[]");
    return Array.isArray(carrito)
      ? carrito.reduce((acc, p: any) => acc + (p?.cantidad ?? 1), 0)
      : 0;
  } catch {
    return 0;
  }
}

export function updateCartBadges(): void {
  const total = getCartTotalCount();
  ["cart-count", "cart-count-mobile"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(total);
  });
}

// init + listeners (misma pestaña y otras)
updateCartBadges();
window.addEventListener("carrito:actualizado", updateCartBadges);
window.addEventListener("storage", (e) => {
  if (e.key === "carrito") updateCartBadges();
});

// ----------------- Actions -----------------
// Eliminar un producto del carrito por index
export function eliminarProducto(index: number) {
  const carrito: ProductoCarrito[] = JSON.parse(localStorage.getItem("carrito") || "[]");
  if (Array.isArray(carrito) && index > -1 && index < carrito.length) {
    carrito.splice(index, 1);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    window.dispatchEvent(new Event("carrito:actualizado"));
  }
  // Removemos la llamada a cargarCarrito() para evitar bucle infinito
  // const subtotal = cargarCarrito();
  // return subtotal;
}

// Vaciar el carrito
export function vaciarCarrito() {
  localStorage.removeItem("carrito");
  window.dispatchEvent(new Event("carrito:actualizado"));
  // Removemos la llamada a cargarCarrito() para evitar bucle infinito
  // const subtotal = cargarCarrito();
  // return subtotal;
  return 0; // Retornamos 0 ya que el carrito está vacío
}

// ----------------- Checkout form validation -----------------
export function validarFormulario() {
  const envioSeleccionado = (document.querySelector("#envio") as HTMLSelectElement)?.value;
  const inputsRequeridos: (HTMLInputElement | HTMLSelectElement | null)[] = [
    document.querySelector("#nombre") as HTMLInputElement | null,
    document.querySelector("#metodo-pago") as HTMLSelectElement | null,
    document.querySelector("#envio") as HTMLSelectElement | null,
  ];

  // Agregar campos según el método de envío
  switch (envioSeleccionado) {
    case 'Corrientes':
      // Solo nombre, método de pago y envío son requeridos
      // Email y campos de correo NO son requeridos
      break;
      
    case 'Motomandado':
      // Agregar dirección de motomandado
      inputsRequeridos.push(
        document.querySelector("#direccion-motomandado") as HTMLInputElement | null
      );
      break;
      
    case 'Sucursal':
    case 'Domicilio':
      // Agregar todos los campos de correo y email
      inputsRequeridos.push(
        document.querySelector("#email") as HTMLInputElement | null,
        document.querySelector("#provincia") as HTMLInputElement | null,
        document.querySelector("#localidad") as HTMLInputElement | null,
        document.querySelector("#direccion") as HTMLInputElement | null,
        document.querySelector("#postal") as HTMLInputElement | null
      );
      break;
      
    default:
      // Si no hay selección, requerir todos los campos
      inputsRequeridos.push(
        document.querySelector("#email") as HTMLInputElement | null,
        document.querySelector("#provincia") as HTMLInputElement | null,
        document.querySelector("#localidad") as HTMLInputElement | null,
        document.querySelector("#direccion") as HTMLInputElement | null,
        document.querySelector("#postal") as HTMLInputElement | null
      );
      break;
  }

  let formularioValido = true;

  inputsRequeridos.forEach((input) => {
    if (!input || input.value.trim() === "") {
      formularioValido = false;
      // acá podrías marcar el campo en rojo si querés
    }
  });

  const errorElement = document.querySelector("#error") as HTMLElement | null;
  if (errorElement) {
    if (!formularioValido) {
      errorElement.classList.remove("hidden");
      errorElement.classList.add("flex");
    } else {
      errorElement.classList.add("hidden");
      errorElement.classList.remove("flex");
    }
  }

  return formularioValido;
}
