# Sitio personal - Dr. Matias Luciano Godoy

Sitio profesional orientado a fraude bancario digital, evidencia digital y defensa del consumidor financiero.
Stack simple: HTML, CSS y JavaScript vanilla. Sin build, sin dependencias y listo para desplegar en Cloudflare Pages.

## Estado actual

- Repositorio publicado en GitHub.
- Dominio objetivo: `matiasgodoy.com.ar`.
- Deploy preparado para Cloudflare Pages.
- SEO base ya apuntando a `https://matiasgodoy.com.ar/`.
- Formulario funcionando con derivacion a WhatsApp aunque el backend de leads todavia no este configurado.

## Estructura

```text
/
|- index.html
|- sobre-mi.html
|- fraude-bancario.html
|- evidencia-digital.html
|- analisis.html
|- contacto.html
|- 404.html
|- styles.css
|- script.js
|- apps-script.gs
|- robots.txt
|- sitemap.xml
|- _headers
|- .nojekyll
`- articulos/
   |- transferencia-no-autorizada.html
   |- creditos-no-solicitados.html
   |- errores-comunes-reclamo.html
   `- evidencia-digital-conservar.html
```

## Como correrlo localmente

Cualquier servidor estatico sirve.

```bash
python -m http.server 5173
```

Abrir:

```text
http://localhost:5173/
```

## Deploy

### Cloudflare Pages

Configuracion recomendada:

- Framework preset: `None`
- Build command: vacio
- Build output directory: `.`
- Production branch: `main`

El repo ya incluye:

- [`.github/workflows/pages.yml`](C:/Users/USER/Documents/Paginapersonal/.github/workflows/pages.yml:1) para GitHub Pages
- [`_headers`](C:/Users/USER/Documents/Paginapersonal/_headers:1) para headers y cache en Cloudflare Pages
- [`.nojekyll`](C:/Users/USER/Documents/Paginapersonal/.nojekyll:1) para compatibilidad de hosting estatico

### Dominio

Objetivo final:

- Canonico: `https://matiasgodoy.com.ar/`
- Secundario: `https://www.matiasgodoy.com.ar/` redirigiendo al canonico

Recomendacion operativa:

1. Esperar a que la zona DNS quede activa en Cloudflare.
2. Agregar `matiasgodoy.com.ar` al proyecto `matias-godoy-web`.
3. Agregar `www.matiasgodoy.com.ar`.
4. Redirigir `www` al dominio raiz.

## Formulario y leads

### Como funciona hoy

El formulario:

- valida campos en frontend;
- intenta guardar el lead en `LEADS_ENDPOINT`;
- abre WhatsApp con mensaje contextual;
- si el backend no existe o falla, no bloquea al usuario y deja seguir por WhatsApp.

El valor actual en [script.js](C:/Users/USER/Documents/Paginapersonal/script.js:10) sigue siendo placeholder:

```js
const LEADS_ENDPOINT = "PEGAR_URL_DE_APPS_SCRIPT";
```

Eso significa que hoy:

- el contacto por WhatsApp funciona;
- el lead remoto no se guarda todavia.

### Para activarlo con Google Sheets + Apps Script

1. Crear una hoja nueva en Google Sheets.
2. Abrir `Extensiones > Apps Script`.
3. Pegar el contenido de [apps-script.gs](C:/Users/USER/Documents/Paginapersonal/apps-script.gs:1).
4. Reemplazar en ese archivo:
   - `SHEET_ID`
   - `SHEET_NAME` si hace falta
   - `NOTIFY_EMAIL` si queres aviso por mail
5. Publicar como Web App:
   - Ejecutar como: vos
   - Acceso: cualquier usuario
6. Copiar la URL terminada en `/exec`.
7. Reemplazar `PEGAR_URL_DE_APPS_SCRIPT` en [script.js](C:/Users/USER/Documents/Paginapersonal/script.js:10).

Ejemplo:

```js
const LEADS_ENDPOINT = "https://script.google.com/macros/s/XXXXXXXXXXXX/exec";
```

## UX y mobile

El repo ya tiene:

- menu movil con drawer;
- cierre por click externo y tecla Escape;
- foco visible;
- bloqueo de scroll de fondo con menu abierto;
- validacion de formulario;
- safe area para el boton flotante de WhatsApp;
- layout responsive mobile-first.

Igual conviene hacer una pasada manual en:

- iPhone Safari
- Android Chrome
- tablet

## SEO y contenido

Ya incluidos:

- `title`, `meta description`, `canonical`
- Open Graph y Twitter Cards
- `robots.txt`
- `sitemap.xml`
- JSON-LD

Antes de darlo por cerrado conviene verificar:

- dominio final activo en Cloudflare;
- indexacion correcta del dominio canonico;
- vista previa social de `og-image.png`.

## Archivos clave

- [index.html](C:/Users/USER/Documents/Paginapersonal/index.html:1): home y formulario principal
- [contacto.html](C:/Users/USER/Documents/Paginapersonal/contacto.html:1): contacto dedicado
- [styles.css](C:/Users/USER/Documents/Paginapersonal/styles.css:1): sistema visual y responsive
- [script.js](C:/Users/USER/Documents/Paginapersonal/script.js:1): menu movil, WhatsApp y formulario
- [apps-script.gs](C:/Users/USER/Documents/Paginapersonal/apps-script.gs:1): backend opcional de leads
- [_headers](C:/Users/USER/Documents/Paginapersonal/_headers:1): headers para Cloudflare Pages

## Pendientes recomendados

- Configurar `LEADS_ENDPOINT`.
- Activar el dominio final en Cloudflare Pages.
- Revisar el sitio en celulares reales.
- Sumar analytics si queres medir conversiones.
- Opcional: pagina separada de privacidad/aviso legal.
