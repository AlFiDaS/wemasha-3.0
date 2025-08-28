// scripts/verify-images.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para verificar si un archivo existe
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

// Función para generar URLs optimizadas (misma lógica que en designs.ts)
function generateOptimizedUrls(originalUrl, category) {
  const urlParts = originalUrl.split('/');
  const fileName = urlParts[urlParts.length - 1];
  const fileNameWithoutExt = fileName.replace(/\.(png|jpg|jpeg|webp|svg)$/i, '');
  
  return {
    thumbnail: `/thumbnails/${category}/${fileNameWithoutExt}.webp`,
    optimized: `/optimized/${category}/${fileNameWithoutExt}.webp`
  };
}

// Función para verificar imágenes en una categoría
function verifyCategoryImages(categoryPath, categoryName) {
  console.log(`\n🔍 Verificando categoría: ${categoryName}`);
  
  if (!fs.existsSync(categoryPath)) {
    console.log(`❌ La carpeta ${categoryPath} no existe`);
    return { missing: [], total: 0 };
  }
  
  const files = fs.readdirSync(categoryPath);
  const imageFiles = files.filter(file => 
    /\.(png|jpg|jpeg|webp|svg)$/i.test(file)
  );
  
  console.log(`📁 Encontrados ${imageFiles.length} archivos de imagen`);
  
  const missing = [];
  
  imageFiles.forEach(file => {
    const originalPath = path.join(categoryPath, file);
    const { thumbnail, optimized } = generateOptimizedUrls(file, categoryName);
    
    const thumbnailPath = path.join(__dirname, '..', 'public', thumbnail);
    const optimizedPath = path.join(__dirname, '..', 'public', optimized);
    
    if (!fileExists(thumbnailPath)) {
      missing.push({ type: 'thumbnail', path: thumbnail, original: file });
      console.log(`❌ Falta thumbnail: ${thumbnail}`);
    }
    
    if (!fileExists(optimizedPath)) {
      missing.push({ type: 'optimized', path: optimized, original: file });
      console.log(`❌ Falta optimized: ${optimized}`);
    }
  });
  
  if (missing.length === 0) {
    console.log(`✅ Todas las imágenes de ${categoryName} están optimizadas`);
  }
  
  return { missing, total: imageFiles.length };
}

// Función principal
function main() {
  console.log('🔍 Iniciando verificación de imágenes optimizadas...\n');
  
  const designsPath = path.join(__dirname, '..', 'src', 'assets', 'designs');
  const categories = fs.readdirSync(designsPath).filter(dir => 
    fs.statSync(path.join(designsPath, dir)).isDirectory()
  );
  
  console.log(`📂 Categorías encontradas: ${categories.join(', ')}`);
  
  let totalMissing = 0;
  let totalImages = 0;
  
  categories.forEach(category => {
    const categoryPath = path.join(designsPath, category);
    const { missing, total } = verifyCategoryImages(categoryPath, category);
    
    totalMissing += missing.length;
    totalImages += total;
  });
  
  console.log('\n📊 RESUMEN:');
  console.log(`📁 Total de imágenes: ${totalImages}`);
  console.log(`❌ Total de archivos faltantes: ${totalMissing}`);
  
  if (totalMissing === 0) {
    console.log('\n🎉 ¡Todas las imágenes están correctamente optimizadas!');
  } else {
    console.log('\n⚠️  Hay archivos faltantes. Ejecuta el script de optimización:');
    console.log('   npm run optimize-images');
  }
}

// Ejecutar si es el archivo principal
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { verifyCategoryImages, generateOptimizedUrls };
