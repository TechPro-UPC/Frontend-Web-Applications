import { Injectable } from '@angular/core';
import { BaseService } from '../../shared/services/base.service';
import { Psychologist } from '../models/psychologist.entity';

@Injectable({
    providedIn: 'root'
})
export class PsychologistApiService extends BaseService<Psychologist> {
    override resourceEndpoint = '/profiles/psychologists';

    constructor() {
        super();
    }
}
