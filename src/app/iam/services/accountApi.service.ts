import { Injectable } from '@angular/core';
import { BaseService } from '../../shared/services/base.service';
import { AccountResponse } from './account.reponse';
import { AccountEntity } from '../model/account.entity';
import { AccountAssembler } from './account.assembler';
import { Observable, map } from 'rxjs';

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignUpPayload {
  email: string;
  password: string;
  role: 'PATIENT' | 'PSYCHOLOGIST';
}

export interface AuthenticatedUser {
  id: number;
  email: string;
  token: string;
  role: 'PATIENT' | 'PSYCHOLOGIST';
}

export interface UserResource {
  id: number;
  email: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AccountApiService extends BaseService<AccountResponse> {
  override resourceEndpoint = '/users';
  private authEndpoint = `${this.serverBaseUrl}/authentication`;

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
}
