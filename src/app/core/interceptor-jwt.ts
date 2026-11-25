import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Sesion } from './sesion';

/** Ruta pública del inicio de sesión del panel (pantalla 12). */
export const RUTA_INICIO_SESION = '/iniciar-sesion';

/**
 * Agrega `Authorization: Bearer` a las solicitudes a la API y, si el backend responde 401
 * a una solicitud con token, cierra la sesión y vuelve al inicio de sesión (RNF-02).
 *
 * El token nunca sale hacia otros dominios: solo se agrega a las URLs de `environment.apiUrl`.
 */
export const interceptorJwt: HttpInterceptorFn = (solicitud, siguiente) => {
  const sesion = inject(Sesion);
  const router = inject(Router);
  const token = sesion.token();
  const haciaLaApi = solicitud.url.startsWith(environment.apiUrl);

  const conToken =
    token && haciaLaApi ? solicitud.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : solicitud;

  return siguiente(conToken).pipe(
    catchError((error: unknown) => {
      if (conToken !== solicitud && error instanceof HttpErrorResponse && error.status === 401) {
        sesion.cerrar();
        void router.navigateByUrl(RUTA_INICIO_SESION);
      }
      return throwError(() => error);
    }),
  );
};
