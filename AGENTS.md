# AGENTS.md — CanchApp · Panel web (APP_CANCHA_WEB)

Panel de administración del proyecto CanchApp, en **Angular standalone + Angular Material**. Esta es la guía **breve** de este repositorio.

> **La guía completa vive fuera de este repositorio**, en la carpeta de trabajo, un nivel arriba:
> [`../AGENTS.md`](../AGENTS.md) · DERCAS: [`../DERCAS_CanchApp.pdf`](../DERCAS_CanchApp.pdf) · plan: [`../docs/PLANIFICACION.md`](../docs/PLANIFICACION.md).
>
> Si este archivo y la guía completa se contradicen, manda la guía completa y, sobre todo, el **DERCAS**.

## Qué se construye aquí

La gestión del complejo **desde el navegador**, solo para el rol `ADMINISTRADOR`: **RF-18 a RF-23** (pantallas 12 a 17). El panel no reemplaza a la app Android: el pago en efectivo y la operación diaria en el complejo siguen en el celular.

```
src/app/
├── core/            # sesión, interceptor JWT, guard de rol, errores de la API, servicios HTTP y WebSocket
├── auth/            # inicio de sesión del panel (pantalla 12)
├── tablero/         # tablero y agenda semanal (pantalla 13)
├── comprobantes/    # verificación (pantalla 14)
├── canchas/         # canchas, tarifas y bloqueos (pantalla 15)
├── configuracion/   # complejo, políticas y administradores (pantalla 16)
├── reportes/        # indicadores y exportación CSV (pantalla 17)
└── shared/          # tabla, paginador, aviso, pipes de fecha y estado
```

## Reglas que no se rompen

- **La UI no calcula reglas de negocio.** Totales, plazos, límites y estados llegan resueltos desde la API. Si falta un dato derivado, se agrega al DTO del backend.
- Se muestra el `mensaje` de los errores `{codigo, mensaje}` del backend (`core/errores.ts`); el panel solo tiene textos de respaldo.
- Ninguna pantalla se muestra antes de validar la sesión y el rol `ADMINISTRADOR` (`core/guard-administrador.ts`).
- Estados con **texto y color**. Paleta en `src/styles.scss` (`--cw-verde`, `--cw-azul`, `--cw-naranja`, `--cw-rojo`, `--cw-fondo`), la misma de la app.
- Fechas con `Intl.DateTimeFormat` y `timeZone: 'America/Guayaquil'`, nunca la zona del navegador.
- Tablas paginadas, con orden y filtros. Responsive desde 1280 × 720 (RNF-11).
- Confirmación explícita antes de acciones destructivas. El CSV lo genera el backend.
- La interfaz dice **«tablero»**, nunca «dashboard». Textos en español.

## Comandos

```bash
npm install
npm start              # http://localhost:4200, contra el backend en http://localhost:8080
npm test               # pruebas unitarias (Vitest)
npm run lint
npm run build
```

La dirección de la API está en `src/environments/`: el backend local en desarrollo y `/api/v1` del mismo dominio en producción.

## Git

Ramas `main`, `calidad` y `desarrollo`. Cada RF va en `feature/RF-XX_nombre-breve` desde `desarrollo` y vuelve por Pull Request (`../docs/PLANIFICACION.md` §12). Antes de cada commit: `npm test && npm run lint` en verde. Los issues viven en `APP_CANCHA_BACKEND`: un PR de aquí cierra con `Closes cedenodaniela/APP_CANCHA_BACKEND#n`.

## Seguridad

El JWT se guarda solo en `sessionStorage` y se descarta al cerrar sesión o al recibir un 401. **Nunca** subas archivos `.env` ni claves.
