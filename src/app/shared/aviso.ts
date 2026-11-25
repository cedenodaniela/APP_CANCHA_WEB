import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export type TipoAviso = 'error' | 'exito';

/**
 * Aviso dentro de una pantalla, con icono y texto: un estado nunca se comunica solo con
 * color (app_cancha/AGENTS.md §6). Lo anuncian también los lectores de pantalla.
 */
@Component({
  selector: 'cw-aviso',
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'aviso',
    '[class.aviso--exito]': "tipo() === 'exito'",
    '[attr.role]': "tipo() === 'error' ? 'alert' : 'status'",
  },
  template: `
    <mat-icon aria-hidden="true">{{ icono() }}</mat-icon>
    <span>{{ texto() }}</span>
  `,
  styles: `
    :host {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 12px;
      border: 1px solid var(--cw-rojo);
      border-radius: 12px;
      background: var(--cw-fondo-error);
      color: var(--cw-rojo);
      font: var(--mat-sys-body-medium);
      font-weight: 600;
    }
    :host(.aviso--exito) {
      border-color: var(--cw-verde);
      background: var(--cw-fondo-exito);
      color: var(--cw-verde);
    }
    mat-icon {
      flex: none;
      width: 20px;
      height: 20px;
      font-size: 20px;
    }
  `,
})
export class Aviso {
  readonly texto = input.required<string>();
  readonly tipo = input<TipoAviso>('error');
  protected readonly icono = computed(() => (this.tipo() === 'exito' ? 'check_circle' : 'error'));
}
