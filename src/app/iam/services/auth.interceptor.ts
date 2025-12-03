import { HttpInterceptorFn } from '@angular/common/http';

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (
    req.url.includes('/authentication') ||
    req.url.startsWith(GEMINI_BASE_URL)
  ) {
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
