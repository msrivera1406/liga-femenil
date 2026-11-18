# Frontend - Liga Femenil

Aplicación Angular 22 (componentes standalone, TypeScript estricto, mobile-first). Detalles del proyecto en [`../proyecto-detalle.md`](../proyecto-detalle.md).

## Requisitos
* Node.js y npm (ver `packageManager` en `package.json`).

## Comandos
```bash
npm install
npm start        # ng serve en http://localhost:4200/
npm run build    # compila en dist/
npm test         # pruebas con Vitest
```

## Configuración
`src/environments/environment.ts`:

| Variable | Descripción |
|---|---|
| `apiUrl` | Endpoint de Instagram (`http://localhost/liga-femenil/backend/api`) |
| `aiApiUrl` | Servicio de IA Flask (`http://localhost:5000/api`) |
| `backendUrl` | PHP del backend (`auth.php`, `consulta.php`, `registrar.php`, `modificar.php`, `subir_imagen.php`) |
| `mocks.instagram` | `true` muestra las publicaciones de muestra de `src/app/core/mocks/instagram.mock.ts` |

## Estructura
```
src/app/
  core/       modelos, servicios (backend PHP, auth, IA), guards e interceptores
  shared/     header, bottom-nav y avatar Ghost Player
  features/   inicio, jornadas, posiciones, comunidad, auth, admin, representante
src/styles/   variables SCSS del sistema de diseño
public/       imágenes, escudos, videos de equipos (`videos/`) y frames del hero
```

Toda la comunicación con el backend pasa por `core/services/backend-api.service.ts`, y `backend.mappers.ts` traduce sus respuestas a los modelos. El contrato completo está en la sección 8 de `proyecto-detalle.md`.

Para que un equipo muestre su video en comunidad, coloca el archivo en `public/videos/` y guarda su ruta (ej. `/videos/good_vibes.mp4`) en el `video_url` del equipo.

## Rutas
`/inicio`, `/jornadas`, `/posiciones`, `/comunidad`, `/login`, `/admin` (Directora) y `/representante` (capitana).

## Inicio de sesión
El login usa `backend/auth.php` con sesión de PHP (cookie `HttpOnly`). `/admin` y `/representante` están protegidas por rol y el backend vuelve a validar el rol en cada escritura.

Credenciales de demostración (cámbialas antes de publicar):

| Rol | Correo | Contraseña |
|---|---|---|
| Directora | `admin@ligafemenil.mx` | `Directora2026!` |
| Capitana (ej. Queer Goals) | `capitana.queergoals@ligafemenil.mx` | `Capitana2026!` |

Las 11 capitanas siguen el formato `capitana.<equipo>@ligafemenil.mx` (ver tabla `usuarios`). Para cambiar una contraseña:
```bash
/opt/lampp/bin/php database/cambiar_password.php correo@ligafemenil.mx
```
