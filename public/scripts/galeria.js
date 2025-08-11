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
  const catFilter= document.getElementById("cat-filter");

  let payload = {};
  try { payload = dataEl?.textContent ? JSON.parse(dataEl.textContent) : {}; } catch {}
  const jsonDesigns = Array.isArray(payload) ? payload : (payload?.designs ?? []);
  const jsonCats    = Array.isArray(payload?.categories) ? payload.categories : [];

  initPagination({ jsonDesigns, jsonCats, deskGrid, deskPrev, deskNext, deskInfo, mobPages, catFilter });
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
    const t = e.touches[0]; dragging = true; startX = t.clientX; startY = t.clientY; e.preventDefault();
  }, { passive: false });
  window.addEventListener("touchmove", (e) => {
    if (!dragging) return;
    const t = e.touches[0]; const dx = t.clientX - startX, dy = t.clientY - startY;
    overlay.style.left = (imgX + dx) + "px";
    overlay.style.top  = (imgY + dy) + "px";
    overlay.style.transform = "translate(-50%,-50%)";
    e.preventDefault();
  }, { passive: false });
  window.addEventListener("touchend", () => { dragging = false; }, { passive: true });

  setSide("adelante");
  new ResizeObserver(() => { if (overlay.src) fitOverlayIntoZone(); }).observe(wrapper);
}

/* ===================== Paginación / Filtrado ===================== */
function initPagination(refs) {
  const { jsonDesigns, jsonCats, deskGrid, deskPrev, deskNext, deskInfo, mobPages, catFilter } = refs;

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

  function activateCatButtons() {
    if (!catFilter) return;
    catFilter.querySelectorAll(".btn-cat").forEach(btn => {
      const isActive = (btn.dataset.cat || "todos") === currentCat;
      btn.dataset.active = isActive ? "true" : "false";
    });
  }

  function renderDesktop(list) {
    if (!deskGrid) return;

    const total = Math.max(1, Math.ceil(list.length / DESK_PER_PAGE));
    if (page > total - 1) page = total - 1;

    const start = page * DESK_PER_PAGE;
    const end   = start + DESK_PER_PAGE;
    const slice = list.slice(start, end);

    deskGrid.innerHTML = "";
    const frag = document.createDocumentFragment();
    slice.forEach(d => {
      const btn = document.createElement("button");
      btn.className = "aspect-square bg-black rounded-xl overflow-hidden border border-neutral-700 hover:shadow transition";
      btn.dataset.design = d.src;
      btn.title = d.name;
      btn.setAttribute("aria-label", `Usar ${d.name}`);
      const img = document.createElement("img");
      img.src = d.src; img.alt = d.name; img.className = "w-full h-full object-contain p-2";
      btn.appendChild(img);
      frag.appendChild(btn);
    });
    deskGrid.appendChild(frag);

    if (deskInfo) deskInfo.textContent = `Página ${page + 1} de ${total}`;
    if (deskPrev) deskPrev.disabled = page === 0;
    if (deskNext) deskNext.disabled = page >= total - 1;

    // precarga próxima página
    const next = list.slice(end, end + DESK_PER_PAGE);
    next.forEach(d => { const i = new Image(); i.src = d.src; });
  }

  function renderMobile(list) {
    if (!mobPages) return;
    const pages = Math.max(1, Math.ceil(list.length / MOB_PER_PAGE));
    mobPages.innerHTML = "";
    for (let p = 0; p < pages; p++) {
      const holder = document.createElement("div");
      holder.className = "shrink-0 w-full snap-start grid grid-cols-4 grid-rows-2 gap-3";
      const start = p * MOB_PER_PAGE, end = start + MOB_PER_PAGE;
      list.slice(start, end).forEach(d => {
        const btn = document.createElement("button");
        btn.className = "bg-black rounded-xl overflow-hidden border border-neutral-700 h-[72px]";
        btn.dataset.design = d.src;
        btn.title = d.name;
        btn.setAttribute("aria-label", `Usar ${d.name}`);
        const img = document.createElement("img");
        img.src = d.src; img.alt = d.name; img.className = "w-full h-full object-contain p-2";
        btn.appendChild(img);
        holder.appendChild(btn);
      });
      mobPages.appendChild(holder);
    }
  }

  function renderAll() {
    const list = filtered();
    activateCatButtons();
    renderDesktop(list);
    renderMobile(list);
    setURL();
  }

  catFilter?.addEventListener("click", (e) => {
    const btn = e.target.closest?.(".btn-cat");
    if (!btn) return;
    const cat = btn.dataset.cat || "todos";
    if (cat === currentCat) return;
    currentCat = cat;
    page = 0;
    renderAll();
  });

  deskPrev?.addEventListener("click", () => { if (page > 0) { page--; renderAll(); } });
  deskNext?.addEventListener("click", () => { page++; renderAll(); });

  renderAll();
}
