# Front-end

## Inicio de sesión con Google

Google Identity Services requiere que `VITE_GOOGLE_CLIENT_ID` esté definida al ejecutar
Vite o al compilar la aplicación. Para desarrollo local, copia `.env.example` a `.env`
y coloca el ID de cliente OAuth de tipo aplicación web.

En producción, configura `VITE_GOOGLE_CLIENT_ID` como variable del entorno de compilación
de la plataforma de despliegue y vuelve a generar/publicar el frontend. Añade también el
dominio de producción a los orígenes autorizados del cliente OAuth en Google Cloud Console.
Esta variable es de compilación: añadirla después de publicar no actualiza el sitio existente.
