import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { inject } from '@angular/core';
import { catchError, Observable, retry, throwError } from 'rxjs';

export abstract class BaseService<R> {
  protected httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  protected serverBaseUrl: string = environment.serverBaseUrl;
  public resourceEndpoint: string = '/resources';
  protected http: HttpClient = inject(HttpClient);

  protected handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error);
    if (error.error) {
      console.error('Backend error body:', JSON.stringify(error.error));
    }
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }

  public resourcePath(): string {
    return `${this.serverBaseUrl}${this.resourceEndpoint}`;
  }

  public getAll(): Observable<R[]> {
    return this.http.get<R[]>(this.resourcePath(), this.httpOptions).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  public create(id: any, resource: R): Observable<R> {
    return this.http.post<R>(`${this.resourcePath()}/${id}`, JSON.stringify(resource), this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
  }

  public post(resource: R): Observable<R> {
    return this.http.post<R>(`${this.resourcePath()}`, JSON.stringify(resource), this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
  }

  public getById(id: any): Observable<R> {
    return this.http.get<R>(`${this.resourcePath()}/${id}`, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  public delete(id: any): Observable<any> {

    return this.http.delete(`${this.resourcePath()}/${id}`, this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
  }

  public update(id: any, resource: R): Observable<R> {
    return this.http.put<R>(`${this.resourcePath()}/${id}`, JSON.stringify(resource), this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
  }

  public partialUpdate(id: any, partialResource: Partial<R>): Observable<R> {
    return this.http.patch<R>(`${this.resourcePath()}/${id}`, JSON.stringify(partialResource), this.httpOptions)
      .pipe(retry(2), catchError(this.handleError));
  }

}
