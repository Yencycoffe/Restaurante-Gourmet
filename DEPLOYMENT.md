# Manual de Despliegue (Deployment) 🚀

Este proyecto es una aplicación estática (HTML/CSS/JS), por lo que puede ser desplegado fácilmente en cualquier servicio de hosting moderno.

## Opción 1: Vercel (Recomendado)
Vercel detecta automáticamente proyectos de Vanilla JS y ofrece actualizaciones automáticas al hacer `git push`.

1. Conecta tu cuenta de GitHub a [Vercel](https://vercel.com/).
2. Selecciona el repositorio `Taller_Restaurante`.
3. Deja los parámetros por defecto (Build Command y Output Directory vacíos).
4. Haz clic en **Deploy**.

## Opción 2: GitHub Pages
Ideal para proyectos escolares o portafolios rápidos.

1. Ve a la pestaña **Settings** de tu repositorio en GitHub.
2. En el menú lateral, selecciona **Pages**.
3. En la sección "Build and deployment", elige la rama `main` y la carpeta `/ (root)`.
4. Haz clic en **Save**. Tu sitio estará disponible en `https://tu-usuario.github.io/tu-repositorio/` en unos minutos.

## Opción 3: Servidor Local (Desarrollo)
Si deseas trabajar de forma local con actualización automática:

1. Instala la extensión **Live Server** en Visual Studio Code.
2. Abre la carpeta del proyecto.
3. Haz clic derecho en `index.html` y selecciona **"Open with Live Server"**.

---
**Nota Crítica**: Para que las imágenes se visualicen correctamente, asegúrate de tener una conexión a internet estable, ya que se cargan mediante CDN (Pexels/iStock).
