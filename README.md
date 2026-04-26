# Sitio personal — Dr. Matías Luciano Godoy

Web personal profesional, enfocada en **fraude bancario digital**, **evidencia digital** y **defensa del consumidor financiero**. HTML/CSS/JS puro, sin frameworks. Lista para desplegarse en **Cloudflare Pages**.

---

## 1. Estrategia de posicionamiento

**Idea central**: la web no presenta a Matías como abogado generalista. Lo presenta como un profesional con **doble formación** (jurídica + ciberseguridad) que entiende cómo ocurren los fraudes digitales y cómo construir el reclamo a partir de la evidencia disponible.

- **Diferenciación frente a TPG**: TPG es la firma institucional, amplia y de equipo. Esta web es personal y enfocada. La menciona en footer/contacto, no en hero.
- **Promesa**: análisis legal-técnico de fraude bancario digital. Sin promesas de resultado.
- **Voz**: sobria, jurídica, prudente, accesible. Verbos como *analizar, evaluar, ordenar, diseñar, acompañar*.
- **Públicos**: víctimas de transferencias no autorizadas, vaciamiento de cuenta, compras desconocidas, fraudes en wallets/fintechs y empresas/profesionales que necesitan entender riesgos legales digitales.

## 2. Arquitectura del sitio

```
/                                   → index.html (Home)
/sobre-mi.html                      → Perfil profesional
/fraude-bancario.html               → Landing principal de captación
/evidencia-digital.html             → Guía práctica + autoridad
/analisis.html                      → Hub de artículos
/articulos/transferencia-no-autorizada.html
/articulos/errores-comunes-reclamo.html
/articulos/evidencia-digital-conservar.html
/contacto.html                      → Formulario + WhatsApp + canales
/404.html
/sitemap.xml
/robots.txt
```

Cada página comparte un **header sticky**, **footer** consistente, **botón flotante de WhatsApp** y SEO básico (title, description, canonical, Open Graph, Twitter, JSON-LD donde corresponde).

## 3. Diseño visual

Sistema en `styles.css` (tokens CSS):

- **Paleta**: azul marino oscuro `#0a1628`, navy/grafito `#1a2438`, blanco `#fff`, fondo cálido neutro `#f7f8fa`, celeste tenue `#4d7eb3`, accent suave `#d8e4f1`.
- **Tipografía**: *Cormorant Garamond* para titulares (peso editorial/jurídico), *Inter* para texto y UI.
- **Componentes**: hero con grilla técnica sutil, cards con bordes finos, sección oscura de CTA, pasos numerados, prose para artículos, formulario tipado.
- **Mobile-first**: layout columna única → grids de 2/3/4 según breakpoint.
- **Accesibilidad**: skip-link, focos visibles, `aria-current`, animaciones desactivables vía `prefers-reduced-motion`.

## 4. Implementación

Stack: HTML5 + CSS (variables, Grid, Flexbox) + JS vanilla. Sin build, sin dependencias.

Funcionalidades en `script.js`:

- Menú móvil tipo drawer.
- Año dinámico en footer.
- Reveal on scroll con `IntersectionObserver`.
- Generación de links de WhatsApp con `data-wa="…"`.
- Envío del formulario:
  1. POST a `LEADS_ENDPOINT` (Apps Script u otro endpoint) con `Content-Type: text/plain;charset=utf-8` para evitar preflight CORS.
  2. **No bloquea** la consulta si el guardado falla.
  3. Abre WhatsApp con un mensaje contextualizado a partir de los datos del formulario.

## 5. Archivos creados

```
index.html
sobre-mi.html
fraude-bancario.html
evidencia-digital.html
analisis.html
contacto.html
articulos/transferencia-no-autorizada.html
articulos/errores-comunes-reclamo.html
articulos/evidencia-digital-conservar.html
styles.css
script.js
sitemap.xml
robots.txt
404.html
README.md
```

## 6. Cómo correr localmente

Cualquier servidor estático funciona. Tres opciones:

```bash
# Python 3
python -m http.server 5173

# Node (si tenés npx)
npx serve -l 5173 .

# VS Code: extensión "Live Server"
```

Abrir `http://localhost:5173/`.

## 7. Conexión del formulario (opcional)

El formulario está preparado para integrar **Google Sheets vía Apps Script** sin romper si todavía no hay backend:

1. Crear un Google Sheet (ej. `Leads — Sitio personal`).
2. Extensiones → Apps Script → pegar:

   ```js
   function doPost(e) {
     const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
     const data = JSON.parse(e.postData.contents);
     sheet.appendRow([
       new Date(),
       data.nombre || "",
       data.telefono || "",
       data.email || "",
       data.tipo || "",
       data.descripcion || "",
       data.source || "",
       data.userAgent || ""
     ]);
     return ContentService.createTextOutput(JSON.stringify({ ok: true }))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```

3. Implementar como Web App, ejecutándose como el dueño y con acceso "cualquiera".
4. Copiar la URL generada y reemplazar en `script.js`:

   ```js
   const LEADS_ENDPOINT = "https://script.google.com/macros/s/.../exec";
   ```

Si no se completa este paso, el formulario sigue funcionando: deriva al usuario por WhatsApp con el contexto cargado.

## 8. Despliegue en Cloudflare Pages

1. Crear un repositorio Git con estos archivos (GitHub/GitLab) o subirlos directamente desde la UI de Pages.
2. En Cloudflare → **Pages → Create project** → conectar el repo o "Direct Upload".
3. **Build settings**: dejar vacíos (es un sitio estático). Output directory: `/`.
4. Conectar el dominio personalizado en *Custom domains*.

Recomendaciones:

- Activar HTTPS automático (default).
- Activar *Always Use HTTPS* y *Brotli*.
- Agregar un *redirect rule* `www → root` o viceversa según se elija.

## 9. SEO incluido

- `title`, `meta description`, `canonical`, Open Graph, Twitter Card en cada página.
- JSON-LD `Person` y `LegalService` en home; `Article` en cada artículo.
- `sitemap.xml` y `robots.txt` listos.
- Encabezados `h1/h2/h3` jerárquicos.
- URLs limpias, en español, con palabras clave relevantes.

Antes de publicar, reemplazar el dominio `matiasgodoy.com.ar` por el dominio definitivo en `sitemap.xml`, `robots.txt` y los `<link rel="canonical">` / `og:url`.

## 10. Recomendaciones de dominio

Opciones por orden de preferencia:

1. `matiasgodoy.com.ar` — claro, profesional, fácil de recordar.
2. `drmatiasgodoy.com.ar` — refuerza el título profesional.
3. `mgodoylegal.com.ar` — más corto y útil para email.
4. `matiasgodoy.legal` — moderno (gTLD `.legal`), si se quiere proyección internacional.

Sugerencia: registrar dos (`.com.ar` + `.legal`) y redirigir uno al otro.

## 11. Próximos pasos

**Corto plazo**

- [ ] Reemplazar dominio placeholder en SEO (`matiasgodoy.com.ar`).
- [ ] Configurar Google Sheets + Apps Script y pegar la URL en `script.js`.
- [ ] Validar credenciales y formación que se quieran exponer en *Sobre mí* (sin inventar nada).
- [ ] Foto profesional opcional para hero o página *Sobre mí*.
- [ ] Crear OG image (1200x630) consistente con la paleta.

**Mediano plazo**

- [ ] Sumar 6–10 artículos más en `/articulos/` (jurisprudencia comentada, casos típicos, fintechs específicas).
- [ ] Página de jurisprudencia/fallos comentados como categoría destacada.
- [ ] FAQ en `/fraude-bancario.html` (montos típicos, plazos, qué esperar).
- [ ] Aviso legal y política de privacidad como página separada.

**Largo plazo**

- [ ] Integrar analítica liviana (Plausible o Cloudflare Web Analytics).
- [ ] Newsletter breve mensual para clientes y derivadores.
- [ ] Mini CMS (Decap CMS o similar) si el volumen de artículos crece.

## 12. Criterio editorial — recordatorios

- No prometer resultados. No "garantizar" recuperos.
- No inventar credenciales ni titulaciones.
- No replicar contenido del sitio de Estudio Jurídico TPG.
- Mantener un foco claro en fraude bancario digital y consumo financiero.
- Cada CTA debe llevar a una acción concreta y manejable: consulta, lectura de guía, WhatsApp.
