# Viví las Termas

Portal integral de turismo, bienestar y servicios en el Valle de Calamuchita. Centraliza alojamientos verificados, experiencias y la gestión de socios, con foco en la visibilidad profesional de la región.

El portal ofrece servicios de alojamientos en **Villa Yacanto**, **El Durazno** y **Santa Rosa de Calamuchita**, y también beneficios en **Termas del Sol**: complejo de **22 piletas climatizadas**, más **SPA** y **Saunas**.

## Estado del Proyecto

Actualmente en **lanzamiento del MVP** (primera versión en producción).

## Stack Tecnológico

* **Framework:** Next.js 15 (App Router)
* **Lenguaje:** TypeScript
* **Estilos:** Tailwind CSS
* **Auth / Backend:** Supabase
* **Multimedia:** ImageKit.io (CDN y optimización)

## Requisitos de Producción

Para el despliegue en entornos de hosting administrado:

* **Node.js:** Versión 18.x o superior.
* **Build:** El proyecto debe compilarse usando `npm run build`.
* **Variables de Entorno:** Configurar el archivo `.env` / `.env.local` en el servidor con las credenciales de Supabase, ImageKit y demás servicios necesarios.

## Instalación Local

1. Clonar el repositorio.
2. Instalar dependencias: `npm install`
3. Configurar variables de entorno (`.env.local`).
4. Iniciar modo desarrollo: `npm run dev`

## Notas de Configuración

Este proyecto utiliza rutas dinámicas (App Router). Asegurate de que el servidor soporte la ejecución de procesos Node.js (vía PM2, Vercel u otro gestor de aplicaciones del panel de control).

---
© 2026 Viví las Termas - TG Web Studios.
