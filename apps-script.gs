/**
 * ============================================================================
 * Dr. Matías Luciano Godoy — Backend de leads (Google Apps Script)
 * ============================================================================
 *
 * Cómo desplegarlo (paso a paso):
 *
 *  1. Crear una hoja de cálculo nueva en Google Sheets ("Leads — sitio Matías").
 *     En la primera fila poner los encabezados, en este orden exacto:
 *
 *     timestamp | nombre | telefono | email | tipo | descripcion | userAgent | source
 *
 *  2. En esa hoja: Extensiones → Apps Script. Borrar el contenido y pegar
 *     todo este archivo (apps-script.gs).
 *
 *  3. En la línea SHEET_ID de abajo, pegar el ID de la hoja (lo que aparece
 *     en la URL de Sheets, entre /d/ y /edit).
 *
 *  4. Guardar (icono de disquete). Nombre del proyecto: "leads-matiasgodoy".
 *
 *  5. Implementar → Nueva implementación → Tipo: Aplicación web.
 *     - Ejecutar como: yo (tu cuenta).
 *     - Quién tiene acceso: cualquier usuario.
 *     - Implementar.
 *     - Copiar la URL de la app web (termina en /exec).
 *
 *  6. En script.js del sitio, reemplazar PEGAR_URL_DE_APPS_SCRIPT por esa URL.
 *
 *  7. Probar enviando una consulta desde el sitio: debería aparecer una fila
 *     nueva en la planilla.
 *
 * Notas:
 * - El sitio envía JSON como text/plain para evitar el preflight CORS.
 * - El backend nunca devuelve datos del usuario; sólo confirma OK / error.
 * - Si querés recibir aviso por email cuando entra una consulta, descomentá
 *   la línea de MailApp.sendEmail más abajo y pegar el destinatario.
 * ============================================================================
 */

const SHEET_ID = "PEGAR_ID_DE_GOOGLE_SHEETS";
const SHEET_NAME = "Sheet1"; // o "Hoja 1" según idioma de la cuenta
const NOTIFY_EMAIL = ""; // opcional: dejar vacío o poner un mail para notificación

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || "{}");

    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];

    sheet.appendRow([
      payload.timestamp || new Date().toISOString(),
      payload.nombre || "",
      payload.telefono || "",
      payload.email || "",
      payload.tipo || "",
      payload.descripcion || "",
      payload.userAgent || "",
      payload.source || "",
    ]);

    if (NOTIFY_EMAIL) {
      const subject = `Nueva consulta del sitio — ${payload.tipo || "general"}`;
      const body =
        `Nombre: ${payload.nombre || ""}\n` +
        `Teléfono: ${payload.telefono || ""}\n` +
        `Email: ${payload.email || ""}\n` +
        `Tipo: ${payload.tipo || ""}\n` +
        `Descripción: ${payload.descripcion || ""}\n\n` +
        `Timestamp: ${payload.timestamp || ""}`;
      MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput("Endpoint operativo.")
    .setMimeType(ContentService.MimeType.TEXT);
}
