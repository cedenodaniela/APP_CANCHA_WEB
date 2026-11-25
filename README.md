# CanchApp · Panel web

Panel de administración del sistema de reservas del **Complejo Deportivo Calceta** (Calceta, Manabí, Ecuador).

Angular standalone · Angular Material (Material 3) · TypeScript · Vitest.

Este repositorio contiene **solo el panel web** del administrador. La API vive en [`APP_CANCHA_BACKEND`](https://github.com/cedenodaniela/APP_CANCHA_BACKEND) y la app Android en [`APP_CANCHA_MOVIL`](https://github.com/cedenodaniela/APP_CANCHA_MOVIL).

## Documentación

La documentación general del proyecto **no vive aquí**: está en la carpeta de trabajo `app_cancha/`, un nivel arriba.

| Documento | Ruta |
|---|---|
| Guía para agentes y convenciones | `../AGENTS.md` |
| DERCAS (fuente de verdad) | `../DERCAS_CanchApp.pdf` |
| Planificación de las 5 iteraciones | `../docs/PLANIFICACION.md` |

## Requisitos

- Node.js 22 o superior y npm.
- El backend corriendo en `http://localhost:8080` (ver el README de `APP_CANCHA_BACKEND`).

## Puesta en marcha

```bash
npm install
npm start          # http://localhost:4200
```

Solo entran cuentas con rol `ADMINISTRADOR`. La primera la crea el backend al arrancar, con las variables `CANCHAPP_ADMIN_*` de su `.env`.

## Pruebas y calidad

```bash
npm test
npm run lint
npm run build
```

## Flujo de trabajo

Ramas fijas `main`, `calidad` y `desarrollo`. Cada RF va en su rama `feature/RF-XX_nombre-breve`, creada desde `desarrollo`, y vuelve por Pull Request. Los issues se gestionan en `APP_CANCHA_BACKEND`. Ver `../AGENTS.md` §12 y `../docs/PLANIFICACION.md` §12.
