import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 🚫 No adjuntar token en login/registro
  if (req.url.includes('/authentication')) {
    console.log('🚫 Skipping auth for:', req.url);
    return next(req);
  }
  console.log('🔐 Adding auth for:', req.url);

  const token = localStorage.getItem('jwt_token');

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};
