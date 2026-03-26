import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NgxDatatableModule, ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import * as XLSX from 'xlsx';

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
  imports: [CommonModule, FormsModule, NgxDatatableModule],
  templateUrl: './tabla-concentradores.html',
  styleUrls: ['./tabla-concentradores.css']
})
export class TablaConcentradores implements OnInit { 
  
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  textoBusqueda: string = ''; 

  totalPages: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  totalRegistros: number = 0; 
  orderBy: string = '';  
  orderDir: string = ''; 
  sorts: any[] = []; 

  listaConcentradores: ConcentradorData[] = [];
  cargando: boolean = true; 

  ColumnMode = ColumnMode;
  SelectionType = SelectionType;
  elementosSeleccionados: ConcentradorData[] = []; 

  // --- VARIABLES DEL MENÚ DE COLUMNAS ---
  mostrarMenuColumnas: boolean = false; 
  
  columnasExportar = [
    { prop: 'systemid', name: 'Id', seleccionada: true },
    { prop: 'nombre', name: 'Nombre', seleccionada: true },
    { prop: 'numeroserie', name: 'NumSerie', seleccionada: true },
    { prop: 'objeto', name: 'Objeto', seleccionada: true },
    { prop: 'imei', name: 'IMEI', seleccionada: true },
    { prop: 'status', name: 'Status', seleccionada: true },
    { prop: 'server', name: 'Server', seleccionada: true },
    { prop: 'server_backup', name: 'ServerRespaldo', seleccionada: true },
    { prop: 'server_fota', name: 'ServerFota', seleccionada: true }
  ];
        
  ngOnInit() {
    this.cargarDatosDeLaAPI();
  }

  // --- FUNCIONES DEL MENÚ DE COLUMNAS ---
  toggleMenuColumnas() {
    this.mostrarMenuColumnas = !this.mostrarMenuColumnas;
  }

  get todasSeleccionadas(): boolean {
    return this.columnasExportar.every(c => c.seleccionada);
  }

 
  toggleTodasColumnas(event: any) {
    const marcado = event.target.checked;
    this.columnasExportar.forEach(c => c.seleccionada = marcado);
  }

  cargarDatosDeLaAPI() {
    this.cargando = true;
    this.cdr.detectChanges();

    let url = `https://e-sda.noxium.es/admin-api/device?ambito=lab&page=${this.currentPage}&limit=${this.pageSize}`;

    if (this.textoBusqueda && this.textoBusqueda.trim() !== '') {
      url += `&filter=${this.textoBusqueda}`;
    }

    if (this.orderBy && this.orderDir) {
      url += `&orderby=${this.orderBy}&order=${this.orderDir}`;
    }

    this.http.get<any>(url).subscribe({
      next: (respuesta) => {
        this.listaConcentradores = [...(respuesta.data || [])];
        this.currentPage = respuesta.currentPage || 1;
        this.totalPages = respuesta.totalPages || 1;
        this.totalRegistros = respuesta.records || 0;
        this.pageSize = respuesta.pageSize || 10;
        
        this.cargando = false; 
        this.cdr.detectChanges(); 
      },
      error: (error) => {
        console.error('Error al traer los datos:', error);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  buscarEnServidor() {
    this.currentPage = 1; 
    this.cargarDatosDeLaAPI();
  }

  setPage(pageInfo: any) {
    this.currentPage = pageInfo.offset + 1;
    this.cargarDatosDeLaAPI();
  }

  cambiarTamanoPagina() {
    this.currentPage = 1; 
    this.cargarDatosDeLaAPI();
  }

  onSort(event: any) {
    const prop = event.column.prop;

    if (this.orderBy === prop) {
      if (this.orderDir === 'asc') {
        this.orderDir = 'desc';
        this.sorts = [{ prop: prop, dir: 'desc' }]; 
      } else if (this.orderDir === 'desc') {
        this.orderBy = '';
        this.orderDir = '';
        this.sorts = []; 
      }
    } else {
      this.orderBy = prop;
      this.orderDir = 'asc';
      this.sorts = [{ prop: prop, dir: 'asc' }]; 
    }

    this.currentPage = 1; 
    this.cargarDatosDeLaAPI();
  }

  onSelect({ selected }: any) {
    this.elementosSeleccionados = [...selected];
  }

  prepararDatosParaExportar() {
    const columnasActivas = this.columnasExportar.filter(c => c.seleccionada);
    
    return this.elementosSeleccionados.map(fila => {
      const filaRecortada: any = {};
      columnasActivas.forEach(col => {
        filaRecortada[col.name] = (fila as any)[col.prop];
      });
      return filaRecortada;
    });
  }

 // --- FUNCIONES DE EXPORTACIÓN ---

  exportarJSON() {
    if (this.elementosSeleccionados.length === 0) return;
    
    
    if (!confirm('¿Estás seguro de que deseas descargar el archivo JSON?')) return;

    const datosFiltrados = this.prepararDatosParaExportar();
    const dataStr = JSON.stringify(datosFiltrados, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'concentradores_seleccionados.json';
    a.click(); 
    window.URL.revokeObjectURL(url); 
    this.mostrarMenuColumnas = false; 
  }

  exportarExcel() {
    if (this.elementosSeleccionados.length === 0) return;
    
    
    if (!confirm('¿Estás seguro de que deseas generar y descargar el archivo EXCEL?')) return;

    const datosFiltrados = this.prepararDatosParaExportar();

    const worksheet = XLSX.utils.json_to_sheet(datosFiltrados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Concentradores');
    
    XLSX.writeFile(workbook, 'concentradores_seleccionados.xlsx');
    this.mostrarMenuColumnas = false; 
  }

  exportarCSV() {
    if (this.elementosSeleccionados.length === 0) return;
    
   
    if (!confirm('¿Estás seguro de que deseas descargar el archivo CSV?')) return;

    const datosFiltrados = this.prepararDatosParaExportar();

    const worksheet = XLSX.utils.json_to_sheet(datosFiltrados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Concentradores');
    
    XLSX.writeFile(workbook, 'concentradores_seleccionados.csv');
    this.mostrarMenuColumnas = false; 
  }
}