import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { AuthApi } from '../core/auth-api';
import { mensajeDe } from '../core/errores';
import { RUTA_TABLERO } from '../core/guard-administrador';
import { Sesion } from '../core/sesion';
import { Aviso } from '../shared/aviso';

/** Texto del criterio de aceptación de RF-18 para una cuenta que no es de administrador. */
export const SIN_PERMISO_PANEL = 'No tienes permiso para acceder al panel.';

/** Mismo formato de correo que valida la app Android: ayuda de escritura, no una regla. */
const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Pantalla 12 · Inicio de sesión del panel web (RF-18, CU-20).
 *
 * Usa las mismas cuentas y el mismo `POST /auth/login` de RF-01. Solo una cuenta con rol
 * `ADMINISTRADOR` guarda la sesión y entra al tablero; a un cliente se le explica que no
 * tiene permiso y su token se descarta sin guardarse.
 */
@Component({
  selector: 'cw-inicio-sesion',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    Aviso,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './inicio-sesion.html',
  styleUrl: './inicio-sesion.scss',
})
export class InicioSesion {
  private readonly auth = inject(AuthApi);
  private readonly sesion = inject(Sesion);
  private readonly router = inject(Router);

  protected readonly formulario = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.pattern(FORMATO_CORREO)]],
    password: ['', Validators.required],
  });

  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly passwordVisible = signal(false);

  constructor() {
    // El aviso de error desaparece en cuanto la persona corrige algo.
    this.formulario.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.error.set(null));
  }

  protected alternarPassword(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  protected ingresar(): void {
    if (this.cargando()) {
      return;
    }
    this.formulario.controls.email.setValue(this.formulario.controls.email.value.trim().toLowerCase());
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const { email, password } = this.formulario.getRawValue();
    this.cargando.set(true);
    this.formulario.disable({ emitEvent: false });

    this.auth.iniciarSesion(email, password).subscribe({
      next: (respuesta) => {
        if (respuesta.usuario.rol !== 'ADMINISTRADOR') {
          this.fallar(SIN_PERMISO_PANEL);
          return;
        }
        this.sesion.guardar(respuesta);
        void this.router.navigateByUrl(RUTA_TABLERO);
      },
      error: (error: unknown) => this.fallar(mensajeDe(error)),
    });
  }

  private fallar(mensaje: string): void {
    this.cargando.set(false);
    this.formulario.enable({ emitEvent: false });
    this.formulario.controls.password.reset('', { emitEvent: false });
    this.error.set(mensaje);
  }
}
