import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { PanelLateral } from './components/panel-lateral/panel-lateral'; 


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, PanelLateral  ], 
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  constructor(public router: Router) {}

  mostrarMenu(): boolean {
    return this.router.url !== '/login' && this.router.url !== '/';
  }
}