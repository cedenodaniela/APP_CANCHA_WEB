import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { RUTA_INICIO_SESION } from '../core/interceptor-jwt';
import { Sesion } from '../core/sesion';

/**
 * Pantalla 13 · Tablero (provisional).
 *
 * Por ahora solo confirma que el administrador entró y le permite cerrar sesión (RF-18).
 * El tablero y la agenda semanal se construyen en RF-19.
 */
@Component({
  selector: 'cw-tablero',
  imports: [MatButtonModule, MatIconModule, MatToolbarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-toolbar class="barra">
      <img class="barra__logo" src="logo_canchapp.jpg" alt="" width="780" height="520" />
      <span class="barra__titulo">Panel de administración</span>
      <span class="barra__espacio"></span>
      <span class="barra__usuario">{{ sesion.usuario()?.nombre }}</span>
      <button mat-stroked-button type="button" (click)="cerrarSesion()" data-prueba="cerrar-sesion">
        <mat-icon aria-hidden="true">logout</mat-icon>
        Cerrar sesión
      </button>
    </mat-toolbar>

    <main class="contenido">
      <h1>Tablero</h1>
      <p>Hola, {{ sesion.usuario()?.nombre }}. Esta pantalla se construye en RF-19.</p>
    </main>
  `,
  styles: `
    .barra {
      gap: 16px;
      padding: 0 24px;
      background: var(--cw-superficie);
      border-bottom: 1px solid var(--cw-borde);
    }
    .barra__logo {
      width: auto;
      height: 40px;
    }
    .barra__titulo {
      font: var(--mat-sys-title-medium);
      font-weight: 700;
      color: var(--cw-verde);
    }
    .barra__espacio {
      flex: 1;
    }
    .barra__usuario {
      font: var(--mat-sys-body-large);
      color: var(--cw-texto-suave);
    }
    .contenido {
      padding: 32px 24px;
    }
    h1 {
      margin: 0 0 8px;
      font: var(--mat-sys-headline-medium);
      font-weight: 700;
    }
    p {
      margin: 0;
      color: var(--cw-texto-suave);
    }
  `,
})
export class Tablero {
  protected readonly sesion = inject(Sesion);
  private readonly router = inject(Router);

  /** Termina la sesión (RF-18): se descarta el token y se vuelve al inicio de sesión. */
  protected cerrarSesion(): void {
    this.sesion.cerrar();
    void this.router.navigateByUrl(RUTA_INICIO_SESION);
  }
}
