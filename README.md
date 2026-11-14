# Front-end

## Inicio de sesión con Google

Google Identity Services requiere que `VITE_GOOGLE_CLIENT_ID` esté definida al ejecutar
Vite o al compilar la aplicación. Para desarrollo local, copia `.env.example` a `.env`
y coloca el ID de cliente OAuth de tipo aplicación web. Debe ser el mismo valor configurado
en el backend como `GOOGLE_CLIENT_ID`.

`VITE_API_URL` debe apuntar al backend público e incluir el prefijo `/api`. El cliente de API
rechaza hosts locales y direcciones privadas, también en desarrollo, y usa el backend público
predeterminado si recibe uno de esos valores.

En producción, configura también `VITE_GOOGLE_CLIENT_ID` en el entorno de compilación de
la plataforma del frontend y `FRONTEND_URL` en el backend con el origen público exacto del
frontend (protocolo y dominio, sin `/login` ni otra ruta). Añade ese origen a los orígenes
autorizados del cliente OAuth en Google Cloud Console. Las variables `VITE_*` se insertan
durante la compilación; después de cambiarlas hay que volver a desplegar el frontend.

## Subida de imágenes

Configura `VITE_CLOUDINARY_CLOUD_NAME` y `VITE_CLOUDINARY_UPLOAD_PRESET` en el entorno de
compilación. El preset debe ser unsigned y limitar la subida a JPG, PNG y WebP de hasta 5 MB.
El frontend nunca recibe ni almacena el API secret de Cloudinary.
