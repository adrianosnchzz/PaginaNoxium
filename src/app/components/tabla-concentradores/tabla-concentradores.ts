import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NgxDatatableModule, ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import * as XLSX from 'xlsx';
import { Router } from '@angular/router';

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
  private router = inject(Router);

  textoBusqueda: string = '';
  temporizadorBusqueda: any;
  ambitoSeleccionado: string = 'lab';

  modoImportacion: boolean = false;
  idsImportados: string[] = [];

  dialogoImportacion: { visible: boolean; total: number; ids: string[] } = {
    visible: false, total: 0, ids: []
  };

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

  mostrarMenuAmbito: boolean = false;
  mostrarMenuPaginas: boolean = false;
  mostrarMenuColumnas: boolean = false;
  mostrarMenuJson: boolean = false;
  mostrarMenuCsv: boolean = false;

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

  cerrarSesion() {
    this.router.navigate(['/login']);
  }

 recargarDatos() {
  clearTimeout(this.temporizadorBusqueda);
  this.textoBusqueda = '';
  this.modoImportacion = false;
  this.idsImportados = [];
  this.currentPage = 1;
  this.pageSize = 10;
  this.orderBy = '';
  this.orderDir = '';
  this.sorts = [];
  this.elementosSeleccionados = [];

  
  this.cargarDatosDeLaAPI();
}

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

  cambiarAmbito(nuevoAmbito: string) {
    this.ambitoSeleccionado = nuevoAmbito;
    this.mostrarMenuAmbito = false;
    this.modoImportacion = false;
    this.idsImportados = [];
    this.currentPage = 1;
    this.cargarDatosDeLaAPI();
  }

  cambiarTamanoPagina(nuevoTamano: number) {
    this.pageSize = nuevoTamano;
    this.mostrarMenuPaginas = false;
    this.modoImportacion = false;
    this.idsImportados = [];
    this.currentPage = 1;
    this.cargarDatosDeLaAPI();
  }

  alEscribirBusqueda() {
    clearTimeout(this.temporizadorBusqueda);
    this.temporizadorBusqueda = setTimeout(() => {
      this.modoImportacion = false;
      this.idsImportados = [];
      this.currentPage = 1;
      this.cargarDatosDeLaAPI();
    }, 500);
  }

  quitarFiltro() {
    this.modoImportacion = false;
    this.idsImportados = [];
    this.currentPage = 1;
    this.pageSize = 10;
    this.elementosSeleccionados = [];
    this.cargarDatosDeLaAPI();
  }

  importarJson(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const contenido = JSON.parse(e.target.result);

        if (Array.isArray(contenido) && contenido.length > 0) {
          this.dialogoImportacion = { visible: true, total: contenido.length, ids: contenido };
          this.cdr.detectChanges();
        } else {
          alert('El archivo JSON debe ser un array de IDs (ej: ["ID1", "ID2"]).');
        }
      } catch (error) {
        alert('Error al leer el archivo JSON.');
      }
      event.target.value = '';
    };
    reader.readAsText(file);
  }

  cancelarImportacion() {
    this.dialogoImportacion = { visible: false, total: 0, ids: [] };
  }

  confirmarImportacion() {
    this.idsImportados = this.dialogoImportacion.ids;
    this.modoImportacion = true;
    this.pageSize = 500;
    this.currentPage = 1;
    this.textoBusqueda = '';      
    this.orderBy = '';            
    this.orderDir = '';
    this.sorts = [];
    this.elementosSeleccionados = []; 
    this.dialogoImportacion = { visible: false, total: 0, ids: [] };
    this.cargarDatosDeLaAPI();
  }

  cargarDatosDeLaAPI() {
    this.cargando = true;
    this.cdr.detectChanges();

    let url = `https://e-sda.noxium.es/admin-api/device?ambito=${this.ambitoSeleccionado}&page=${this.currentPage}&limit=${this.pageSize}`;

    if (this.modoImportacion && this.idsImportados.length > 0) {
      url += `&list=true&systemids=${encodeURIComponent(JSON.stringify(this.idsImportados))}`;
    } else {
      if (this.textoBusqueda && this.textoBusqueda.trim() !== '') {
        url += `&filter=${this.textoBusqueda}`;
      }

      if (this.orderBy && this.orderDir) {
        url += `&orderby=${this.orderBy}&order=${this.orderDir}`;
      }
    }

    this.http.get<any>(url).subscribe({
      next: (respuesta) => {
        this.listaConcentradores = [...(respuesta.data || [])];
        this.currentPage = respuesta.currentPage || 1;
        this.totalPages = respuesta.totalPages || 1;
        this.totalRegistros = respuesta.records || 0;
        this.pageSize = respuesta.pageSize || (this.modoImportacion ? 500 : 10);

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

  setPage(pageInfo: any) {
    this.currentPage = pageInfo.offset + 1;
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

  private generarDescargaJSON(datos: any, nombreArchivo: string) {
    const dataStr = JSON.stringify(datos, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    a.click();
    window.URL.revokeObjectURL(url);
    this.mostrarMenuJson = false;
  }

  exportarJsonAmbitos() {
    if (!confirm('¿Descargar JSON (Formato Ámbitos SDM)?')) return;

    const formato = {
      records: this.elementosSeleccionados.length,
      type: "ambitos",
      key: "EMASA",
      data: this.elementosSeleccionados.map(fila => fila.systemid),
      success: true,
      msg: `Total ${this.elementosSeleccionados.length} rows`
    };

    this.generarDescargaJSON(formato, 'importacion_a_ambitos_sdm.json');
  }

  exportarJsonAPI() {
    if (!confirm('¿Descargar JSON (Formato API)?')) return;

    const formato = this.elementosSeleccionados.map(fila => ({
      READING_PERIOD: "00:10",
      READING_PERIOD_B: "00:00",
      SENDING_PERIOD: "01:00",
      READING_PERIOD_Z: "00:10",
      SENDING_PERIOD_Z: "03:00",
      RESENDING_PERIOD: "00:05",
      DEVICE_ID: fila.systemid,
      OID_CLASS: fila.objeto || "15303",
      SERIAL_NUMBER: fila.numeroserie,
      HOST1: fila.server || "iot.noxium.es:8093",
      HOST2: fila.server_backup || "iot.noxium.es:8092",
      HOST3: fila.server_fota || "iot.noxium.es:8093",
      IMEI: fila.imei,
      PROFILE: { ND: 0 }
    }));

    this.generarDescargaJSON(formato, 'importacion_a_api.json');
  }

  exportarJsonSDM() {
    if (!confirm('¿Descargar JSON (Formato SDM)?')) return;

    const formato = {
      records: this.elementosSeleccionados.length,
      data: this.elementosSeleccionados.map(fila => ({
        READING_PERIOD: "00:10",
        READING_PERIOD_B: "00:00",
        SENDING_PERIOD: "01:00",
        READING_PERIOD_Z: "00:10",
        SENDING_PERIOD_Z: "03:00",
        RESENDING_PERIOD: "00:05",
        DEVICE_ID: fila.systemid,
        OID_CLASS: fila.objeto || "15303",
        SERIAL_NUMBER: fila.numeroserie,
        HOST1: fila.server || "iot.noxium.es:8093",
        HOST2: fila.server_backup || "iot.noxium.es:8092",
        HOST3: fila.server_fota || "iot.noxium.es:8093",
        IMEI: fila.imei
      }))
    };

    this.generarDescargaJSON(formato, 'importacion_a_sdm.json');
  }

  private generarDescargaCSV(datos: any[], nombreArchivo: string) {
    const worksheet = XLSX.utils.json_to_sheet(datos);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, nombreArchivo);
    this.mostrarMenuCsv = false;
  }

  exportarCsvFota() {
    if (!confirm('¿Descargar CSV (Formato Devices FOTA)?')) return;

    const formato = this.elementosSeleccionados.map((fila, i) => ({
      code: `DD0000000${1000 + i}`,
      type: 1,
      description: "",
      status: "enabled",
      name: fila.systemid,
      device_id: fila.systemid,
      serial_number: fila.numeroserie,
      metadata: "{}",
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      client_id: 6
    }));

    this.generarDescargaCSV(formato, 'importacion_devices_fota.csv');
  }

  exportarCsvSda() {
    if (!confirm('¿Descargar CSV (Formato Devices SDA)?')) return;

    const formato = this.elementosSeleccionados.map((fila, i) => ({
      code: `DD0000000${1000 + i}`,
      type: 1,
      description: "",
      status: "disabled",
      name: fila.systemid,
      device_id: fila.systemid,
      serial_number: fila.numeroserie,
      metadata: "{}",
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      client_id: 1
    }));

    this.generarDescargaCSV(formato, 'importacion_devices_sda.csv');
  }

  exportarCsvSdaGeoblau() {
    if (!confirm('¿Descargar CSV (Formato Devices SDA Geoblau)?')) return;

    const formato = this.elementosSeleccionados.map((fila, i) => ({
      code: `DD0000000${1000 + i}`,
      type: 1,
      description: "",
      status: "disabled",
      situation: "test",
      location: "warehouse",
      name: fila.systemid,
      device_id: fila.systemid,
      serial_number: fila.numeroserie,
      metadata: "{}",
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      client_id: 1
    }));

    this.generarDescargaCSV(formato, 'importacion_devices_sda_geoblau.csv');
  }
}