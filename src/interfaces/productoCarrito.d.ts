export interface ProductoCarrito {
    id: string;
    titulo: string;
    talla: string;
    cantidad: number;
    precio: number;
    image: string;
    url?: string; // URL del producto para navegación
}