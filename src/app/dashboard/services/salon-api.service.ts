import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ProviderProfileResource } from './Salon.response';
import { BaseService } from '../../shared/services/base.service';
import { catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SalonApiService extends BaseService<ProviderProfileResource> {
  private baseUrl = environment.serverBaseUrl;
  private detailsEndpoint = "/profiles/salons";
  override resourceEndpoint = '/profiles/salons';

  constructor() {
    super();
  }

  public getProfileById(id: number) {
    return this.http.get<ProviderProfileResource>(`${this.resourcePath()}/${id}`, this.httpOptions)
      .pipe(
        catchError(error => {
          console.warn('Provider profile not found, suppressing error:', error);
          return of({} as ProviderProfileResource);
        })
      );
  }
}
