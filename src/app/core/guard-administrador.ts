import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthApi } from './auth-api';
import { RUTA_INICIO_SESION } from './interceptor-jwt';
import { Sesion } from './sesion';

/** Primera pantalla del administrador después de iniciar sesión (pantalla 13, RF-19). */
export const RUTA_TABLERO = '/tablero';

/**
 * Protege las pantallas del panel (RF-18, RNF-12).
 *
 * Ninguna se muestra antes de validar la sesión: además de revisar la sesión guardada,
 * pregunta al backend (`GET /auth/sesion`) si el token sigue siendo válido y si su rol es
 * `ADMINISTRADOR`. Si no, cierra la sesión y lleva al inicio de sesión.
 */
export const guardAdministrador: CanActivateFn = () => {
  const sesion = inject(Sesion);
  const auth = inject(AuthApi);
  const router = inject(Router);
  const alInicioSesion = () => {
    sesion.cerrar();
    return router.parseUrl(RUTA_INICIO_SESION);
  };

  if (sesion.usuario()?.rol !== 'ADMINISTRADOR') {
    return alInicioSesion();
  }
  return auth.sesion().pipe(
    map((usuario) => (usuario.rol === 'ADMINISTRADOR' ? true : alInicioSesion())),
    catchError(() => of(alInicioSesion())),
  );
};

/** El inicio de sesión no se muestra a un administrador que ya tiene sesión. */
export const guardSinSesion: CanActivateFn = () => {
  const sesion = inject(Sesion);
  return sesion.usuario()?.rol === 'ADMINISTRADOR' ? inject(Router).parseUrl(RUTA_TABLERO) : true;
};
