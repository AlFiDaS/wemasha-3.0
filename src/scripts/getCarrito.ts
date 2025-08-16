import type { ProductoCarrito } from "@interfaces/productoCarrito";

const carritoItems = document.querySelector('#carrito-items') as HTMLElement | null;
const carritoVacio = document.querySelector('#carrito-vacio') as HTMLElement | null;
const totalPrecioElement = document.querySelector('#total-precio') as HTMLElement | null;

function toARS(n: number) {
  return n.toLocaleString('es-AR');
}

// Función para actualizar cantidad
export function actualizarCantidad(index: number, nuevaCantidad: number) {
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

// Removemos la función eliminarProducto duplicada para evitar conflictos
// function eliminarProducto(index: number) {
//   let carrito: ProductoCarrito[] = [];
//   try {
//     const raw = localStorage.getItem('carrito') || '[]';
//     carrito = JSON.parse(raw);
//     if (!Array.isArray(carrito)) carrito = [];
//   } catch {
//     carrito = [];
//   }

//   carrito.splice(index, 1);
//   localStorage.setItem('carrito', JSON.stringify(carrito));
//   window.dispatchEvent(new Event('carrito:actualizado'));
// }

export function cargarCarrito(silent: boolean = false): number {
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

    // Actualizar contador de productos a 0
    const carritoCountElement = document.querySelector('#carrito-count') as HTMLElement;
    if (carritoCountElement) {
      carritoCountElement.textContent = '0';
    }

    // Notifica (por si hay badges escuchando) solo si no está en modo silencioso
    if (!silent) {
      window.dispatchEvent(new Event('carrito:actualizado'));
    }
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
      row.classList.add('flex', 'items-start', 'gap-3', 'border-b', 'border-zinc-200', 'py-3', 'px-2', 'rounded-lg', 'hover:bg-gray-50', 'transition-colors');

      row.innerHTML = `
        <!-- Imagen del producto (clickeable) -->
        <a href="${producto.url || '#'}" class="cursor-pointer hover:opacity-80 transition-opacity group relative flex-shrink-0" title="Ver producto">
          <img src="${producto.image}" alt="${producto.titulo}" class="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg shadow-sm" />
          <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <path d="M15 3h6v6"></path>
              <path d="M10 14 21 3"></path>
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            </svg>
          </div>
        </a>

        <!-- Detalles del producto y controles -->
        <div class="flex-1 min-w-0">
          <!-- Información del producto -->
          <div class="flex items-start justify-between mb-2">
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-sm md:text-base text-gray-900 truncate">${producto.titulo}</h3>
              ${producto.diseño ? `<p class="text-xs md:text-sm text-gray-600 mb-1 font-medium">${producto.diseño}</p>` : ''}
              <p class="text-xs md:text-sm text-gray-500">Tamaño: ${producto.talla}</p>
              <p class="text-sm md:text-base font-semibold text-pink-600">$${toARS(precio)}</p>
            </div>
            
            <!-- Botón eliminar -->
            <button class="eliminar-btn text-red-400 hover:text-red-600 transition-colors p-1 ml-2 flex-shrink-0" data-index="${index}" title="Eliminar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
            </button>
          </div>

          <!-- Controles de cantidad y subtotal -->
          <div class="flex items-center justify-between">
            <!-- Controles de cantidad -->
            <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button class="cantidad-btn-minus bg-white hover:bg-gray-200 text-gray-700 font-bold py-1 px-2 rounded-md transition-colors text-sm" data-index="${index}">-</button>
              <span class="cantidad-display font-semibold text-sm min-w-[1.5rem] text-center">${cantidad}</span>
              <button class="cantidad-btn-plus bg-white hover:bg-gray-200 text-gray-700 font-bold py-1 px-2 rounded-md transition-colors text-sm" data-index="${index}">+</button>
            </div>
            
            <!-- Subtotal -->
            <div class="text-right">
              <span class="text-xs text-gray-500">Subtotal:</span>
              <p class="text-sm md:text-base font-semibold text-gray-900">$${toARS(subtotal)}</p>
            </div>
          </div>
        </div>
      `;

      carritoItems.appendChild(row);
    }
  });

  // Actualiza total (una sola vez)
  if (totalPrecioElement) totalPrecioElement.textContent = toARS(total);

  // Actualizar contador de productos en el header
  const carritoCountElement = document.querySelector('#carrito-count') as HTMLElement;
  if (carritoCountElement) {
    const totalProductos = carrito.reduce((acc, producto) => acc + (Number(producto.cantidad) || 1), 0);
    carritoCountElement.textContent = String(totalProductos);
  }

  // Notifica cambios (por si otra vista escucha el total) solo si no está en modo silencioso
  if (!silent) {
    window.dispatchEvent(new Event('carrito:actualizado'));
  }

  return total;
}
