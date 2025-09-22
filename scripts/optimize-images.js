#!/usr/bin/env node

/**
 * Script para optimizar imágenes de la galería
 * Uso: node scripts/optimize-images.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DESIGNS_PATH = path.join(__dirname, '../src/assets/designs');
const THUMBNAILS_PATH = path.join(__dirname, '../public/thumbnails');
const OPTIMIZED_PATH = path.join(__dirname, '../public/optimized');

// Configuración de optimización
const OPTIMIZATION_CONFIG = {
  thumbnail: {
    width: 200,
    height: 200,
    quality: 70,
    format: 'webp'
  },
  gallery: {
    width: 400,
    height: 400,
    quality: 80,
    format: 'webp'
  },
  full: {
    quality: 85,
    format: 'webp'
  }
};

async function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Creado directorio: ${dirPath}`);
  }
}

function isImageFile(filename) {
  return /\.(png|jpg|jpeg|webp|svg)$/i.test(filename);
}

async function optimizeImage(inputPath, outputPath, options) {
  try {
    const { width, height, quality, format } = options;
    
    let pipeline = sharp(inputPath);
    
    if (width && height) {
      pipeline = pipeline.resize(width, height, { 
        fit: 'inside',
        withoutEnlargement: true 
      });
    }
    
    if (format === 'webp') {
      pipeline = pipeline.webp({ quality });
    } else if (format === 'avif') {
      pipeline = pipeline.avif({ quality });
    }
    
    await pipeline.toFile(outputPath);
    
    const originalSize = fs.statSync(inputPath).size;
    const optimizedSize = fs.statSync(outputPath).size;
    const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
    
    return {
      success: true,
      originalSize,
      optimizedSize,
      savings: parseFloat(savings)
    };
  } catch (error) {
    console.error(`❌ Error optimizando ${inputPath}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function processImage(filePath) {
  const relativePath = path.relative(DESIGNS_PATH, filePath);
  const fileName = path.basename(filePath, path.extname(filePath));
  const category = path.dirname(relativePath);
  
  console.log(`🖼️  Procesando: ${relativePath}`);
  
  // Crear directorios de salida
  const thumbnailDir = path.join(THUMBNAILS_PATH, category);
  const optimizedDir = path.join(OPTIMIZED_PATH, category);
  
  await ensureDirectoryExists(thumbnailDir);
  await ensureDirectoryExists(optimizedDir);
  
  const results = [];
  
  // Generar thumbnail
  const thumbnailPath = path.join(thumbnailDir, `${fileName}.webp`);
  const thumbnailResult = await optimizeImage(filePath, thumbnailPath, OPTIMIZATION_CONFIG.thumbnail);
  results.push(Object.assign({ type: 'thumbnail' }, thumbnailResult));
  
  // Generar versión optimizada para galería
  const galleryPath = path.join(optimizedDir, `${fileName}.webp`);
  const galleryResult = await optimizeImage(filePath, galleryPath, OPTIMIZATION_CONFIG.gallery);
  results.push(Object.assign({ type: 'gallery' }, galleryResult));
  
  // Generar versión optimizada completa
  const fullPath = path.join(optimizedDir, `${fileName}_full.webp`);
  const fullResult = await optimizeImage(filePath, fullPath, OPTIMIZATION_CONFIG.full);
  results.push(Object.assign({ type: 'full' }, fullResult));
  
  return results;
}

async function scanAndOptimizeDirectory(dirPath) {
  const results = [];
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    
    try {
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        const subResults = await scanAndOptimizeDirectory(fullPath);
        results = results.concat(subResults);
      } else if (isImageFile(item)) {
        const imageResults = await processImage(fullPath);
        results.push({ file: fullPath, results: imageResults });
      }
    } catch (error) {
      console.error(`❌ Error procesando: ${fullPath}`, error.message);
    }
  }
  
  return results;
}

async function main() {
  console.log('🚀 Iniciando optimización de imágenes...\n');
  
  if (!fs.existsSync(DESIGNS_PATH)) {
    console.error('❌ No se encontró el directorio de diseños');
    return;
  }
  
  // Crear directorios de salida
  await ensureDirectoryExists(THUMBNAILS_PATH);
  await ensureDirectoryExists(OPTIMIZED_PATH);
  
  const results = await scanAndOptimizeDirectory(DESIGNS_PATH);
  
  // Análisis de resultados
  const totalFiles = results.length;
  const successfulOptimizations = results.filter(r => 
    r.results.every(result => result.success)
  ).length;
  
  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  let totalSavings = 0;
  
  results.forEach(({ results: imageResults }) => {
    imageResults.forEach(result => {
      if (result.success) {
        totalOriginalSize += result.originalSize;
        totalOptimizedSize += result.optimizedSize;
        totalSavings += result.savings;
      }
    });
  });
  
  const avgSavings = totalSavings / (results.length * 3); // 3 versiones por imagen
  
  console.log('\n📊 RESUMEN DE OPTIMIZACIÓN:');
  console.log(`📁 Archivos procesados: ${totalFiles}`);
  console.log(`✅ Optimizaciones exitosas: ${successfulOptimizations}/${totalFiles}`);
  console.log(`📦 Tamaño original: ${(totalOriginalSize / (1024 * 1024)).toFixed(2)}MB`);
  console.log(`📦 Tamaño optimizado: ${(totalOptimizedSize / (1024 * 1024)).toFixed(2)}MB`);
  console.log(`💾 Ahorro promedio: ${avgSavings.toFixed(1)}%`);
  
  console.log('\n✅ Optimización completada');
  console.log('\n📋 ARCHIVOS GENERADOS:');
  console.log(`📱 Thumbnails: ${THUMBNAILS_PATH}`);
  console.log(`🖼️  Imágenes optimizadas: ${OPTIMIZED_PATH}`);
  
  console.log('\n🎯 PRÓXIMOS PASOS:');
  console.log('1. Actualizar src/lib/designs.ts para usar las nuevas rutas');
  console.log('2. Implementar lazy loading con Intersection Observer');
  console.log('3. Agregar Service Worker para cache');
}

main().catch(console.error);
