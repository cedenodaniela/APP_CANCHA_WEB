/** Roles de la versión 1 (DERCAS §3). Solo `ADMINISTRADOR` entra al panel (RF-18). */
export type Rol = 'CLIENTE' | 'ADMINISTRADOR';

/** Usuario autenticado, tal como lo envía `POST /auth/login` y `GET /auth/sesion`. */
export interface UsuarioSesion {
  id: number;
  nombre: string;
  rol: Rol;
}

/** Respuesta de `POST /api/v1/auth/login`. `expiraEn` es un instante ISO-8601. */
export interface RespuestaLogin {
  token: string;
  expiraEn: string;
  usuario: UsuarioSesion;
}

/** Cuerpo uniforme de los errores del backend (app_cancha/AGENTS.md §6). */
export interface ErrorApi {
  codigo: string;
  mensaje: string;
}
