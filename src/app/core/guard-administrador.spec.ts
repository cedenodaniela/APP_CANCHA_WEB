import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { firstValueFrom, isObservable, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { guardAdministrador, guardSinSesion } from './guard-administrador';
import { interceptorJwt } from './interceptor-jwt';
import { Rol } from './modelos';
import { Sesion } from './sesion';

const URL_SESION = `${environment.apiUrl}/auth/sesion`;

/** RF-18 · Ninguna pantalla del panel se muestra sin una sesión de administrador válida. */
describe('guardAdministrador', () => {
  let http: HttpTestingController;
  let sesion: Sesion;
  let router: Router;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([interceptorJwt])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    sesion = TestBed.inject(Sesion);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
  });

  afterEach(() => http.verify());

  function iniciar(rol: Rol, venceEnMs = 86_400_000) {
    sesion.guardar({
      token: 'jwt',
      expiraEn: new Date(Date.now() + venceEnMs).toISOString(),
      usuario: { id: 1, nombre: 'Daniela', rol },
    });
  }

  function ejecutar(guard: typeof guardAdministrador) {
    return TestBed.runInInjectionContext(() =>
      guard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    ) as boolean | UrlTree | Observable<boolean | UrlTree>;
  }

  const esInicioSesion = (resultado: unknown) =>
    resultado instanceof UrlTree && router.serializeUrl(resultado) === '/iniciar-sesion';

  it('dado que no hay sesión, cuando abre el tablero, entonces va al inicio de sesión sin llamar al backend', () => {
    expect(esInicioSesion(ejecutar(guardAdministrador))).toBe(true);
    http.expectNone(URL_SESION);
  });

  it('dado una sesión vencida, cuando abre el tablero, entonces va al inicio de sesión', () => {
    iniciar('ADMINISTRADOR', -1000);

    expect(esInicioSesion(ejecutar(guardAdministrador))).toBe(true);
  });

  it('dado una sesión de cliente, cuando abre el tablero, entonces va al inicio de sesión', () => {
    iniciar('CLIENTE');

    expect(esInicioSesion(ejecutar(guardAdministrador))).toBe(true);
  });

  it('dado un administrador con token válido, cuando abre el tablero, entonces lo valida con el backend y entra', async () => {
    iniciar('ADMINISTRADOR');

    const resultado = ejecutar(guardAdministrador);
    expect(isObservable(resultado)).toBe(true);
    const pendiente = firstValueFrom(resultado as Observable<boolean | UrlTree>);
    const solicitud = http.expectOne(URL_SESION);
    expect(solicitud.request.headers.get('Authorization')).toBe('Bearer jwt');
    solicitud.flush({ id: 1, nombre: 'Daniela', rol: 'ADMINISTRADOR' });

    expect(await pendiente).toBe(true);
  });

  it('dado un token que el backend rechaza, cuando abre el tablero, entonces cierra la sesión y va al inicio de sesión', async () => {
    iniciar('ADMINISTRADOR');

    const pendiente = firstValueFrom(ejecutar(guardAdministrador) as Observable<boolean | UrlTree>);
    http
      .expectOne(URL_SESION)
      .flush({ codigo: 'NO_AUTENTICADO', mensaje: 'Debes iniciar sesión para continuar.' }, { status: 401, statusText: 'Unauthorized' });

    expect(esInicioSesion(await pendiente)).toBe(true);
    expect(sesion.usuario()).toBeNull();
    expect(sessionStorage.length).toBe(0);
  });

  it('dado un administrador con sesión, cuando abre el inicio de sesión, entonces va al tablero', () => {
    iniciar('ADMINISTRADOR');

    const resultado = ejecutar(guardSinSesion);

    expect(resultado instanceof UrlTree && router.serializeUrl(resultado)).toBe('/tablero');
  });

  it('dado una solicitud a otro dominio, cuando sale, entonces no lleva el token', () => {
    iniciar('ADMINISTRADOR');

    TestBed.inject(HttpClient).get('https://otro.ejemplo.com/datos').subscribe();

    expect(http.expectOne('https://otro.ejemplo.com/datos').request.headers.has('Authorization')).toBe(false);
  });
});
