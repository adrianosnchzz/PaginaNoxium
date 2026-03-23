import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login'; // <-- Cambio 1: Añadido "Component"
import { TablaConcentradores } from './components/tabla-concentradores/tabla-concentradores';

export const routes: Routes = [
  
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
  { path: 'login', component: LoginComponent }, // <-- Cambio 2: Añadido "Component"
  
  { path: 'concentradores', component: TablaConcentradores }
];