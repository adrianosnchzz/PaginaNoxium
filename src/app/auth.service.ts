import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://e-sda.noxium.es/admin-api/generate-token';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { email, password }).pipe(
      tap(res => {
        // Guardamos el token en el navegador
        if (res && res.token) {
          localStorage.setItem('auth_token', res.token);
        }
      })
    );
  }
}