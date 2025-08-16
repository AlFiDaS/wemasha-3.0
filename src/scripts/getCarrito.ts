import type { ProductoCarrito } from "@interfaces/productoCarrito";

const carritoItems = document.querySelector('#carrito-items') as HTMLElement | null;
const carritoVacio = document.querySelector('#carrito-vacio') as HTMLElement | null;
const totalPrecioElement = document.querySelector('#total-precio') as HTMLElement | null;

function toARS(n: number) {
  return n.toLocaleString('es-AR');
}

// Función para actualizar cantidad
function actualizarCantidad(index: number, nuevaCantidad: number) {
  let carrito: ProductoCarrito[] = [];
  try {
    const raw = localStorage.getItem('carrito') || '[]';
    carrito = JSON.parse(raw);
    if (!Array.isArray(carrito)) carrito = [];
  } catch {
    carrito = [];
  }

  // Si la cantidad es 0 o menor, eliminar el producto
  if (nuevaCantidad <= 0) {
    carrito.splice(index, 1);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    window.dispatchEvent(new Event('carrito:actualizado'));
    return;
  }

  // Actualizar la cantidad del producto
  if (carrito[index]) {
    carrito[index].cantidad = nuevaCantidad;
    localStorage.setItem('carrito', JSON.stringify(carrito));
    window.dispatchEvent(new Event('carrito:actualizado'));
  }
}

// Función para eliminar producto
function eliminarProducto(index: number) {
  let carrito: ProductoCarrito[] = [];
  try {
    const raw = localStorage.getItem('carrito') || '[]';
    carrito = JSON.parse(raw);
    if (!Array.isArray(carrito)) carrito = [];
  } catch {
    carrito = [];
  }

  carrito.splice(index, 1);
  localStorage.setItem('carrito', JSON.stringify(carrito));
  window.dispatchEvent(new Event('carrito:actualizado'));
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
        <!-- Imagen del producto (clickeable) -->
        <a href="${producto.url || '#'}" class="cursor-pointer hover:opacity-80 transition-opacity group relative" title="Ver producto">
          <img src="${producto.image}" alt="${producto.titulo}" class="w-20 h-20 object-cover rounded-md" />
          <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-md flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <path d="M15 3h6v6"></path>
              <path d="M10 14 21 3"></path>
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            </svg>
          </div>
        </a>

        <!-- Detalles del producto -->
        <div class="flex flex-col w-full">
          <span class="font-semibold text-lg">${producto.titulo}</span>
          <span class="text-sm text-gray-600">Tamaño: ${producto.talla}</span>
          <span class="text-lg font-semibold">$${toARS(precio)}</span>
        </div>

        <!-- Controles de cantidad -->
        <div class="flex flex-col items-center gap-2">
          <div class="flex items-center gap-2">
            <button class="cantidad-btn-minus bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-3 rounded transition-colors" data-index="${index}">-</button>
            <span class="cantidad-display font-semibold text-lg min-w-[2rem] text-center">${cantidad}</span>
            <button class="cantidad-btn-plus bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-3 rounded transition-colors" data-index="${index}">+</button>
          </div>
          <span class="text-sm text-gray-600">Subtotal: $${toARS(subtotal)}</span>
        </div>

        <!-- Botón para eliminar el producto -->
        <button class="text-red-500 eliminar-btn hover:text-red-700 transition-colors" data-index="${index}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          </svg>
        </button>
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
