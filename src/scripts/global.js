// src/scripts/global.js

// ---------- Helpers ----------
function safeBind(el, event, handler, key) {
  if (!el || !event || !handler) return;
  const k = key || `__bound_${event}`;
  if (el[k]) el.removeEventListener(event, el[k]);
  el[k] = handler;
  el.addEventListener(event, handler);
}

// ---------- Navbar (hamburguesa) ----------
function initNavbar() {
  const btn = document.getElementById("menu-toggle");
  const menu = document.getElementById("menu-panel");
  if (!btn || !menu) return;

  safeBind(btn, "click", () => {
    const open = menu.getAttribute("data-open") === "true";
    menu.setAttribute("data-open", String(!open));
  });

  // Cerrar al tocar un link
  menu.querySelectorAll("a").forEach((a) => {
    safeBind(a, "click", () => menu.setAttribute("data-open", "false"), "__click_close");
  });
}

// ---------- Galería / Modal ----------
function initGallery() {
  const modal = document.getElementById("gallery-modal");
  if (!modal) return; // no está en esta página

  const overlay = modal.querySelector("[data-overlay]");
  const img = modal.querySelector("img[data-active]");
  const btnNext = document.getElementById("btn-next");
  const btnPrev = document.getElementById("btn-prev");

  // Colección de items
  const openers = document.querySelectorAll("[data-open-modal]");
  const items = Array.from(document.querySelectorAll("[data-gallery-src]")).map(el => el.getAttribute("data-gallery-src"));
  let idx = 0;

  function openAt(i) {
    if (!img) return;
    idx = (i + items.length) % items.length;
    img.src = items[idx];
    modal.setAttribute("data-open", "true");
  }
  function close() { modal.setAttribute("data-open", "false"); }
  function next() { openAt(idx + 1); }
  function prev() { openAt(idx - 1); }

  openers.forEach((btn, i) => {
    safeBind(btn, "click", (e) => { e.preventDefault(); openAt(i); }, "__open");
  });

  if (overlay) safeBind(overlay, "click", close);
  if (btnNext) safeBind(btnNext, "click", next);
  if (btnPrev) safeBind(btnPrev, "click", prev);

  safeBind(document, "keydown", (e) => {
    if (modal.getAttribute("data-open") !== "true") return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  }, "__gallery_keys");
}

// ---------- Cart counter ----------
function getCartTotal() {
  try {
    const carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
    return Array.isArray(carrito) ? carrito.reduce((acc, it) => acc + (it.cantidad || 1), 0) : 0;
  } catch { return 0; }
}
function paintCartCounter() {
  const el = document.getElementById("cart-count");
  if (!el) return;
  el.textContent = String(getCartTotal());
  el.toggleAttribute("data-empty", getCartTotal() === 0);
}
function initCartCounter() {
  paintCartCounter();
  safeBind(window, "storage", (e) => { if (e.key === "carrito") paintCartCounter(); }, "__cart_storage");
}

// ---------- Boot ----------
function boot() {
  initNavbar();
  initGallery();
  initCartCounter();
}

document.addEventListener("astro:page-load", boot);
document.addEventListener("astro:after-swap", boot);
