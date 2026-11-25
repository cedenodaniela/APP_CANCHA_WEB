import { computed, Injectable, signal } from '@angular/core';
import { RespuestaLogin, UsuarioSesion } from './modelos';

const CLAVE = 'canchapp.sesion';

/**
 * Sesión del administrador en el panel (RF-18).
 *
 * Es la misma sesión de RF-01: el JWT que entrega el backend, que vence a las 24 horas
 * (RNF-02). Se guarda en `sessionStorage`, así que termina al cerrar sesión o al cerrar la
 * pestaña. El vencimiento lo decide el backend (`expiraEn`); aquí solo se respeta.
 */
@Injectable({ providedIn: 'root' })
export class Sesion {
  private readonly actual = signal<RespuestaLogin | null>(leer());

  /** Usuario de la sesión vigente, o `null` si no hay sesión o ya venció. */
  readonly usuario = computed<UsuarioSesion | null>(() => {
    const sesion = this.actual();
    return sesion && vigente(sesion) ? sesion.usuario : null;
  });

  /** JWT para `Authorization: Bearer`, o `null` si no hay sesión vigente. */
  token(): string | null {
    const sesion = this.actual();
    return sesion && vigente(sesion) ? sesion.token : null;
  }

  guardar(respuesta: RespuestaLogin): void {
    this.actual.set(respuesta);
    try {
      sessionStorage.setItem(CLAVE, JSON.stringify(respuesta));
    } catch {
      // Sin almacenamiento (modo privado estricto) la sesión dura mientras la página esté abierta.
    }
  }

  cerrar(): void {
    this.actual.set(null);
    try {
      sessionStorage.removeItem(CLAVE);
    } catch {
      // Nada que borrar.
    }
  }
}

function vigente(sesion: RespuestaLogin): boolean {
  return Date.parse(sesion.expiraEn) > Date.now();
}

function leer(): RespuestaLogin | null {
  try {
    const texto = sessionStorage.getItem(CLAVE);
    return texto ? (JSON.parse(texto) as RespuestaLogin) : null;
  } catch {
    return null;
  }
}
