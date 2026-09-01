# Despliegue en Hostinger

La aplicación es una Node.js Web App autocontenida. El servidor sirve la presentación desde `face-lab/`, escucha el puerto que Hostinger proporciona mediante `PORT` y expone `/healthz` para comprobar el estado.

## Configuración en hPanel

1. Crear `Websites → Add Website → Node.js Web App`.
2. Importar el repositorio `santiagosessa/ALGEBRA-TP` desde GitHub.
3. Usar `face-lab` como directorio raíz de la aplicación.
4. Configurar el archivo de entrada como `server.mjs`.
5. Usar `npm install` como comando de instalación y `npm start` como comando de inicio.
6. Elegir Node.js 20 o superior y desplegar.

El proyecto no necesita un directorio de build. Hostinger debe conservar los archivos estáticos de `face-lab/`, incluyendo `node_modules/` instalado a partir de `package-lock.json` y `tp-trabajo-grupal.pdf`.

Después del despliegue, comprobar que la aplicación responda en `/healthz` y configurar el dominio desde el panel de Hostinger.
