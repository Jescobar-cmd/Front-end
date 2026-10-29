# Front-end

## Inicio de sesión con Google

Google Identity Services requiere que `VITE_GOOGLE_CLIENT_ID` esté definida al ejecutar
Vite o al compilar la aplicación. Para desarrollo local, copia `.env.example` a `.env`
y coloca el ID de cliente OAuth de tipo aplicación web. Debe ser el mismo valor configurado
en el backend como `GOOGLE_CLIENT_ID`.

`VITE_API_URL` debe apuntar al backend e incluir el prefijo `/api`; localmente el backend
escucha en `http://localhost:4000/api`. En producción, configura la URL pública del backend
como variable del entorno de compilación del frontend.

En producción, configura también `VITE_GOOGLE_CLIENT_ID` en el entorno de compilación de
la plataforma del frontend y `FRONTEND_URL` en el backend con el origen público exacto del
frontend (protocolo y dominio, sin `/login` ni otra ruta). Añade ese origen a los orígenes
autorizados del cliente OAuth en Google Cloud Console. Las variables `VITE_*` se insertan
durante la compilación; después de cambiarlas hay que volver a desplegar el frontend.
