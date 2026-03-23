import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Buscamos el token que guardamos al hacer login
  const token = localStorage.getItem('auth_token');

  // 2. Si hay token, clonamos la petición y le pegamos la cabecera de Autorización
  if (token) {
    const peticionConToken = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}` // Laravel suele pedir que pongas la palabra "Bearer" delante
      }
    });
    // Mandamos la petición modificada al servidor
    return next(peticionConToken);
  }

  return next(req);
};