import { Injectable } from '@angular/core';
import { BaseService } from '../../shared/services/base.service';
import { PaymentSourceResponse } from './payment-source.response';

@Injectable({
    providedIn: 'root'
})
export class PaymentSourceApiService extends BaseService<PaymentSourceResponse> {
    override resourceEndpoint = '/payment-sources';

    constructor() {
        super();
    }
}
