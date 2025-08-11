import type { ProductoCarrito } from "@interfaces/productoCarrito";

const carritoItems = document.querySelector('#carrito-items') as HTMLElement | null;
const carritoVacio = document.querySelector('#carrito-vacio') as HTMLElement | null;
const totalPrecioElement = document.querySelector('#total-precio') as HTMLElement | null;

function toARS(n: number) {
  return n.toLocaleString('es-AR');
}

export function cargarCarrito(): number {
  // Leer carrito
  let carrito: ProductoCarrito[] = [];
  try {
    const raw = localStorage.getItem('carrito') || '[]';
    carrito = JSON.parse(raw);
    if (!Array.isArray(carrito)) carrito = [];
  } catch {
    carrito = [];
  }

  // Limpia contenedor
  if (carritoItems) carritoItems.innerHTML = '';

  // Si está vacío
  if (!carrito.length) {
    if (carritoVacio) {
      carritoVacio.classList.remove('hidden');
      carritoVacio.classList.add('flex');
    }
    if (totalPrecioElement) totalPrecioElement.textContent = '0';

    // Notifica (por si hay badges escuchando)
    window.dispatchEvent(new Event('carrito:actualizado'));
    return 0;
  }

  // Oculta vacío
  if (carritoVacio) {
    carritoVacio.classList.add('hidden');
    carritoVacio.classList.remove('flex');
  }

  // Render y total
  let total = 0;

  carrito.forEach((producto, index) => {
    const precio = Number(producto.precio) || 0;
    const cantidad = Number((producto as any).cantidad) || 1;
    const subtotal = precio * cantidad;
    total += subtotal;

    if (carritoItems) {
      const row = document.createElement('div');
      row.classList.add('flex', 'items-center', 'gap-4', 'border-b', 'border-zinc-300', 'py-4');

      row.innerHTML = `
        <!-- Imagen del producto -->
        <img src="${producto.image}" alt="${producto.titulo}" class="w-20 h-20 object-cover rounded-md" />

        <!-- Detalles del producto -->
        <div class="flex flex-col w-full">
          <span class="font-semibold text-lg">${producto.titulo}</span>
          <span class="text-sm text-gray-600">Tamaño: ${producto.talla}</span>
          <span class="text-sm text-gray-600">Cantidad: ${cantidad}</span>
          <span class="text-lg font-semibold">$${toARS(precio)}</span>
        </div>

        <!-- Botón para eliminar el producto -->
        <button class="text-red-500 eliminar-btn" data-index="${index}">Eliminar</button>
      `;

      carritoItems.appendChild(row);
    }
  });

  // Actualiza total (una sola vez)
  if (totalPrecioElement) totalPrecioElement.textContent = toARS(total);

  // Notifica cambios (por si otra vista escucha el total)
  window.dispatchEvent(new Event('carrito:actualizado'));

  return total;
}
