import { Injectable } from '@angular/core';
import { BaseService } from '../../shared/services/base.service';
import { AccountResponse } from './account.reponse';
import { AccountEntity } from '../model/account.entity';
import { AccountAssembler } from './account.assembler';
import { Observable, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {Provider} from '../model/provider.entity';
import { catchError, of, throwError } from 'rxjs';
import {Client} from '../model/client.entity';
export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignUpPayload {
  email: string;
  password: string;
  numColegiado: string;
  type: 'provider' | 'client';

}


export interface AuthenticatedUser {
  id: number;
  email: string;
  token: string;
  type: 'provider' | 'client';
}


export interface UserResource {
  id: number;
  email: string;
  type: string;
}

@Injectable({ providedIn: 'root' })
export class AccountApiService extends BaseService<AccountResponse> {
  override resourceEndpoint = '/accounts';
  private authEndpoint = `${this.serverBaseUrl}/authentication`; // ✅ CORREGIDO

  constructor() {
    super();
  }

  public getAccounts(): Observable<AccountEntity[]> {
    return this.getAll().pipe(
      map(response => AccountAssembler.toEntitiesFromResponse(response))
    );
  }

  public getAccountById(id: number): Observable<AccountEntity> {
    return this.getById(id).pipe(
      map(response => AccountAssembler.toEntityFromResource(response))
    );
  }

  public signIn(payload: SignInPayload): Observable<AuthenticatedUser> {
    return this.http.post<AuthenticatedUser>(`${this.authEndpoint}/sign-in`, payload, this.httpOptions);
  }


  public signUp(payload: SignUpPayload): Observable<UserResource> {
    return this.http.post<UserResource>(`${this.authEndpoint}/sign-up`, payload, this.httpOptions);
  }

  public saveToken(token: string): void {
    localStorage.setItem('jwt_token', token);
  }

  public getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  public logout(): void {
    localStorage.removeItem('jwt_token');
  }

  isProvider(userId: number) {                       // ← devuelve Provider | null
    return this.http.get<Provider>(
      `${this.serverBaseUrl}/providers/user/${userId}`, this.httpOptions
    ).pipe(
      catchError(err =>
        err.status === 404 ? of(null) : throwError(() => err)
      )
    );
  }

  getClient(userId: number) {                        // ← devuelve Client | null
    return this.http.get<Client>(
      `${this.serverBaseUrl}/clients/user/${userId}`, this.httpOptions
    ).pipe(
      catchError(err =>
        err.status === 404 ? of(null) : throwError(() => err)
      )
    );
  }
  public createProvider(numeroColegiado: string, userId: number): Observable<any> {
    const payload = { numeroColegiado, userId };
    return this.http.post(`${this.serverBaseUrl}/providers`, payload);
  }

  public createClient(firstName: string, lastName: string, userId: number): Observable<any> {
    const payload = { firstName, lastName, userId };
    return this.http.post(`${this.serverBaseUrl}/clients`, payload);
  }

  getProviderId(): number | null {
    const id = localStorage.getItem('providerId');
    return id ? parseInt(id, 10) : null;
  }

  getClientId(): number | null {
    const id = localStorage.getItem('clientId');
    return id ? parseInt(id, 10) : null;
  }
}
