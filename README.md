# Viví las Termas 🌿

Portal integral de turismo, bienestar y servicios. Este proyecto centraliza la oferta profesional de la región, facilitando la gestión de socios y la visibilidad de servicios.

## 🚀 Estado del Proyecto
Actualmente en fase de **Despliegue de Sección de Socios**.
* **Acceso Principal:** La Home se encuentra en mantenimiento/oculta.
* **Sección Activa:** Panel de gestión de Socios e integración de perfiles.

## 🛠️ Stack Tecnológico
* **Framework:** Next.js 14+ (App Router)
* **Lenguaje:** TypeScript
* **Estilos:** Tailwind CSS
* **Multimedia:** ImageKit.io (CDN & Optimization)

## 📦 Requisitos de Producción
Para el despliegue en entornos de hosting administrado:
* **Node.js:** Versión 18.x o superior.
* **Build:** El proyecto debe compilarse usando `npm run build`.
* **Variables de Entorno:** Es indispensable configurar el archivo `.env` en el servidor con las credenciales de ImageKit y la base de datos para garantizar el funcionamiento de la sección de socios.

## 💻 Instalación Local
1. Clonar el repositorio.
2. Instalar dependencias: `npm install`
3. Iniciar modo desarrollo: `npm run dev`

## 📄 Notas de Configuración
Este proyecto utiliza rutas dinámicas para la gestión de socios. Asegúrate de que el servidor soporte la ejecución de procesos Node.js persistentes (vía PM2 o el gestor de aplicaciones del panel de control).

---
© 2026 Viví las Termas - TG Web Studios.
