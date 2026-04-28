/* ================================================================
   Dr. Matias Luciano Godoy - script.js
   Menu movil, formulario de leads, WhatsApp y reveal on scroll.
   ================================================================ */

// === Configuracion ==========================================================
// Endpoint de Apps Script / backend para guardar leads.
// Se puede definir en esta constante o en window.SITE_CONFIG.leadsEndpoint.
const LEADS_ENDPOINT = "https://script.google.com/macros/s/AKfycbwbkemUbUHwbkJhIU78sJcCuXIFaBy-JxQeZnZcp2rN3o9OP8fMN2jU2CUQLrn9gY3d2A/exec";

// Datos de WhatsApp.
const WHATSAPP_NUMBER = "5491155857623";
const WHATSAPP_DEFAULT_MSG =
  "Hola Mat\u00edas, quiero hacer una consulta por un posible fraude bancario digital.";

// === Utils ==================================================================
const qs = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

function buildWhatsAppUrl(message) {
  const text = encodeURIComponent(message || WHATSAPP_DEFAULT_MSG);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

function getLeadsEndpoint() {
  const globalEndpoint = window.SITE_CONFIG?.leadsEndpoint;
  const endpoint = globalEndpoint || LEADS_ENDPOINT;
  return typeof endpoint === "string" ? endpoint.trim() : "";
}

function isFocusable(element) {
  return !element.hasAttribute("disabled") && !element.getAttribute("aria-hidden");
}

// === Menu movil =============================================================
function initMobileNav() {
  const toggle = qs(".nav__toggle");
  const drawer = qs(".nav__mobile");
  if (!toggle || !drawer) return;

  const focusables = () =>
    qsa(
      "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])",
      drawer
    ).filter(isFocusable);

  function closeDrawer({ returnFocus = false } = {}) {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("no-scroll");
    if (returnFocus) toggle.focus();
  }

  function openDrawer() {
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    toggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("no-scroll");
    const [firstLink] = focusables();
    if (firstLink) firstLink.focus();
  }

  toggle.addEventListener("click", () => {
    const open = drawer.classList.contains("is-open");
    if (open) {
      closeDrawer({ returnFocus: true });
    } else {
      openDrawer();
    }
  });

  qsa("a", drawer).forEach((a) =>
    a.addEventListener("click", () => {
      closeDrawer();
    })
  );

  document.addEventListener("click", (event) => {
    if (!drawer.classList.contains("is-open")) return;
    if (drawer.contains(event.target) || toggle.contains(event.target)) return;
    closeDrawer();
  });

  document.addEventListener("keydown", (event) => {
    if (!drawer.classList.contains("is-open")) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeDrawer({ returnFocus: true });
      return;
    }

    if (event.key !== "Tab") return;

    const links = focusables();
    if (links.length === 0) return;

    const first = links[0];
    const last = links[links.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}

// === Año footer =============================================================
function initFooterYear() {
  const el = qs("[data-year]");
  if (el) el.textContent = String(new Date().getFullYear());
}

// === Reveal on scroll =======================================================
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

// === WhatsApp links =========================================================
function initWhatsAppLinks() {
  qsa("[data-wa]").forEach((el) => {
    const message = el.getAttribute("data-wa") || WHATSAPP_DEFAULT_MSG;
    el.href = buildWhatsAppUrl(message);
    el.target = "_blank";
    el.rel = "noopener";
  });
}

// === Formulario de contacto ================================================
function initContactForm() {
  const form = qs("#contact-form");
  if (!form) return;

  const status = qs(".form__status", form);
  const submitBtn = qs("button[type='submit']", form);
  const fields = qsa("input, select, textarea", form);

  function showStatus(type, message) {
    if (!status) return;
    status.innerHTML = message;
    status.classList.remove("form__status--ok", "form__status--err");
    status.classList.add("is-visible", `form__status--${type}`);
  }

  function getFieldErrorMessage(field) {
    if (field.validity.customError) return "Este campo es obligatorio.";
    if (field.validity.valueMissing) return "Este campo es obligatorio.";
    if (field.validity.typeMismatch && field.type === "email") return "Ingres\u00e1 un email v\u00e1lido.";
    if (field.validity.tooShort) return "Complet\u00e1 este campo con m\u00e1s informaci\u00f3n.";
    return "Revis\u00e1 este campo.";
  }

  function ensureErrorElement(field) {
    let errorEl = qs(`#${field.id}-error`, form);
    if (errorEl) return errorEl;

    errorEl = document.createElement("span");
    errorEl.id = `${field.id}-error`;
    errorEl.className = "field__error";
    field.parentElement.appendChild(errorEl);
    return errorEl;
  }

  function clearFieldState(field) {
    const errorEl = ensureErrorElement(field);
    field.setCustomValidity("");
    field.parentElement.classList.remove("is-invalid");
    field.setAttribute("aria-invalid", "false");
    field.setAttribute("aria-describedby", errorEl.id);
    errorEl.textContent = "";
  }

  function validateField(field) {
    const errorEl = ensureErrorElement(field);
    const value = typeof field.value === "string" ? field.value.trim() : field.value;

    if (field.hasAttribute("required") && !value) {
      field.setCustomValidity("missing");
    } else {
      field.setCustomValidity("");
    }

    const valid = field.checkValidity();
    field.parentElement.classList.toggle("is-invalid", !valid);
    field.setAttribute("aria-invalid", String(!valid));
    field.setAttribute("aria-describedby", errorEl.id);
    errorEl.textContent = valid ? "" : getFieldErrorMessage(field);
    return valid;
  }

  function validateForm() {
    const invalidFields = fields.filter((field) => !validateField(field));
    return invalidFields;
  }

  fields.forEach((field) => {
    clearFieldState(field);
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => validateField(field));
    field.addEventListener("change", () => validateField(field));
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const invalidFields = validateForm();

    if (invalidFields.length > 0) {
      showStatus("err", "Revis\u00e1 los campos marcados antes de enviar la consulta.");
      invalidFields[0].focus();
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.dataset.originalText = submitBtn.textContent;
      submitBtn.textContent = "Preparando WhatsApp...";
    }

    const data = Object.fromEntries(
      Array.from(new FormData(form).entries(), ([key, value]) => [
        key,
        typeof value === "string" ? value.trim() : value,
      ])
    );
    data.source = "sitio-personal";
    data.timestamp = new Date().toISOString();
    data.userAgent = navigator.userAgent;

    const waMessage =
      `Hola Mat\u00edas, soy ${data.nombre || "(sin nombre)"}. ` +
      `Quer\u00eda consultarte por: ${data.tipo || "consulta general"}. ` +
      (data.descripcion ? `Detalle: ${data.descripcion}` : "");

    const waUrl = buildWhatsAppUrl(waMessage);
    const popup = window.open(waUrl, "_blank", "noopener");
    const remoteOk = await saveLead(data);
    const popupBlocked = !popup || popup.closed || typeof popup.closed === "undefined";
    const endpointConfigured = Boolean(getLeadsEndpoint()) && getLeadsEndpoint() !== "PEGAR_URL_DE_APPS_SCRIPT";

    if (remoteOk) {
      showStatus(
        "ok",
        popupBlocked
          ? `Recibimos tu consulta. Si WhatsApp no se abri\u00f3, segu\u00ed desde <a href="${waUrl}" target="_blank" rel="noopener">este enlace directo</a>.`
          : "Recibimos tu consulta. Tambi\u00e9n abrimos WhatsApp para continuar m\u00e1s r\u00e1pido."
      );
    } else {
      showStatus(
        "err",
        !endpointConfigured
          ? popupBlocked
            ? `El formulario todav\u00eda no est\u00e1 sincronizado con un backend de leads. Para no frenarte, segu\u00ed por <a href="${waUrl}" target="_blank" rel="noopener">WhatsApp</a>.`
            : "El formulario todav\u00eda no est\u00e1 sincronizado con un backend de leads, pero ya abrimos WhatsApp para continuar sin perder tiempo."
          : popupBlocked
            ? `No pudimos registrar la consulta en este momento. Para no frenarte, segu\u00ed por <a href="${waUrl}" target="_blank" rel="noopener">WhatsApp</a>.`
            : "No pudimos registrar la consulta en este momento, pero ya abrimos WhatsApp para continuar sin perder tiempo."
      );
    }

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = submitBtn.dataset.originalText || "Enviar consulta";
    }

    if (remoteOk || !popupBlocked) {
      form.reset();
      fields.forEach((field) => clearFieldState(field));
    }
  });
}

async function saveLead(payload) {
  const endpoint = getLeadsEndpoint();

  if (
    !endpoint ||
    endpoint === "PEGAR_URL_DE_APPS_SCRIPT" ||
    !/^https?:\/\//i.test(endpoint)
  ) {
    return false;
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch (err) {
    console.warn("No se pudo guardar el lead:", err);
    return false;
  }
}

// === Init ===================================================================
document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initFooterYear();
  initReveal();
  initWhatsAppLinks();
  initContactForm();
});
