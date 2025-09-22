// src/scripts/tudiseno.js
// Script específico para la página Tu Diseño

let __WIRED__ = false;
let __INITIALIZED__ = false;
let __LISTENERS_ADDED__ = false;

function mount() {
  // Prevenir múltiples inicializaciones
  if (__LISTENERS_ADDED__) {
    return;
  }
  
  // ---------- Refs base ----------
  const base = document.getElementById("mockup-base");
  const overlay = document.getElementById("mockup-overlay");
  const wrapper = document.getElementById("mockup-wrapper");
  const noDesignMessage = document.getElementById("no-design-message");

  const btnAdelante = document.getElementById("btn-adelante");
  const btnAtras = document.getElementById("btn-atras");
  const rangeSize = document.getElementById("range-size");
  const btnCentro = document.getElementById("btn-centro");
  const uploadInput = document.getElementById("upload-design-overlay");
  const btnRemoveCustom = document.getElementById("btn-remove-custom");
  const btnDownload = document.getElementById("btn-download");
  const fileInfo = document.getElementById("file-info");
  const fileDetails = document.getElementById("file-details");

  // Elementos móviles
  const rangeSizeMobile = document.getElementById("range-size-mobile");
  const btnCentroMobile = document.getElementById("btn-centro-mobile");
  const btnRemoveCustomMobile = document.getElementById("btn-remove-custom-mobile");
  const btnDownloadMobile = document.getElementById("btn-download-mobile");

  // Nuevos elementos
  const uploadSection = document.getElementById("upload-section");
  const btnChangeImage = document.getElementById("btn-change-image");

  if (!base || !overlay || !wrapper || !btnAdelante || !btnAtras) return;
  
  // Marcar que los listeners han sido agregados
  __LISTENERS_ADDED__ = true;

  initTuDisenoInternal({ 
    base, 
    overlay, 
    wrapper, 
    noDesignMessage,
    btnAdelante, 
    btnAtras, 
    rangeSize, 
    btnCentro, 
    uploadInput, 
    btnRemoveCustom,
    btnDownload,
    fileInfo,
    fileDetails,
    rangeSizeMobile,
    btnCentroMobile,
    btnRemoveCustomMobile,
    btnDownloadMobile,
    uploadSection,
    btnChangeImage
  });
}

// Función principal
function initTuDiseno() {
  // Resetear el estado para recargas completas
  if (document.readyState === "complete") {
    __INITIALIZED__ = false;
    __WIRED__ = false;
    __LISTENERS_ADDED__ = false;
  }
  
  if (__INITIALIZED__) {
    return;
  }
  
  __INITIALIZED__ = true;
  
  if (!__WIRED__) {
    __WIRED__ = true;
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", mount, { once: true });
    } else {
      setTimeout(mount, 100);
    }
    document.addEventListener("astro:page-load", mount);
    document.addEventListener("astro:after-swap", mount);
  } else {
    setTimeout(mount, 100);
  }
}

/* ===================== Tu Diseño Mockup ===================== */
function initTuDisenoInternal(refs) {
  const { 
    base, 
    overlay, 
    wrapper, 
    noDesignMessage,
    btnAdelante, 
    btnAtras, 
    rangeSize, 
    btnCentro, 
    uploadInput, 
    btnRemoveCustom,
    btnDownload,
    fileInfo,
    fileDetails,
    rangeSizeMobile,
    btnCentroMobile,
    btnRemoveCustomMobile,
    btnDownloadMobile,
    uploadSection,
    btnChangeImage
  } = refs;

  const ZONES = {
    adelante: { left: 50, top: 65, widthPct: 58, heightPct: 46 },
    atras: { left: 50, top: 63, widthPct: 58, heightPct: 50 },
  };

  let side = "adelante";
  let startX = 0, startY = 0, imgX = 0, imgY = 0, dragging = false;
  let isMobile = window.innerWidth <= 768;
  let currentFile = null;
  let isInputBeingTriggered = false;

  // Detectar cambios de tamaño de ventana
  window.addEventListener('resize', () => {
    isMobile = window.innerWidth <= 768;
  });

  function showNoDesignMessage() {
    if (noDesignMessage) {
      noDesignMessage.style.display = 'flex';
    }
  }

  function hideNoDesignMessage() {
    if (noDesignMessage) {
      noDesignMessage.style.display = 'none';
    }
  }

  function applyZoneDefaults() {
    const z = ZONES[side];
    overlay.style.left = z.left + "%";
    overlay.style.top = z.top + "%";
    overlay.style.transform = "translate(-50%, -50%)";
    imgX = wrapper.clientWidth * (z.left / 100);
    imgY = wrapper.clientHeight * (z.top / 100);
  }

  function fitOverlayIntoZone() {
    const z = ZONES[side];
    const zoneW = wrapper.clientWidth * (z.widthPct / 100);
    const zoneH = wrapper.clientHeight * (z.heightPct / 100);

    const fit = () => {
      const imgW = overlay.naturalWidth || 1;
      const imgH = overlay.naturalHeight || 1;
      const scale = Math.min(zoneW / imgW, zoneH / imgH);
      const targetW = Math.round(imgW * scale);
      overlay.style.width = targetW + "px";
      const pct = Math.round((targetW / wrapper.clientWidth) * 100);
      rangeSize.value = String(pct);
      
      // Actualizar el gradiente de la barra
      const min = Number(rangeSize.min || 10);
      const max = Number(rangeSize.max || 100);
      const range = max - min;
      const normalizedPct = ((pct - min) / range) * 100;
      rangeSize.style.background = `linear-gradient(to right, #ec4899 0%, #ec4899 ${normalizedPct}%, #e5e7eb ${normalizedPct}%, #e5e7eb 100%)`;
    };

    if (overlay.complete && overlay.naturalWidth) fit();
    else overlay.onload = fit;
  }

  function setSide(next) {
    side = next;
    base.src = next === "adelante" ? "/images/mockups/adelante.webp" : "/images/mockups/atras.webp";

    const on = ["bg-gradient-to-r", "from-pink-500", "to-pink-600", "text-white"];
    const off = ["bg-white", "text-gray-700"];
    
    if (next === "adelante") {
      on.forEach(cls => btnAdelante.classList.add(cls));
      off.forEach(cls => btnAdelante.classList.remove(cls));
      off.forEach(cls => btnAtras.classList.add(cls));
      on.forEach(cls => btnAtras.classList.remove(cls));
    } else {
      on.forEach(cls => btnAtras.classList.add(cls));
      off.forEach(cls => btnAtras.classList.remove(cls));
      off.forEach(cls => btnAdelante.classList.add(cls));
      on.forEach(cls => btnAdelante.classList.remove(cls));
    }
    
    applyZoneDefaults();
    if (overlay.src && overlay.style.display !== "none") {
      fitOverlayIntoZone();
    }
  }

  function applyCustomDesign(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const imageData = e.target.result;
      overlay.src = imageData;
      overlay.style.display = "block";
      hideNoDesignMessage();
      applyZoneDefaults();
      fitOverlayIntoZone();
      
      // Guardar imagen en localStorage
      try {
        localStorage.setItem('tudiseno_custom_image', imageData);
        localStorage.setItem('tudiseno_custom_filename', file.name);
        localStorage.setItem('tudiseno_custom_size', file.size.toString());
      } catch (error) {
        console.warn('No se pudo guardar la imagen en localStorage:', error);
      }
      
      // Mostrar botones para eliminar y descargar diseño (desktop)
      if (btnRemoveCustom) {
        btnRemoveCustom.classList.remove('hidden');
      }
      
      if (btnDownload) {
        btnDownload.classList.remove('hidden');
      }

      // Mostrar botones móviles
      if (btnRemoveCustomMobile) {
        btnRemoveCustomMobile.classList.remove('hidden');
      }
      
      if (btnDownloadMobile) {
        btnDownloadMobile.classList.remove('hidden');
      }

      // Ocultar sección de upload y mostrar botón de cambiar imagen
      if (uploadSection) {
        uploadSection.style.display = 'none';
      }
      
      if (btnChangeImage) {
        btnChangeImage.classList.remove('hidden');
      }
      
      // Mostrar información del archivo
      if (fileInfo && fileDetails) {
        fileInfo.classList.remove('hidden');
        const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
        fileDetails.textContent = `${file.name} (${sizeInMB} MB)`;
      }
      
      currentFile = file;
    };
    reader.readAsDataURL(file);
  }

  function removeCustomDesign() {
    overlay.src = "";
    overlay.style.display = "none";
    showNoDesignMessage();
    
    // Limpiar localStorage
    try {
      localStorage.removeItem('tudiseno_custom_image');
      localStorage.removeItem('tudiseno_custom_filename');
      localStorage.removeItem('tudiseno_custom_size');
    } catch (error) {
      console.warn('No se pudo limpiar localStorage:', error);
    }
    
    // Ocultar botones para eliminar y descargar diseño (desktop)
    if (btnRemoveCustom) {
      btnRemoveCustom.classList.add('hidden');
    }
    
    if (btnDownload) {
      btnDownload.classList.add('hidden');
    }

    // Ocultar botones móviles
    if (btnRemoveCustomMobile) {
      btnRemoveCustomMobile.classList.add('hidden');
    }
    
    if (btnDownloadMobile) {
      btnDownloadMobile.classList.add('hidden');
    }

    // Mostrar sección de upload y ocultar botón de cambiar imagen
    if (uploadSection) {
      uploadSection.style.display = 'block';
    }
    
    if (btnChangeImage) {
      btnChangeImage.classList.add('hidden');
    }
    
    // Ocultar información del archivo
    if (fileInfo) {
      fileInfo.classList.add('hidden');
    }
    
    // Limpiar input de archivo
    if (uploadInput) {
      uploadInput.value = "";
    }
    
    currentFile = null;
  }

  function validateFile(file) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    
    if (!allowedTypes.includes(file.type)) {
      alert('Solo se permiten archivos PNG, JPG o JPEG');
      return false;
    }
    
    if (file.size > maxSize) {
      alert('El archivo es demasiado grande. Máximo 5MB');
      return false;
    }
    
    return true;
  }

  function setSize(sourceRange) {
    // Determinar qué range está siendo usado
    const activeRange = sourceRange || rangeSize;
    const pct = Number(activeRange.value || "35");
    
    // Sincronizar ambos ranges
    if (rangeSize && rangeSize !== activeRange) {
      rangeSize.value = pct;
    }
    if (rangeSizeMobile && rangeSizeMobile !== activeRange) {
      rangeSizeMobile.value = pct;
    }
    
    // Actualizar gradientes en ambos ranges
    [rangeSize, rangeSizeMobile].forEach(range => {
      if (range) {
        const min = Number(range.min || 10);
        const max = Number(range.max || 100);
        const rangeSpan = max - min;
        const normalizedPct = ((pct - min) / rangeSpan) * 100;
        range.style.background = `linear-gradient(to right, #ec4899 0%, #ec4899 ${normalizedPct}%, #e5e7eb ${normalizedPct}%, #e5e7eb 100%)`;
      }
    });
    
    // Solo funcionar si hay un diseño aplicado
    if (!overlay.src) return;
    
    const pctDecimal = pct / 100;
    const newWidth = Math.max(50, wrapper.clientWidth * pctDecimal);
    overlay.style.width = newWidth + "px";
  }

  function centerOverlay() {
    applyZoneDefaults();
  }

  function downloadMockup() {
    if (!overlay.src || overlay.style.display === "none") {
      alert('Primero debes subir un diseño para poder descargarlo');
      return;
    }

    // Prevenir múltiples descargas
    if (btnDownload && btnDownload.disabled) {
      return;
    }
    
    // Deshabilitar botón
    if (btnDownload) {
      btnDownload.disabled = true;
      btnDownload.innerHTML = 'Generando...';
    }
    
    // Crear canvas con las dimensiones exactas del mockup
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Obtener dimensiones del mockup base (imagen original)
    const baseImg = new Image();
    baseImg.onload = () => {
      // Usar las dimensiones naturales de la imagen base con escala
      const scale = 1.5;
      canvas.width = baseImg.naturalWidth * scale;
      canvas.height = baseImg.naturalHeight * scale;
      
      // Continuar con el proceso de descarga
      continueDownloadProcess();
    };
    
    baseImg.src = base.src;
    
    function continueDownloadProcess() {
      // Configurar el contexto para alta calidad
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Crear la imagen del overlay
      const overlayImg = new Image();
      
      overlayImg.onload = () => {
        // Ambas imágenes cargadas, crear la imagen final
        createFinalImage();
      };
      
      overlayImg.onerror = () => {
        // Restaurar botón
        if (btnDownload) {
          btnDownload.disabled = false;
          btnDownload.innerHTML = `
            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Descargar diseño
          `;
        }
        
        alert('Error al cargar el diseño');
      };
      
      overlayImg.src = overlay.src;
    
      function createFinalImage() {
        // Dibujar la imagen base completa en el canvas
        ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);
        
        // Obtener dimensiones reales en pantalla
        const baseRect = base.getBoundingClientRect();
        const overlayRect = overlay.getBoundingClientRect();
        
        // Calcular posición del overlay relativa al mockup base
        const overlayLeft = overlayRect.left - baseRect.left;
        const overlayTop = overlayRect.top - baseRect.top;
        
        // Calcular escala del canvas respecto al mockup visible
        const scale = canvas.width / baseRect.width;
        
        // Aplicar escala a posición y tamaño del overlay
        const scaledLeft = overlayLeft * scale;
        const scaledTop = overlayTop * scale;
        const scaledWidth = overlayRect.width * scale;
        const scaledHeight = overlayRect.height * scale;
        
        // Ajuste para corregir la posición Y (mover hacia abajo)
        const adjustedTop = scaledTop + (scaledHeight * 0.25); // Ajuste del 25%
        
        // Dibujar el overlay en la posición correcta
        ctx.drawImage(overlayImg, scaledLeft, adjustedTop, scaledWidth, scaledHeight);
        
        // Descargar la imagen automáticamente
        const link = document.createElement('a');
        link.download = `mi-diseno-${side}-${new Date().getTime()}.png`;
        link.href = canvas.toDataURL('image/png', 0.95);
        link.style.display = 'none';
        
        // Trigger download automático
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Restaurar botón
        if (btnDownload) {
          btnDownload.disabled = false;
          btnDownload.innerHTML = `
            <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Descargar diseño
          `;
        }
      }
    }
  }

  // Event listeners para botones de lado
  btnAdelante.addEventListener("click", () => setSide("adelante"));
  btnAtras.addEventListener("click", () => setSide("atras"));

  // Event listeners para controles
  if (rangeSize) {
    rangeSize.addEventListener("input", (e) => setSize(e.target));
    rangeSize.addEventListener("change", (e) => setSize(e.target));
  }
  if (btnCentro) {
    btnCentro.addEventListener("click", centerOverlay);
  }

  // Event listeners para carga de archivos
  if (uploadInput) {
    uploadInput.addEventListener("change", function(e) {
      e.stopPropagation();
      const file = e.target.files[0];
      if (file && validateFile(file) && !isInputBeingTriggered) {
        applyCustomDesign(file);
      }
      
      // Limpiar el input para permitir seleccionar el mismo archivo otra vez
      setTimeout(() => {
        uploadInput.value = '';
        isInputBeingTriggered = false;
      }, 100);
    });
  }

  if (btnRemoveCustom) {
    btnRemoveCustom.addEventListener("click", removeCustomDesign);
  }

  if (btnDownload) {
    btnDownload.addEventListener("click", downloadMockup);
  }

  // Event listeners para controles móviles
  if (rangeSizeMobile) {
    rangeSizeMobile.addEventListener("input", (e) => setSize(e.target));
    rangeSizeMobile.addEventListener("change", (e) => setSize(e.target));
  }
  if (btnCentroMobile) {
    btnCentroMobile.addEventListener("click", centerOverlay);
  }
  if (btnRemoveCustomMobile) {
    btnRemoveCustomMobile.addEventListener("click", removeCustomDesign);
  }
  if (btnDownloadMobile) {
    btnDownloadMobile.addEventListener("click", downloadMockup);
  }

  // Event listener para cambiar imagen
  if (btnChangeImage) {
    btnChangeImage.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (uploadInput && !isInputBeingTriggered) {
        isInputBeingTriggered = true;
        uploadInput.click();
        
        // Reset flag después de un pequeño delay
        setTimeout(() => {
          isInputBeingTriggered = false;
        }, 100);
      }
    });
  }

  // Drag and drop functionality
  if (noDesignMessage) {
    noDesignMessage.addEventListener('dragover', function(e) {
      e.preventDefault();
      noDesignMessage.classList.add('dragover');
    });

    noDesignMessage.addEventListener('dragleave', function(e) {
      e.preventDefault();
      noDesignMessage.classList.remove('dragover');
    });

    noDesignMessage.addEventListener('drop', function(e) {
      e.preventDefault();
      noDesignMessage.classList.remove('dragover');
      
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (validateFile(file)) {
          // Simular la selección del archivo en el input
          const dt = new DataTransfer();
          dt.items.add(file);
          uploadInput.files = dt.files;
          
          applyCustomDesign(file);
        }
      }
    });
  }

  // Drag para mover el diseño - Mouse
  overlay.addEventListener("mousedown", (e) => {
    // Solo permitir drag si hay un diseño aplicado
    if (!overlay.src || overlay.style.display === "none") return;
    
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
  });

  window.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    
    // Solo mover si hay un diseño aplicado
    if (overlay.src && overlay.style.display !== "none") {
      overlay.style.left = (imgX + dx) + "px";
      overlay.style.top = (imgY + dy) + "px";
      overlay.style.transform = "translate(-50%,-50%)";
    }
  });

  window.addEventListener("mouseup", (e) => {
    if (!dragging) return;
    dragging = false;
    
    // Solo actualizar posición si hay un diseño aplicado
    if (overlay.src && overlay.style.display !== "none") {
      imgX += e.clientX - startX;
      imgY += e.clientY - startY;
    }
  });

  // Drag para mover el diseño - Touch
  overlay.addEventListener("touchstart", (e) => {
    // Solo permitir drag si hay un diseño aplicado
    if (!overlay.src || overlay.style.display === "none") return;
    
    const t = e.touches[0];
    dragging = true;
    startX = t.clientX;
    startY = t.clientY;
    
    // Solo prevenir scroll en móvil si hay un diseño aplicado
    if (overlay.src && overlay.style.display !== "none" && isMobile) {
      e.preventDefault();
    }
  }, { passive: false });

  window.addEventListener("touchmove", (e) => {
    if (!dragging) return;
    const t = e.touches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    
    // Solo mover si hay un diseño aplicado
    if (overlay.src && overlay.style.display !== "none") {
      overlay.style.left = (imgX + dx) + "px";
      overlay.style.top = (imgY + dy) + "px";
      overlay.style.transform = "translate(-50%,-50%)";
      
      // En móvil, prevenir scroll solo si estamos moviendo el overlay
      if (isMobile) {
        e.preventDefault();
      }
    }
  }, { passive: false });

  window.addEventListener("touchend", (e) => {
    if (!dragging) return;
    dragging = false;
    
    // Solo actualizar posición si hay un diseño aplicado
    if (overlay.src && overlay.style.display !== "none") {
      imgX += e.changedTouches[0].clientX - startX;
      imgY += e.changedTouches[0].clientY - startY;
    }
  }, { passive: true });

  // Función para cargar imagen desde localStorage
  function loadSavedDesign() {
    try {
      const savedImage = localStorage.getItem('tudiseno_custom_image');
      const savedFilename = localStorage.getItem('tudiseno_custom_filename');
      const savedSize = localStorage.getItem('tudiseno_custom_size');
      
      if (savedImage && savedFilename) {
        // Simular un archivo para mantener la funcionalidad existente
        const sizeInMB = savedSize ? (parseInt(savedSize) / (1024 * 1024)).toFixed(2) : '0.00';
        
        overlay.src = savedImage;
        overlay.style.display = "block";
        hideNoDesignMessage();
        applyZoneDefaults();
        fitOverlayIntoZone();
        
        // Mostrar botones
        if (btnRemoveCustom) {
          btnRemoveCustom.classList.remove('hidden');
        }
        if (btnDownload) {
          btnDownload.classList.remove('hidden');
        }
        if (btnRemoveCustomMobile) {
          btnRemoveCustomMobile.classList.remove('hidden');
        }
        if (btnDownloadMobile) {
          btnDownloadMobile.classList.remove('hidden');
        }
        
        // Ocultar sección de upload y mostrar botón de cambiar imagen
        if (uploadSection) {
          uploadSection.style.display = 'none';
        }
        if (btnChangeImage) {
          btnChangeImage.classList.remove('hidden');
        }
        
        // Mostrar información del archivo
        if (fileInfo && fileDetails) {
          fileInfo.classList.remove('hidden');
          fileDetails.textContent = `${savedFilename} (${sizeInMB} MB) - Guardado`;
        }
      }
    } catch (error) {
      console.warn('No se pudo cargar la imagen guardada:', error);
    }
  }

  // Inicialización
  setSide("adelante");
  showNoDesignMessage();
  
  // Cargar imagen guardada si existe
  loadSavedDesign();
  
  // Inicializar el gradiente de la barra
  const initialPct = Number(rangeSize.value || "35");
  const min = Number(rangeSize.min || 10);
  const max = Number(rangeSize.max || 100);
  const range = max - min;
  const normalizedInitialPct = ((initialPct - min) / range) * 100;
  rangeSize.style.background = `linear-gradient(to right, #ec4899 0%, #ec4899 ${normalizedInitialPct}%, #e5e7eb ${normalizedInitialPct}%, #e5e7eb 100%)`;
  
  // Observer para redimensionar
  new ResizeObserver(() => {
    if (overlay.src && overlay.style.display !== "none") {
      fitOverlayIntoZone();
    }
  }).observe(wrapper);
}

// Exponer función globalmente
window.initTuDiseno = initTuDiseno;