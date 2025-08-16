export interface ProductoCarrito {
    id: string;
    titulo: string;
    talla: string;
    cantidad: number;
    precio: number;
    image: string;
    url?: string; // URL del producto para navegación
    diseño?: string; // Nombre amigable del diseño para mostrar en carrito
    diseñoId?: string; // ID técnico del diseño para mensaje de WhatsApp
}