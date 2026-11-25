import { HttpErrorResponse } from '@angular/common/http';
import { ErrorApi } from './modelos';

export const SIN_CONEXION = 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.';
export const ERROR_INESPERADO = 'Ocurrió un error inesperado. Inténtalo de nuevo.';

/**
 * Texto que se muestra ante un error de la API.
 *
 * Siempre se prefiere el `mensaje` del cuerpo `{codigo, mensaje}` del backend; el panel solo
 * tiene textos de respaldo para cuando no hay respuesta o el cuerpo no tiene ese formato.
 */
export function mensajeDe(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return ERROR_INESPERADO;
  }
  if (error.status === 0) {
    return SIN_CONEXION;
  }
  const cuerpo = error.error as Partial<ErrorApi> | null;
  return typeof cuerpo?.mensaje === 'string' && cuerpo.mensaje.trim() ? cuerpo.mensaje : ERROR_INESPERADO;
}
