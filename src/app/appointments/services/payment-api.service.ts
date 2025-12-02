import { Injectable } from '@angular/core';
import { BaseService } from '../../shared/services/base.service';
import { PaymentResponse } from './payment.response';

@Injectable({
  providedIn: 'root'
})
export class PaymentApiService extends BaseService<PaymentResponse> {
  override resourceEndpoint = '/payment-sources';

  constructor() {
    super();
  }

}
