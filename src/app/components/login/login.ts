import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html' // Conectado a tu HTML
})
export class LoginComponent { // ESTE es el nombre que vamos a exportar
  
  // Variables mapeadas a tu HTML
  correo: string = '';
  contrasena: string = '';
  mensajeError: string = '';
  cargando: boolean = false;

  private authService = inject(AuthService);
  private router = inject(Router);

  entrar() {
    if (!this.correo || !this.contrasena) {
      this.mensajeError = 'Por favor, rellena todos los campos';
      return;
    }

    this.cargando = true;
    
    // OJO: Le pasamos 'correo' y 'contrasena' al servicio
    this.authService.login(this.correo, this.contrasena).subscribe({
      next: (res) => {
        console.log('¡Login exitoso!', res);
        this.cargando = false;
        // Cambia la ruta si tu tabla se llama distinto
        this.router.navigate(['/concentradores']); 
      },
      error: (err) => {
        console.error('Error de login:', err);
        this.cargando = false;
        this.mensajeError = 'Credenciales incorrectas';
      }
    });
  }
}