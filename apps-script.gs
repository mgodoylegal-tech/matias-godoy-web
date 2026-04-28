/**
 * ============================================================================
 * Dr. Matias Luciano Godoy - Backend de leads (Google Apps Script)
 * ============================================================================
 *
 * Este backend esta pensado para la planilla operativa del sitio, con columnas:
 *
 * lead_id | fecha_hora | nombre | telefono | email | tipo_consulta | mensaje |
 * numero_whatsapp_asignado | origen | estado | pagina_origen | user_agent |
 * prioridad | fecha_contacto | observaciones | resultado
 *
 * Pasos:
 * 1. Abrir la Google Sheet de leads.
 * 2. Extensiones > Apps Script.
 * 3. Reemplazar el contenido por este archivo.
 * 4. Ajustar SHEET_ID, ASSIGNED_WHATSAPP_NUMBER y NOTIFY_EMAIL si hace falta.
 * 5. Implementar como Aplicacion web con acceso "Cualquiera".
 * ============================================================================
 */

const SHEET_ID = "1_x899PCWrn7KcedOERkSQVBeuV7SgbX0Ahk4RJdLIXc";
const SHEET_NAME = ""; // dejar vacio para usar la primera hoja
const TIMEZONE = "America/Argentina/Buenos_Aires";
const ASSIGNED_WHATSAPP_NUMBER = "5491155857623";
const NOTIFY_EMAIL = ""; // opcional

function doPost(e) {
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || "{}");

    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : ss.getSheets()[0];

    if (!sheet) {
      throw new Error("No se encontro la hoja de destino.");
    }

    const leadId = Utilities.getUuid();
    const createdAt = payload.timestamp ? new Date(payload.timestamp) : new Date();
    const fechaHora = formatLocalDateTime(createdAt);
    const prioridad = resolvePriority(payload.tipo || "", payload.descripcion || "");
    const paginaOrigen = normalizePageOrigin(payload.pageOrigin || payload.page_origin || "");

    const targetRow = sheet.getLastRow() + 1;
    sheet.appendRow([
      leadId,
      fechaHora,
      payload.nombre || "",
      payload.telefono || "",
      payload.email || "",
      payload.tipo || "",
      payload.descripcion || "",
      ASSIGNED_WHATSAPP_NUMBER,
      payload.source || "sitio-personal",
      "Nuevo",
      paginaOrigen,
      payload.userAgent || "",
      prioridad,
      "",
      "",
      "Pendiente",
    ]);

    styleNewLeadRow(sheet, targetRow, prioridad);

    if (NOTIFY_EMAIL) {
      MailApp.sendEmail(NOTIFY_EMAIL, buildSubject(payload.tipo || "", prioridad), buildEmailBody({
        leadId,
        fechaHora,
        prioridad,
        paginaOrigen,
        payload,
      }));
    }

    return jsonResponse({ ok: true, leadId, prioridad });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function doGet() {
  return ContentService
    .createTextOutput("Endpoint operativo.")
    .setMimeType(ContentService.MimeType.TEXT);
}

function resolvePriority(tipo, descripcion) {
  const haystack = `${tipo} ${descripcion}`.toLowerCase();

  if (
    haystack.includes("adulto mayor") ||
    haystack.includes("cuenta vaciada") ||
    haystack.includes("transferencia no autorizada") ||
    haystack.includes("credito") ||
    haystack.includes("crédito") ||
    haystack.includes("prestamo no solicitado") ||
    haystack.includes("préstamo no solicitado")
  ) {
    return "Alta";
  }

  if (
    haystack.includes("fintech") ||
    haystack.includes("billetera") ||
    haystack.includes("reclamo rechazado") ||
    haystack.includes("compra desconocida")
  ) {
    return "Media";
  }

  return "Baja";
}

function normalizePageOrigin(pageOrigin) {
  if (!pageOrigin) return "";

  try {
    const url = new URL(pageOrigin);
    return `${url.origin}${url.pathname}`;
  } catch (err) {
    return String(pageOrigin);
  }
}

function formatLocalDateTime(date) {
  return Utilities.formatDate(date, TIMEZONE, "yyyy-MM-dd HH:mm:ss");
}

function styleNewLeadRow(sheet, rowNumber, prioridad) {
  const rowRange = sheet.getRange(rowNumber, 1, 1, 16);
  const background = prioridad === "Alta" ? "#fce8e6" : prioridad === "Media" ? "#fff4cc" : "#e6f4ea";
  rowRange.setBackground(background);

  sheet.getRange(rowNumber, 2).setNumberFormat("yyyy-mm-dd hh:mm:ss");
  sheet.getRange(rowNumber, 10).setFontWeight("bold");
  sheet.getRange(rowNumber, 13).setFontWeight("bold");
}

function buildSubject(tipo, prioridad) {
  const label = tipo || "consulta general";
  return `Nuevo lead web - ${label} - Prioridad ${prioridad}`;
}

function buildEmailBody(context) {
  return (
    `Lead ID: ${context.leadId}\n` +
    `Fecha: ${context.fechaHora}\n` +
    `Prioridad: ${context.prioridad}\n` +
    `Nombre: ${context.payload.nombre || ""}\n` +
    `Telefono: ${context.payload.telefono || ""}\n` +
    `Email: ${context.payload.email || ""}\n` +
    `Tipo: ${context.payload.tipo || ""}\n` +
    `Mensaje: ${context.payload.descripcion || ""}\n` +
    `Pagina: ${context.paginaOrigen || ""}\n` +
    `Origen: ${context.payload.source || ""}`
  );
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
