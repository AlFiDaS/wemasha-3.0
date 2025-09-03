const fs = require('fs');
const path = require('path');

/*
 * SCRIPT DE REORDENAMIENTO DE PRENDAS
 * 
 * ESTADO ACTUAL:
 * - Las "Puperas Comunes" permanecen OCULTAS hasta que se suban todas las fotos
 * - Solo se reordenan las prendas existentes
 * - El orden actual es: Remera → Remera Oversize → Pupera Oversize → Buzo → Musculosa M → Musculosa H
 * 
 * CUANDO SE SUBAN LAS FOTOS:
 * - Descomentar la sección de "Pupera Común" en la función reordenarPrendas()
 * - Agregar 'Pupera Común' al array ordenCorrecto
 * - Ejecutar el script nuevamente
 */

// Orden correcto de las prendas (Pupera Común oculta hasta que se suban las fotos)
const ordenCorrecto = [
    'Remera',
    'Remera Oversize', 
    'Pupera Oversize',
    'Buzo',
    'Musculosa M',
    'Musculosa H'
];

// Función para reordenar las prendas
function reordenarPrendas(content) {
    // Buscar el array de prendas
    const prendasMatch = content.match(/prendas:\s*\[([\s\S]*?)\]/);
    if (!prendasMatch) return content;

    const prendasSection = prendasMatch[1];
    
    // Extraer cada prenda individual
    const prendas = [];
    const prendaRegex = /\{[^}]*title:\s*'([^']+)'[^}]*\}/g;
    let match;
    
    while ((match = prendaRegex.exec(prendasSection)) !== null) {
        const fullMatch = match[0];
        const title = match[1];
        prendas.push({ title, content: fullMatch });
    }

    // NOTA: Las "Puperas Comunes" permanecen ocultas hasta que se suban las fotos
    // Solo se reordenan las prendas existentes
    // TODO: Descomentar cuando se suban todas las fotos de pupera-comun.jpg

    // Reordenar según el orden correcto
    const prendasOrdenadas = [];
    for (const tituloCorrecto of ordenCorrecto) {
        const prenda = prendas.find(p => p.title === tituloCorrecto);
        if (prenda) {
            prendasOrdenadas.push(prenda.content);
        }
    }

    // Reconstruir el contenido
    const prendasOrdenadasStr = prendasOrdenadas.join(',\n    ');
    const nuevoContenido = content.replace(
        prendasMatch[0],
        `prendas: [\n    ${prendasOrdenadasStr}\n]`
    );

    return nuevoContenido;
}

// Función para procesar un archivo
function procesarArchivo(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const nuevoContent = reordenarPrendas(content);
        
        if (content !== nuevoContent) {
            fs.writeFileSync(filePath, nuevoContent, 'utf8');
            console.log(`✅ Reordenado: ${filePath}`);
            return true;
        } else {
            console.log(`⏭️  Sin cambios: ${filePath}`);
            return false;
        }
    } catch (error) {
        console.error(`❌ Error en ${filePath}:`, error.message);
        return false;
    }
}

// Función para procesar directorio recursivamente
function procesarDirectorio(dirPath) {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            procesarDirectorio(fullPath);
        } else if (item.endsWith('.md')) {
            procesarArchivo(fullPath);
        }
    }
}

// Directorio principal de productos
const productosDir = path.join(__dirname, 'src', 'content', 'productos');

console.log('🔄 Iniciando reordenamiento de prendas...\n');

if (fs.existsSync(productosDir)) {
    procesarDirectorio(productosDir);
    console.log('\n✅ Reordenamiento completado!');
} else {
    console.error('❌ No se encontró el directorio de productos');
}
