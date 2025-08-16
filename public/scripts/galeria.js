// src/scripts/galeria.js
// @ts-nocheck
// Funciona en dev y build. Sin rutas a /src/… y con remount en view transitions.

let __WIRED__ = false;

function mount() {
  // ---------- Refs base ----------
  const base        = document.getElementById("mockup-base");
  const overlay     = document.getElementById("mockup-overlay");
  const wrapper     = document.getElementById("mockup-wrapper");

  const btnAdelante = document.getElementById("btn-adelante");
  const btnAtras    = document.getElementById("btn-atras");
  const rangeSize   = document.getElementById("range-size");
  const btnCentro   = document.getElementById("btn-centro");

  if (!base || !overlay || !wrapper || !btnAdelante || !btnAtras || !rangeSize || !btnCentro) return;

  initMockup({ base, overlay, wrapper, btnAdelante, btnAtras, rangeSize, btnCentro });

  // ---------- Data + grillas ----------
  const dataEl   = document.getElementById("designs-data");
  const deskGrid = document.getElementById("desk-grid");
  const deskPrev = document.getElementById("desk-prev");
  const deskNext = document.getElementById("desk-next");
  const deskInfo = document.getElementById("desk-page-indicator");
  const mobPages = document.getElementById("mob-pages");
  const mobPrev  = document.getElementById("mob-prev");
  const mobNext  = document.getElementById("mob-next");
  const mobInfo  = document.getElementById("mob-page-indicator");
  const catFilter= document.getElementById("cat-filter");

  let payload = {};
  try { payload = dataEl?.textContent ? JSON.parse(dataEl.textContent) : {}; } catch {}
  const jsonDesigns = Array.isArray(payload) ? payload : (payload?.designs ?? []);
  const jsonCats    = Array.isArray(payload?.categories) ? payload.categories : [];

  initPagination({ jsonDesigns, jsonCats, deskGrid, deskPrev, deskNext, deskInfo, mobPages, mobPrev, mobNext, mobInfo, catFilter });
}

export default function initGaleria() {
  if (!__WIRED__) {
    __WIRED__ = true;
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", mount, { once: true });
    } else {
      mount();
    }
    document.addEventListener("astro:page-load", mount);
    document.addEventListener("astro:after-swap", mount);
  } else {
    // si ya cableamos eventos globales, intentamos montar por si llegamos recién a /galeria
    mount();
  }
}

/* ===================== Mockup ===================== */
function initMockup(refs) {
  const { base, overlay, wrapper, btnAdelante, btnAtras, rangeSize, btnCentro } = refs;

  const ZONES = {
    adelante: { left: 50, top: 65, widthPct: 58, heightPct: 46 },
    atras:    { left: 50, top: 63, widthPct: 58, heightPct: 50 },
  };

  let side = "adelante";
  let startX = 0, startY = 0, imgX = 0, imgY = 0, dragging = false;
  let isMobile = window.innerWidth <= 768;

  // Detectar cambios de tamaño de ventana
  window.addEventListener('resize', () => {
    isMobile = window.innerWidth <= 768;
  });

  function applyZoneDefaults() {
    const z = ZONES[side];
    overlay.style.left = z.left + "%";
    overlay.style.top  = z.top + "%";
    overlay.style.transform = "translate(-50%, -50%)";
    imgX = wrapper.clientWidth  * (z.left / 100);
    imgY = wrapper.clientHeight * (z.top  / 100);
  }

  function fitOverlayIntoZone() {
    const z = ZONES[side];
    const zoneW = wrapper.clientWidth  * (z.widthPct  / 100);
    const zoneH = wrapper.clientHeight * (z.heightPct / 100);

    const fit = () => {
      const imgW = overlay.naturalWidth  || 1;
      const imgH = overlay.naturalHeight || 1;
      const scale   = Math.min(zoneW / imgW, zoneH / imgH);
      const targetW = Math.round(imgW * scale);
      overlay.style.width = targetW + "px";
      rangeSize.value = String(Math.round((targetW / wrapper.clientWidth) * 100));
    };

    if (overlay.complete && overlay.naturalWidth) fit();
    else overlay.onload = fit;
  }

  function setSide(next) {
    side = next;
    base.src = next === "adelante" ? "/images/mockups/adelante.webp" : "/images/mockups/atras.webp";

    const on = ["bg-black","text-white"], off = ["bg-white","text-gray-800"];
    if (next === "adelante") {
      btnAdelante.classList.add(...on); btnAdelante.classList.remove(...off);
      btnAtras.classList.add(...off);   btnAtras.classList.remove(...on);
    } else {
      btnAtras.classList.add(...on);    btnAtras.classList.remove(...off);
      btnAdelante.classList.add(...off);btnAdelante.classList.remove(...on);
    }
    applyZoneDefaults();
    if (overlay.src) fitOverlayIntoZone();
  }

  function applyDesign(src) {
    overlay.src = src;
    overlay.style.display = "block";
    applyZoneDefaults();
    fitOverlayIntoZone();
  }

  function setSize() {
    if (!overlay.src) return;
    const pct = Number(rangeSize.value || "35") / 100;
    overlay.style.width = (wrapper.clientWidth * pct) + "px";
  }

  function centerOverlay() { applyZoneDefaults(); }

  // Delegación de clicks (mini bus)
  document.addEventListener("click", (e) => {
    const target = e.target.closest?.("[data-design], [data-side]");
    if (!target) return;
    if (target.hasAttribute("data-design")) applyDesign(target.getAttribute("data-design"));
    const sideAttr = target.getAttribute("data-side");
    if (sideAttr === "adelante") setSide("adelante");
    if (sideAttr === "atras") setSide("atras");
  });

  rangeSize.addEventListener("input", setSize);
  btnCentro.addEventListener("click", centerOverlay);

  // Drag mouse
  overlay.addEventListener("mousedown", (e) => { dragging = true; startX = e.clientX; startY = e.clientY; });
  window.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX, dy = e.clientY - startY;
    overlay.style.left = (imgX + dx) + "px";
    overlay.style.top  = (imgY + dy) + "px";
    overlay.style.transform = "translate(-50%,-50%)";
  });
  window.addEventListener("mouseup", (e) => {
    if (!dragging) return;
    dragging = false;
    imgX += e.clientX - startX; imgY += e.clientY - startY;
  });

  // Drag touch
  overlay.addEventListener("touchstart", (e) => {
    const t = e.touches[0]; 
    dragging = true; 
    startX = t.clientX; 
    startY = t.clientY; 
    
    // Solo prevenir el scroll si estamos en el overlay y hay un diseño aplicado
    if (overlay.src && overlay.style.display !== 'none' && isMobile) {
      e.preventDefault();
    }
  }, { passive: false });
  
  window.addEventListener("touchmove", (e) => {
    if (!dragging) return;
    const t = e.touches[0]; 
    const dx = t.clientX - startX, dy = t.clientY - startY;
    
    // Solo mover el overlay si hay un diseño aplicado
    if (overlay.src && overlay.style.display !== 'none') {
      overlay.style.left = (imgX + dx) + "px";
      overlay.style.top  = (imgY + dy) + "px";
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
    if (overlay.src && overlay.style.display !== 'none') {
      imgX += e.changedTouches[0].clientX - startX; 
      imgY += e.changedTouches[0].clientY - startY;
    }
  }, { passive: true });

  // Permitir scroll en el wrapper en móvil cuando no hay overlay
  wrapper.addEventListener("touchstart", (e) => {
    // Si no hay overlay o está oculto, permitir scroll
    if (!overlay.src || overlay.style.display === 'none') {
      return; // Permitir comportamiento normal de scroll
    }
    
    // Si hay overlay, verificar si el touch es en el overlay
    const rect = overlay.getBoundingClientRect();
    const touch = e.touches[0];
    
    if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
        touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
      // Touch está en el overlay, no hacer nada (se maneja arriba)
      return;
    }
    
    // Touch está fuera del overlay, permitir scroll
  }, { passive: true });

  setSide("adelante");
  new ResizeObserver(() => { if (overlay.src) fitOverlayIntoZone(); }).observe(wrapper);
}

/* ===================== Paginación / Filtrado ===================== */
function initPagination(refs) {
  const { jsonDesigns, jsonCats, deskGrid, deskPrev, deskNext, deskInfo, mobPages, mobPrev, mobNext, mobInfo, catFilter } = refs;

  const nodes = Array.from((deskGrid ?? document).querySelectorAll("[data-design]"));
  const ssrList = nodes.map(n => {
    const img = n.querySelector("img");
    return {
      src: n.dataset.design || img?.getAttribute("src") || "",
      name: img?.alt || "Diseño",
    };
  }).filter(d => d.src);

  const baseData = (Array.isArray(jsonDesigns) && jsonDesigns.length >= ssrList.length) ? jsonDesigns : ssrList;

  const seen = new Set();
  const ALL = baseData.filter(d => {
    const ok = !!d.src && !seen.has(d.src);
    if (ok) seen.add(d.src);
    return ok;
  });

  const CATS = jsonCats.length
    ? jsonCats
    : ["todos", ...Array.from(new Set(ALL.map(d => d.category).filter(Boolean)))];

  const url = new URLSearchParams(location.search);
  let currentCat = url.get("cat") || "todos";
  let page = Math.max(0, (parseInt(url.get("p") || "1", 10) || 1) - 1);

  const DESK_PER_PAGE = 12;
  const MOB_PER_PAGE  = 8;

  // Cache para elementos DOM reutilizables
  const domCache = new Map();
  let lastRenderTime = 0;
  const RENDER_DEBOUNCE = 100; // ms
  
  // Virtualización: solo renderizar elementos visibles
  const VIRTUAL_BUFFER = 2; // Páginas adicionales a renderizar
  let virtualizedPages = new Set();
  
  // Intersection Observer para lazy loading avanzado
  let imageObserver = null;

  const filtered = () =>
    (currentCat === "todos" || !currentCat)
      ? ALL
      : ALL.filter(d => d.category === currentCat);

  function setURL() {
    const p = new URLSearchParams(location.search);
    p.set("cat", currentCat);
    p.set("p", String(page + 1));
    history.replaceState({}, "", `?${p.toString()}`);
  }

  // Inicializar Intersection Observer para lazy loading
  function initImageObserver() {
    if (!('IntersectionObserver' in window)) return;
    
    imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const designSrc = img.dataset.designSrc;
          
          if (designSrc && img.src !== designSrc) {
            img.src = designSrc;
            img.removeAttribute('data-design-src');
            imageObserver.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.1
    });
  }

  function activateCatButtons() {
    if (!catFilter) return;
    catFilter.querySelectorAll(".btn-cat").forEach(btn => {
      const isActive = (btn.dataset.cat || "todos") === currentCat;
      btn.dataset.active = isActive ? "true" : "false";
    });
  }

  // Función optimizada para crear elementos de imagen
  function createImageElement(design) {
    const cacheKey = design.src;
    if (domCache.has(cacheKey)) {
      const cached = domCache.get(cacheKey);
      cached.title = design.name;
      cached.setAttribute("aria-label", `Usar ${design.name}`);
      return cached.cloneNode(true);
    }

    const btn = document.createElement("button");
    btn.className = "aspect-square bg-black rounded-xl overflow-hidden border border-neutral-700 hover:shadow transition";
    btn.dataset.design = design.src; // Mantener src original para el mockup
    btn.title = design.name;
    btn.setAttribute("aria-label", `Usar ${design.name}`);
    
    const img = document.createElement("img");
    // Usar thumbnail para la galería, pero mantener src original para el mockup
    img.src = design.thumbnail || design.src; 
    img.alt = design.name; 
    img.className = "w-full h-full object-contain p-2";
    img.loading = "lazy"; // Lazy loading nativo
    
    // Si hay thumbnail diferente al src, usar Intersection Observer
    if (design.thumbnail && design.thumbnail !== design.src) {
      img.dataset.designSrc = design.src;
      if (imageObserver) {
        imageObserver.observe(img);
      }
    }
    
    btn.appendChild(img);
    
    // Cache del elemento
    domCache.set(cacheKey, btn.cloneNode(true));
    return btn;
  }

  // Función optimizada para crear elementos móviles
  function createMobileImageElement(design) {
    const btn = document.createElement("button");
    btn.className = "bg-black rounded-xl overflow-hidden border border-neutral-700 h-[72px]";
    btn.dataset.design = design.src; // Mantener src original para el mockup
    btn.title = design.name;
    btn.setAttribute("aria-label", `Usar ${design.name}`);
    
    const img = document.createElement("img");
    // Usar thumbnail para la galería móvil
    img.src = design.thumbnail || design.src; 
    img.alt = design.name; 
    img.className = "w-full h-full object-contain p-2";
    img.loading = "lazy"; // Lazy loading nativo
    
    // Precargar imagen original en background
    if (design.thumbnail && design.thumbnail !== design.src) {
      const preloadImg = new Image();
      preloadImg.src = design.src;
    }
    
    btn.appendChild(img);
    return btn;
  }

  function renderDesktop(list) {
    if (!deskGrid) return;

    const total = Math.max(1, Math.ceil(list.length / DESK_PER_PAGE));
    if (page > total - 1) page = total - 1;

    const start = page * DESK_PER_PAGE;
    const end   = start + DESK_PER_PAGE;
    const slice = list.slice(start, end);

    // Limpiar contenido anterior
    deskGrid.innerHTML = "";
    
    // Crear fragmento para mejor rendimiento
    const frag = document.createDocumentFragment();
    slice.forEach(d => {
      const btn = createImageElement(d);
      frag.appendChild(btn);
    });
    deskGrid.appendChild(frag);

    if (deskInfo) deskInfo.textContent = `Página ${page + 1} de ${total}`;
    if (deskPrev) deskPrev.disabled = page === 0;
    if (deskNext) deskNext.disabled = page >= total - 1;

    // Precarga inteligente solo de la siguiente página
    if (page < total - 1) {
      const nextStart = end;
      const nextEnd = Math.min(nextStart + DESK_PER_PAGE, list.length);
      const nextSlice = list.slice(nextStart, nextEnd);
      nextSlice.forEach(d => {
        const img = new Image();
        img.src = d.src;
      });
    }
  }

  function renderMobile(list) {
    if (!mobPages) return;
    const pages = Math.max(1, Math.ceil(list.length / MOB_PER_PAGE));
    
    // Actualizar indicador de página móvil
    if (mobInfo) mobInfo.textContent = `${page + 1} / ${pages}`;
    
    // Actualizar estado de las flechas móviles
    if (mobPrev) mobPrev.disabled = page === 0;
    if (mobNext) mobNext.disabled = page >= pages - 1;
    
    // Virtualización: calcular páginas a renderizar
    const pagesToRender = new Set();
    pagesToRender.add(page); // Página actual
    
    // Agregar páginas adyacentes para buffer
    if (page > 0) pagesToRender.add(page - 1);
    if (page < pages - 1) pagesToRender.add(page + 1);
    
    // Limpiar contenido anterior
    mobPages.innerHTML = "";
    
    // Renderizar solo las páginas necesarias
    Array.from(pagesToRender).sort((a, b) => a - b).forEach(p => {
      const holder = document.createElement("div");
      holder.className = "shrink-0 w-full snap-start grid grid-cols-4 grid-rows-2 gap-3";
      holder.dataset.page = p;
      
      const start = p * MOB_PER_PAGE, end = start + MOB_PER_PAGE;
      list.slice(start, end).forEach(d => {
        const btn = createMobileImageElement(d);
        holder.appendChild(btn);
      });
      mobPages.appendChild(holder);
    });
    
    // Scroll a la página actual
    const currentPageElement = mobPages.querySelector(`[data-page="${page}"]`);
    if (currentPageElement) {
      currentPageElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }
    
    // Limpiar cache de páginas no visibles
    virtualizedPages = pagesToRender;
  }

  // Función debounced para evitar renders excesivos
  function debouncedRender() {
    const now = Date.now();
    if (now - lastRenderTime < RENDER_DEBOUNCE) {
      clearTimeout(debouncedRender.timeout);
      debouncedRender.timeout = setTimeout(() => {
        lastRenderTime = Date.now();
        renderAll();
      }, RENDER_DEBOUNCE);
      return;
    }
    lastRenderTime = now;
    renderAll();
  }

  function renderAll() {
    const list = filtered();
    activateCatButtons();
    renderDesktop(list);
    renderMobile(list);
    setURL();
  }

  // Inicializar todo
  function init() {
    initImageObserver();
    renderAll();
  }

  catFilter?.addEventListener("click", (e) => {
    const btn = e.target.closest?.(".btn-cat");
    if (!btn) return;
    const cat = btn.dataset.cat || "todos";
    if (cat === currentCat) return;
    currentCat = cat;
    page = 0;
    debouncedRender();
  });

  deskPrev?.addEventListener("click", () => { 
    if (page > 0) { 
      page--; 
      debouncedRender(); 
    } 
  });
  
  deskNext?.addEventListener("click", () => { 
    page++; 
    debouncedRender(); 
  });
  
  // Event listeners para flechas móviles
  mobPrev?.addEventListener("click", () => { 
    if (page > 0) { 
      page--; 
      debouncedRender(); 
    } 
  });
  
  mobNext?.addEventListener("click", () => { 
    page++; 
    debouncedRender(); 
  });

  init();
}
