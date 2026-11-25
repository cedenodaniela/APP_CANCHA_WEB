import { Routes } from '@angular/router';
import { guardAdministrador, guardSinSesion } from './core/guard-administrador';

/** Todas las pantallas del panel, salvo el inicio de sesión, exigen un administrador (RF-18). */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tablero' },
  {
    path: 'iniciar-sesion',
    title: 'Inicia sesión · CanchApp',
    canActivate: [guardSinSesion],
    loadComponent: () => import('./auth/inicio-sesion').then((m) => m.InicioSesion),
  },
  {
    path: 'tablero',
    title: 'Tablero · CanchApp',
    canActivate: [guardAdministrador],
    loadComponent: () => import('./tablero/tablero').then((m) => m.Tablero),
  },
  { path: '**', redirectTo: 'tablero' },
];
