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
| `apiUrl` | API PHP (`http://localhost/liga-femenil/backend/api`) |
| `aiApiUrl` | Servicio de IA Flask (`http://localhost:5000/api`) |
| `backendUrl` | PHP del backend (`consulta.php`, `registrar.php`, `modificar.php`) |
| `mocks.*` | Por área (`torneo`, `equipos`, `jugadoras`, `entrenadores`, `instagram`, `admin`): `true` usa `src/app/core/mocks/`, `false` usa el backend |

## Estructura
```
src/app/
  core/       modelos, mocks y servicios (torneo, equipos, jugadoras, entrenadores, auth, IA)
  shared/     header, bottom-nav y avatar Ghost Player
  features/   inicio, jornadas, posiciones, comunidad, auth, admin, representante
src/styles/   variables SCSS del sistema de diseño
public/       imágenes, escudos y frames del hero
```

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
