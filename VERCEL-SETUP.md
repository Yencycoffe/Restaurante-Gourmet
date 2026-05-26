# Vercel: Configuración de variables y pruebas locales

Este archivo recoge los pasos exactos para configurar las variables de entorno necesarias en Vercel y cómo probar la función serverless localmente con `vercel dev`.

Requisitos previos
- Tener el proyecto conectado a un repositorio en Vercel (o importarlo desde GitHub/GitLab).
- Tener una cuenta en SendGrid (u otro proveedor SMTP con API) y su clave API.
- Tener instalado `node` y `npm` y (opcional) la Vercel CLI.

1) Crear clave en SendGrid
- Entra a tu cuenta de SendGrid → API Keys → Create API Key.
- Elige el permiso de `Mail Send` y copia la clave generada.

2) Añadir variables en Vercel (Dashboard)

- Entra a tu proyecto en Vercel → Settings → Environment Variables.
- Añade estas variables (selecciona Development, Preview y Production si quieres disponibilidad en todos los entornos):
  - `SENDGRID_API_KEY` = (tu clave SendGrid)
  - `RESERVATION_TO_EMAIL` = tu@correo.com
  - `SEND_FROM_EMAIL` = no-reply@tudominio.com  (opcional, debe estar verificado en SendGrid)

3) (Opcional) Traer variables al entorno local
- Instala Vercel CLI e inicia sesión si aún no lo has hecho:

```bash
npm i -g vercel
vercel login
```

- Para descargar las variables de Vercel al archivo `.env.local` (útil para `vercel dev`):

```bash
vercel env pull .env.local
```

NO subas `.env.local` al repositorio (añádelo a `.gitignore`).

4) Ejecutar `vercel dev` para probar funciones localmente

- En la raíz del proyecto ejecuta:

```bash
vercel dev
```

- `vercel dev` levantará un servidor local (por defecto en `http://localhost:3000`) y emulará las funciones en `/api`.

5) Probar el endpoint localmente (curl o desde la UI)

- Con `vercel dev` corriendo, prueba con `curl`:

```bash
curl -X POST http://localhost:3000/api/send-reservation \
  -H "Content-Type: application/json" \
  -d '{"name":"Prueba","phone":"3001234567","email":"cliente@correo.com","date":"2026-06-01","time":"19:00","people":"2","notes":"Sin gluten","id":12345}'
```

- O abre `http://localhost:3000` y envía el formulario de Reservas desde la UI.

6) Errores comunes y soluciones rápidas
- 401 / 403 de SendGrid: la `SENDGRID_API_KEY` es inválida o falta permiso `Mail Send`. Verifica la clave.
- 500: falta configurar `SENDGRID_API_KEY` o `RESERVATION_TO_EMAIL` en el entorno (o en `.env.local` si pruebas localmente).
- Problemas con `SEND_FROM_EMAIL`: SendGrid puede requerir verificación del remitente.

7) Despliegue en producción

- Haz commit y push de tus cambios. Si el repositorio está conectado, Vercel desplegará automáticamente.
- Alternativamente, puedes forzar despliegue desde la CLI:

```bash
vercel --prod
```

8) Buenas prácticas y mejoras
- Añadir validación y sanitización en la función serverless.
- Implementar reCAPTCHA en el frontend para evitar spam.
- Guardar reservas en una DB (Supabase/Airtable) para gestión y sincronización.
- Monitorizar logs en Vercel (Dashboard → Functions) para detectar errores en producción.

9) Contacto rápido
- Si quieres, puedo añadir un script para enviar pruebas automáticas, o integrar registro en Supabase/Airtable. Dime qué prefieres y lo implemento.
