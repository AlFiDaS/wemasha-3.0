// scripts/check-images.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verificando imágenes...');

// Verificar una categoría específica
const category = 'artistas-y-bandas';
const sourcePath = path.join(__dirname, '..', 'src', 'assets', 'designs', category);
const thumbPath = path.join(__dirname, '..', 'public', 'thumbnails', category);
const optPath = path.join(__dirname, '..', 'public', 'optimized', category);

console.log('📁 Rutas:');
console.log('Source:', sourcePath);
console.log('Thumbnails:', thumbPath);
console.log('Optimized:', optPath);

if (fs.existsSync(sourcePath)) {
  const sourceFiles = fs.readdirSync(sourcePath);
  console.log(`\n📂 Archivos fuente en ${category}:`, sourceFiles.length);
  
  if (fs.existsSync(thumbPath)) {
    const thumbFiles = fs.readdirSync(thumbPath);
    console.log(`📂 Thumbnails en ${category}:`, thumbFiles.length);
  } else {
    console.log('❌ No existe carpeta de thumbnails');
  }
  
  if (fs.existsSync(optPath)) {
    const optFiles = fs.readdirSync(optPath);
    console.log(`📂 Optimized en ${category}:`, optFiles.length);
  } else {
    console.log('❌ No existe carpeta de optimized');
  }
} else {
  console.log('❌ No existe carpeta fuente');
}
