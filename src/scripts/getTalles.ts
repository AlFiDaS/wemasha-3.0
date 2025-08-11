import { talles } from '@lib/talles';

export function getTalles() {
    const selectElement = document.getElementById("talle") as HTMLSelectElement;
    const prendaTalles = selectElement.getAttribute("aria-label");
    if (!prendaTalles) return;

    const tallesArray = talles.find((t) => t.slug === prendaTalles);

    if (!tallesArray) {
      console.error(
        `No se encontró un grupo de talles con el slug: ${prendaTalles}`
      );
      return;
    }

    if(!tallesArray.items.length){
      // Mostrar mensaje que no hay stock disponible
      selectElement.innerHTML =
      '<option value="0" selected disabled>Sin Stock Disponible</option>';
      return;
    }

    // Limpiar las opciones actuales (excepto el placeholder inicial)
    selectElement.innerHTML =
      '<option value="0" selected disabled>Talles disponibles</option>';

    // Agregar las nuevas opciones al select
    tallesArray.items.forEach(({ id, label }) => {
      const option = document.createElement("option");
      option.value = id;
      option.textContent = label;
      selectElement.appendChild(option);
    });
  }