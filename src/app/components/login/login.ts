import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  correo: string = '';
  contrasena: string = '';
  mensajeError: string = '';
  cargando: boolean = false;
  mostrarContrasena: boolean = false; 

  private authService = inject(AuthService);
  private router = inject(Router);

  entrar() {
    this.mensajeError = '';

    if (!this.correo || !this.contrasena) {
      this.mensajeError = 'Por favor, rellena todos los campos';
      return;
    }

    this.cargando = true;

    this.authService.login(this.correo, this.contrasena).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate(['/concentradores']);
      },
      error: () => {
        this.cargando = false;
        this.mensajeError = 'Correo o contraseña incorrectos'; 
      }
    });
  }
}