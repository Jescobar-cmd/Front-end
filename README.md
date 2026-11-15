# Front-end

## Inicio de sesión con Google

Google Identity Services requiere que `VITE_GOOGLE_CLIENT_ID` esté definida al ejecutar
Vite o al compilar la aplicación. Para desarrollo local, copia `.env.example` a `.env`
y coloca el ID de cliente OAuth de tipo aplicación web. Debe ser el mismo valor configurado
en el backend como `GOOGLE_CLIENT_ID`.

`VITE_API_URL` debe apuntar al backend e incluir el prefijo `/api`. En desarrollo se puede
usar `http://localhost:4000/api`; los builds de producción rechazan hosts locales y direcciones
privadas, y usan el backend público predeterminado si reciben uno de esos valores. En
producción, configura la URL pública del backend como variable del entorno de compilación.

En producción, configura también `VITE_GOOGLE_CLIENT_ID` en el entorno de compilación de
la plataforma del frontend y `FRONTEND_URL` en el backend con el origen público exacto del
frontend (protocolo y dominio, sin `/login` ni otra ruta). Añade ese origen a los orígenes
autorizados del cliente OAuth en Google Cloud Console. Las variables `VITE_*` se insertan
durante la compilación; después de cambiarlas hay que volver a desplegar el frontend.

## Panel de moderación

El panel vive en `/moderacion` y está disponible para los roles `moderador` (4) y
`administrador` (1). Las rutas antiguas `/dashboard/moderador` y `/dashboard/administrador`
redirigen al panel.

```bash
cp .env.example .env
# .env: VITE_API_URL=http://localhost:4000/api
npm install
npm run dev
```

Credenciales de prueba del backend local:

- Moderador: `moderador@fistgig.com` / `Moderador1234`
- Administrador: `admin@fistgig.com` / `Admin1234`

Secciones:

- `/moderacion` — resumen con contadores reales de reportes pendientes, disputas abiertas y
  retiros solicitados. Cada tarjeta navega al listado con el filtro aplicado.
- `/moderacion/reportes` y `/moderacion/reportes/:id` — listado filtrable y resolución con
  texto obligatorio.
- `/moderacion/disputas` y `/moderacion/disputas/:id` — revisión y resolución con resultado
  económico obligatorio cuando la disputa se resuelve.
- `/moderacion/liquidaciones` — aprobación de retiros con referencia opcional y rechazo con
  motivo obligatorio.
- `/moderacion/notificaciones` — bandeja con contador, marcado individual y masivo.

El cliente HTTP del panel reutiliza `src/infrastructure/api/client.ts`: adjunta
`Authorization: Bearer <token>`, cierra la sesión ante un 401 y expone los detalles de
validación (422) para marcarlos en el formulario. Un 403 por suspensión reemplaza el panel
por la pantalla "Cuenta suspendida". Los 409 muestran el mensaje del backend y refrescan el
listado; los 429 muestran un aviso y bloquean temporalmente la acción.

## Subida de imágenes

Configura `VITE_CLOUDINARY_CLOUD_NAME` y `VITE_CLOUDINARY_UPLOAD_PRESET` en el entorno de
compilación. El preset debe ser unsigned y limitar la subida a JPG, PNG y WebP de hasta 5 MB.
El frontend nunca recibe ni almacena el API secret de Cloudinary.
