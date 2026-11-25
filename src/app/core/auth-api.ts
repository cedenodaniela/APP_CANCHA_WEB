import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RespuestaLogin, UsuarioSesion } from './modelos';

/** Endpoints de autenticación del backend, los mismos que usa la app Android (RF-01, RF-18). */
@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/auth`;

  iniciarSesion(email: string, password: string): Observable<RespuestaLogin> {
    return this.http.post<RespuestaLogin>(`${this.base}/login`, { email, password });
  }

  /** Valida el token con el backend: 401 si falta, es inválido o venció. */
  sesion(): Observable<UsuarioSesion> {
    return this.http.get<UsuarioSesion>(`${this.base}/sesion`);
  }
}
