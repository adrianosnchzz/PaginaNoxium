import { Component } from '@angular/core';


export interface ResumenUnidades {
  alta: number;
  instalada: number; 
  almacen: number;
}

@Component({
  selector: 'app-panel-lateral',
  standalone: true,
  templateUrl: './panel-lateral.html',
  styleUrls: ['./panel-lateral.css']
})
export class PanelLateral {
  
  // Usamos la interfaz
  resumenUnidades: ResumenUnidades = {
    alta: 232,
    instalada: 232, 
    almacen: 8
  };
}