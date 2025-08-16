#!/usr/bin/env node

/**
 * Script para optimizar imágenes de la galería
 * Uso: node scripts/optimize-images.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DESIGNS_PATH = path.join(__dirname, '../src/assets/designs');
const MAX_FILE_SIZE = 500 * 1024; // 500KB máximo
const QUALITY = 80; // Calidad para WebP

async function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    console.error(`Error al leer archivo: ${filePath}`, error.message);
    return 0;
  }
}

function isImageFile(filename) {
  return /\.(png|jpg|jpeg|webp|svg)$/i.test(filename);
}

function shouldOptimize(filePath) {
  const size = getFileSize(filePath);
  return size > MAX_FILE_SIZE;
}

async function optimizeImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const dir = path.dirname(filePath);
  const name = path.basename(filePath, ext);
  
  console.log(`🔧 Analizando: ${path.basename(filePath)}`);
  
  const size = getFileSize(filePath);
  const sizeKB = (size / 1024).toFixed(1);
  
  console.log(`   📁 Tamaño actual: ${sizeKB}KB`);
  console.log(`   ⚠️  Necesita optimización: ${size > MAX_FILE_SIZE ? 'SÍ' : 'NO'}`);
  
  if (size > MAX_FILE_SIZE) {
    console.log(`   💡 Recomendación: Reducir a menos de ${MAX_FILE_SIZE / 1024}KB`);
  }
  
  return { filePath, size, needsOptimization: size > MAX_FILE_SIZE };
}

async function scanDirectory(dirPath) {
  const results = [];
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    
    try {
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        const subResults = await scanDirectory(fullPath);
        results.push(...subResults);
      } else if (isImageFile(item)) {
        const result = await optimizeImage(fullPath);
        results.push(result);
      }
    } catch (error) {
      console.error(`Error al procesar: ${fullPath}`, error.message);
    }
  }
  
  return results;
}

async function main() {
  console.log('🚀 Iniciando análisis de imágenes...\n');
  
  if (!fs.existsSync(DESIGNS_PATH)) {
    console.error('❌ No se encontró el directorio de diseños');
    return;
  }
  
  const results = await scanDirectory(DESIGNS_PATH);
  
  // Análisis de resultados
  const totalFiles = results.length;
  const filesNeedingOptimization = results.filter(r => r.needsOptimization);
  const totalSize = results.reduce((sum, r) => sum + r.size, 0);
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);
  
  console.log('\n📊 RESUMEN DEL ANÁLISIS:');
  console.log(`📁 Total de archivos: ${totalFiles}`);
  console.log(`📦 Tamaño total: ${totalSizeMB}MB`);
  console.log(`⚠️  Archivos que necesitan optimización: ${filesNeedingOptimization.length}`);
  
  if (filesNeedingOptimization.length > 0) {
    console.log('\n🚨 ARCHIVOS QUE NECESITAN OPTIMIZACIÓN:');
    filesNeedingOptimization
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)
      .forEach(result => {
        const sizeKB = (result.size / 1024).toFixed(1);
        console.log(`   ${path.basename(result.filePath)} - ${sizeKB}KB`);
      });
  }
  
  console.log('\n✅ Análisis completado');
  console.log('\n📋 RECOMENDACIONES DE OPTIMIZACIÓN:');
  console.log('1. 🖼️  Usar WebP para mejor compresión (ya implementado)');
  console.log('2. 📏 Reducir resolución de imágenes grandes');
  console.log('3. 🎯 Implementar thumbnails para la galería');
  console.log('4. ⚡ Usar lazy loading (ya implementado)');
  console.log('5. 🌐 Considerar CDN para imágenes');
  console.log('6. 🔄 Implementar compresión automática en build');
  console.log('7. 📱 Optimizar para diferentes tamaños de pantalla');
}

main().catch(console.error);
