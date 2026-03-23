import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface ConcentradorData {
  systemid: string;
  nombre: string;
  numeroserie: string;
  objeto: string;
  imei: string;
  status: number;
  server: string;
  server_backup: string;
  server_fota: string;
}

@Component({
  selector: 'app-tabla-concentradores',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './tabla-concentradores.html',
  styleUrls: ['./tabla-concentradores.css']
})
export class TablaConcentradores implements OnInit { 
  
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef); // El martillo para forzar a Angular a pintar

  todosMarcados: boolean = false;
  textoBusqueda: string = ''; 

  totalPages: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  totalRegistros: number = 0; 

  listaConcentradores: ConcentradorData[] = [];
  cargando: boolean = true; 
        
  ngOnInit() {
    this.cargarDatosDeLaAPI();
  }

  cargarDatosDeLaAPI() {
    
    this.cargando = true;
    this.cdr.detectChanges();

    // Cambiado 'const' por 'let' para poder sumar el filtro
    let url = `https://e-sda.noxium.es/admin-api/device?ambito=lab&page=${this.currentPage}&limit=${this.pageSize}`;

    // AÑADIDO: Si hay texto en el buscador, lo sumamos a la URL
    if (this.textoBusqueda && this.textoBusqueda.trim() !== '') {
      url += `&filter=${this.textoBusqueda}`;
    }

    this.http.get<any>(url).subscribe({
      next: (respuesta) => {
        console.log(`¡Datos de la página ${this.currentPage} &limit=${this.pageSize} recibidos!`, respuesta);
        
        this.listaConcentradores = respuesta.data || [];
        
        this.currentPage = respuesta.currentPage || 1;
        this.totalPages = respuesta.totalPages || 1;
        this.totalRegistros = respuesta.records || 0;
        this.pageSize = respuesta.pageSize || 10;
        
        this.cargando = false; 
        
        // ¡OBLIGAMOS A LA PANTALLA A ACTUALIZARSE!
        this.cdr.detectChanges(); 
      },
      error: (error) => {
        console.error('Error al traer los datos:', error);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cambiarPagina(nuevaPagina: number) {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPages && nuevaPagina !== this.currentPage) {
      this.currentPage = nuevaPagina;
      this.cargarDatosDeLaAPI(); 
    }
  }

  cambiarTamanoPagina() {
    this.currentPage = 1; 
    this.cargarDatosDeLaAPI();
  }

  // AÑADIDO: Función que se lanzará desde el HTML al pulsar Enter
  buscarEnServidor() {
    this.currentPage = 1; 
    this.cargarDatosDeLaAPI();
  }

 
  get concentradoresFiltrados() {
    return this.listaConcentradores;
  }

  alternarTodos(evento: any) {
    this.todosMarcados = evento.target.checked;
  }
}