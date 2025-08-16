import { talles } from '@lib/talles';

export function getTalles() {
    const prendaTallesElement = document.getElementById("prenda-talles") as HTMLInputElement;
    if (!prendaTallesElement) {
        console.error("No se encontró el elemento prenda-talles");
        return [];
    }

    const prendaTalles = prendaTallesElement.value;
    if (!prendaTalles) {
        console.error("No se encontró el valor de talles para la prenda");
        return [];
    }

    const tallesArray = talles.find((t) => t.slug === prendaTalles);

    if (!tallesArray) {
        console.error(`No se encontró un grupo de talles con el slug: ${prendaTalles}`);
        return [];
    }

    if (!tallesArray.items.length) {
        console.warn("No hay talles disponibles para esta prenda");
        return [];
    }

    // Retornar solo los IDs de los talles para los botones
    return tallesArray.items.map(item => item.id);
}