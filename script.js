/* ================================================================
   Dr. Matías Luciano Godoy — script.js
   Menú móvil, formulario de leads, WhatsApp y reveal on scroll.
   ================================================================ */

// === Configuración ===========================================================
// Endpoint de Apps Script / backend para guardar leads. Dejar como string vacío
// o el placeholder para deshabilitar el guardado remoto.
// Cuando esté listo el backend, reemplazar por la URL del Web App de Apps Script.
const LEADS_ENDPOINT = "PEGAR_URL_DE_APPS_SCRIPT";

// Datos de WhatsApp.
const WHATSAPP_NUMBER = "5491155857623";
const WHATSAPP_DEFAULT_MSG =
  "Hola Matías, quiero hacer una consulta por un posible fraude bancario digital.";

// === Utils ===================================================================
const qs = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

function buildWhatsAppUrl(message) {
  const text = encodeURIComponent(message || WHATSAPP_DEFAULT_MSG);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

// === Menú móvil =============================================================
function initMobileNav() {
  const toggle = qs(".nav__toggle");
  const drawer = qs(".nav__mobile");
  if (!toggle || !drawer) return;

  toggle.addEventListener("click", () => {
    const open = drawer.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  // Cerrar al hacer click en un link interno
  qsa("a", drawer).forEach((a) =>
    a.addEventListener("click", () => {
      drawer.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );
}

// === Año footer ==============================================================
function initFooterYear() {
  const el = qs("[data-year]");
  if (el) el.textContent = String(new Date().getFullYear());
}

// === Reveal on scroll ========================================================
function initReveal() {
  const items = qsa(".reveal");
  if (!("IntersectionObserver" in window) || items.length === 0) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  items.forEach((el) => io.observe(el));
}

// === WhatsApp links ==========================================================
function initWhatsAppLinks() {
  qsa("[data-wa]").forEach((el) => {
    const message = el.getAttribute("data-wa") || WHATSAPP_DEFAULT_MSG;
    el.href = buildWhatsAppUrl(message);
    el.target = "_blank";
    el.rel = "noopener";
  });
}

// === Formulario de contacto =================================================
function initContactForm() {
  const form = qs("#contact-form");
  if (!form) return;

  const status = qs(".form__status", form);
  const submitBtn = qs("button[type='submit']", form);

  function showStatus(type, message) {
    if (!status) return;
    status.textContent = message;
    status.classList.remove("form__status--ok", "form__status--err");
    status.classList.add("is-visible", `form__status--${type}`);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.dataset.originalText = submitBtn.textContent;
      submitBtn.textContent = "Enviando…";
    }

    const data = Object.fromEntries(new FormData(form).entries());
    data.source = "sitio-personal";
    data.timestamp = new Date().toISOString();
    data.userAgent = navigator.userAgent;

    // Construir mensaje de WhatsApp con el contexto del formulario
    const waMessage =
      `Hola Matías, soy ${data.nombre || "(sin nombre)"}. ` +
      `Quería consultarte por: ${data.tipo || "consulta general"}. ` +
      (data.descripcion ? `Detalle: ${data.descripcion}` : "");

    const remoteOk = await saveLead(data);

    if (remoteOk) {
      showStatus("ok", "Recibimos tu consulta. Te contactaremos a la brevedad. Si querés, podés continuar por WhatsApp.");
    } else {
      // No bloqueamos al usuario si falla el guardado: lo derivamos a WhatsApp.
      showStatus(
        "ok",
        "Tu consulta queda registrada. Para acelerar la respuesta, te derivamos a WhatsApp."
      );
    }

    // Abrir WhatsApp en una nueva pestaña como segundo canal
    window.open(buildWhatsAppUrl(waMessage), "_blank", "noopener");

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = submitBtn.dataset.originalText || "Enviar consulta";
    }
    form.reset();
  });
}

async function saveLead(payload) {
  // Si no hay endpoint configurado, no rompemos: devolvemos false silenciosamente.
  if (
    !LEADS_ENDPOINT ||
    LEADS_ENDPOINT === "PEGAR_URL_DE_APPS_SCRIPT" ||
    !/^https?:\/\//i.test(LEADS_ENDPOINT)
  ) {
    return false;
  }
  try {
    const res = await fetch(LEADS_ENDPOINT, {
      method: "POST",
      // Evitamos preflight CORS usando text/plain — Apps Script lo recibe en e.postData.contents
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch (err) {
    console.warn("No se pudo guardar el lead:", err);
    return false;
  }
}

// === Init ====================================================================
document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initFooterYear();
  initReveal();
  initWhatsAppLinks();
  initContactForm();
});
