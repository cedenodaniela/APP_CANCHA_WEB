import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { SIN_CONEXION } from '../core/errores';
import { interceptorJwt } from '../core/interceptor-jwt';
import { RespuestaLogin, Rol } from '../core/modelos';
import { Sesion } from '../core/sesion';
import { InicioSesion, SIN_PERMISO_PANEL } from './inicio-sesion';

const URL_LOGIN = `${environment.apiUrl}/auth/login`;

function respuesta(rol: Rol): RespuestaLogin {
  return {
    token: 'jwt',
    expiraEn: new Date(Date.now() + 86_400_000).toISOString(),
    usuario: { id: 1, nombre: 'Daniela', rol },
  };
}

/** RF-18 · Pantalla 12, inicio de sesión del panel. */
describe('InicioSesion', () => {
  let fixture: ComponentFixture<InicioSesion>;
  let http: HttpTestingController;
  let sesion: Sesion;
  let router: Router;

  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [InicioSesion],
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([interceptorJwt])),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InicioSesion);
    http = TestBed.inject(HttpTestingController);
    sesion = TestBed.inject(Sesion);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    await fixture.whenStable();
  });

  afterEach(() => http.verify());

  const pantalla = () => fixture.nativeElement as HTMLElement;
  const campo = (nombre: string) => pantalla().querySelector<HTMLInputElement>(`[data-prueba="${nombre}"]`)!;

  async function escribir(nombre: string, valor: string) {
    const input = campo(nombre);
    input.value = valor;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  async function ingresar(email: string, password: string) {
    await escribir('correo', email);
    await escribir('contrasena', password);
    campo('ingresar').click();
    await fixture.whenStable();
  }

  it('dado el formulario vacío, cuando pulsa Ingresar, entonces explica cada campo y no llama al backend', async () => {
    campo('ingresar').click();
    await fixture.whenStable();

    expect(pantalla().textContent).toContain('Ingresa un correo válido.');
    expect(pantalla().textContent).toContain('Ingresa tu contraseña.');
    http.expectNone(URL_LOGIN);
  });

  it('dado un administrador, cuando ingresa, entonces envía el correo normalizado, guarda la sesión y va al tablero', async () => {
    await ingresar('  Admin@CanchApp.local ', 'secreta123');

    const solicitud = http.expectOne(URL_LOGIN);
    expect(solicitud.request.body).toEqual({ email: 'admin@canchapp.local', password: 'secreta123' });
    expect(campo('ingresar').disabled).toBe(true);
    solicitud.flush(respuesta('ADMINISTRADOR'));
    await fixture.whenStable();

    expect(sesion.usuario()?.rol).toBe('ADMINISTRADOR');
    expect(sesion.token()).toBe('jwt');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/tablero');
  });

  it('dado un cliente, cuando ingresa, entonces ve que no tiene permiso y su sesión no se guarda', async () => {
    await ingresar('ana@correo.com', 'secreta123');

    http.expectOne(URL_LOGIN).flush(respuesta('CLIENTE'));
    await fixture.whenStable();

    expect(pantalla().textContent).toContain(SIN_PERMISO_PANEL);
    expect(sesion.usuario()).toBeNull();
    expect(sessionStorage.length).toBe(0);
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(campo('contrasena').value).toBe('');
  });

  it('dado credenciales inválidas, cuando ingresa, entonces muestra el mensaje del backend', async () => {
    await ingresar('admin@canchapp.local', 'mala');

    http
      .expectOne(URL_LOGIN)
      .flush(
        { codigo: 'CREDENCIALES_INVALIDAS', mensaje: 'Correo o contraseña incorrectos.' },
        { status: 401, statusText: 'Unauthorized' },
      );
    await fixture.whenStable();

    expect(pantalla().querySelector('[role="alert"]')?.textContent).toContain('Correo o contraseña incorrectos.');
    expect(campo('ingresar').disabled).toBe(false);
  });

  it('dado que el servidor no responde, cuando ingresa, entonces avisa que no hay conexión', async () => {
    await ingresar('admin@canchapp.local', 'secreta123');

    http.expectOne(URL_LOGIN).error(new ProgressEvent('error'), { status: 0 });
    await fixture.whenStable();

    expect(pantalla().textContent).toContain(SIN_CONEXION);
  });
});
