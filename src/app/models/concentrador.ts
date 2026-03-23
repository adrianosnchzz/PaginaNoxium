import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConcentradoresService {
  private http = inject(HttpClient);
  
  // ¡Aquí está tu URL!
  private apiUrl = 'https://e-sda.noxium.es/admin-api/device/?ambito=lab';

  // Función que hace la llamada GET
  getConcentradores(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}