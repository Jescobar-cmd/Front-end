# Perfil profesional: contrato actual y pendientes del backend

Esta nota documenta lo que el frontend ya consume del backend real y lo que falta
para completar el perfil profesional con portafolio tipo Fiverr.

## Rutas del frontend

| Ruta | Uso |
| --- | --- |
| `/perfil` | Redirige al perfil propio (`/perfil/:id`) o al editor de cliente. |
| `/perfil/:id` | Perfil profesional público. Comparte el layout interno. |
| `/perfil/usuario/:id` | Redirección de compatibilidad hacia `/perfil/:id`. |
| `/perfil/freelancer` | Editor del perfil del freelancer (ruta existente). |
| `/perfil/cliente` | Editor del perfil del cliente (ruta existente). |

El perfil profesional también queda accesible desde el menú de cuenta con
“Ver mi perfil”.

## Endpoints usados hoy

| Método | Endpoint | Uso |
| --- | --- | --- |
| `GET` | `/api/usuarios/:id` | Perfil público del freelancer o cliente. |
| `GET` | `/api/usuarios/:id/portafolio` | Proyectos del portafolio. |
| `GET` | `/api/usuarios/:id/calificaciones?limit=20` | Reseñas recibidas. |
| `GET` | `/api/usuarios/:id/servicios?page=1&limit=50` | Servicios activos usados como aproximación de paquetes (se muestran 3). |
| `POST` | `/api/freelancer/portafolio` | Crear proyecto. |
| `PATCH` | `/api/freelancer/portafolio/:id` | Editar proyecto. |
| `DELETE` | `/api/freelancer/portafolio/:id` | Eliminar proyecto. |
| `POST` | `/api/conversaciones` | Abrir conversación con el freelancer. |

## Campos que el backend ya devuelve

### Perfil

- `id`, `nombre`, `fotoPerfil`, `rolId`, `rolNombre`, `fechaRegistro`.
- `freelancer.tituloProfesional`, `biografia`, `calificacionPromedio`,
  `habilidades[]` (`id`, `nombre`, `nivel`).
- `cliente.nombreEmpresa`, `tipoCliente`, `descripcion`.

### Portafolio

- `id`, `titulo`, `descripcion`, `imagenUrl`, `enlaceUrl`, `fechaCreacion`.

### Reseñas

- `id`, `contratoId`, `puntuacion`, `comentario`, `fecha`,
  `calificador.nombre`, `calificador.fotoPerfil`.

### Servicios

- `id`, `titulo`, `descripcion`, `precio`, `imagenUrl`, `estado`,
  `categoria.nombre`.

## Pendientes para completar la experiencia

### 1. Acceso público sin sesión

Hoy `GET /api/usuarios/:id` y sus subrecursos exigen JWT. La ruta del frontend es
pública, pero un visitante sin sesión ve un estado de “Inicia sesión para ver
este perfil” porque la API responde `401`.

**Necesario:** permitir lectura anónima de perfiles públicos, portafolio,
calificaciones y servicios, o exponer endpoints públicos equivalentes.

### 2. Campos extendidos del freelancer

La UI ya contempla estos campos como opcionales y los muestra solo si la API los
devuelve:

- `propuesta` o titular corto.
- `ubicacion`.
- `remoto` (`boolean`).
- `disponibilidad`.
- `verificado` (`boolean`).
- `idiomas` (`string[]`).
- `tarifaHora` (`number`).
- `enlaces` (`linkedin`, `behance`, `github`, `instagram`, `sitioWeb`).

**Necesario:** agregarlos al modelo de freelancer, a `GET /api/usuarios/:id` y a
`PATCH /api/freelancer/perfil`. Hoy el editor solo guarda nombre, teléfono, foto,
título profesional, biografía y habilidades.

### 3. Portafolio enriquecido y ordenado

La UI permite mostrar cliente, galería, reto, solución, resultado y orden. El
contrato actual solo persiste `titulo`, `descripcion`, `imagenUrl` y
`enlaceUrl`.

**Necesario:**

- Agregar `cliente`, `imagenes[]`, `reto`, `solucion`, `resultado` y `orden` al
  modelo y a los endpoints `GET`, `POST` y `PATCH` del portafolio.
- Definir cómo se suben las imágenes (hoy se envía una URL externa, por ejemplo
  Cloudinary).
- Exponer un endpoint de reordenamiento, por ejemplo
  `PATCH /api/freelancer/portafolio/orden` con `[{ id, orden }]`.
- Hacer público `GET /api/usuarios/:id/portafolio` si se habilita el perfil
  anónimo.

### 4. Paquetes Básico / Estándar / Premium

El backend no tiene modelo ni endpoints de paquetes. La sección “Servicios” usa
los servicios activos como aproximación y muestra “A convenir” en entrega y
revisiones.

**Necesario:**

- Modelo `Paquete` con `servicioId`, `nivel` (`basico`, `estandar`, `premium`),
  `nombre`, `descripcion`, `precio`, `entrega`, `revisiones`, `imagenUrl`,
  `estado`.
- `GET /api/usuarios/:id/paquetes` para el perfil público.
- `GET/POST/PATCH/DELETE /api/freelancer/paquetes` para el editor.
- Reglas de negocio: máximo un paquete por nivel y servicio, validación de
  precios y moneda.

### 5. Reseñas con cargo o empresa

La UI puede mostrar autor, cargo/empresa, texto, fecha y calificación. La API
actual solo entrega nombre y foto del calificador.

**Necesario:** agregar `cargo` o `empresa` al calificador o a la calificación.
También conviene devolver el total global de reseñas, no solo el total de la
página consultada.

### 6. Iniciar conversación desde el perfil

`POST /api/conversaciones` exige `servicioId` o `proyectoId + freelancerId`. No
acepta únicamente `freelancerId`, por lo que el botón “Contactar” usa el primer
servicio activo del freelancer y se desactiva si no hay ninguno.

**Necesario:** permitir `POST /api/conversaciones` con `{ freelancerId }` para
abrir una conversación directa desde el perfil, o definir un endpoint explícito
de contacto. Mientras no exista, el frontend mantiene la regla actual para no
inventar un endpoint.

### 7. Servicios públicos

`GET /api/usuarios/:id/servicios` exige JWT. Para el perfil público conviene
permitir lectura anónima y devolver solo servicios activos.

## Notas de implementación

- Los campos no soportados no se inventan: se declaran opcionales y se renderizan
  solo cuando llegan desde la API.
- El adaptador `apiPerfilProfesional.ts` concentra el contrato. Cuando el backend
  incorpore paquetes o campos extendidos, solo hay que ajustar los mapeadores y
  los endpoints, sin cambiar la página.
- El portafolio se ordena por `orden` cuando existe; si no, se conserva el orden
  de la respuesta.
- La eliminación de proyectos pide confirmación y muestra un aviso de éxito o
  error.