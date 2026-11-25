import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Raíz del panel: solo aloja la ruta activa. */
@Component({
  imports: [RouterOutlet],
  selector: 'cw-root',
  templateUrl: './app.html',
})
export class App {}
