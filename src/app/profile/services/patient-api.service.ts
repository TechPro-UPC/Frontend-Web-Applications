import { Injectable } from '@angular/core';
import { BaseService } from '../../shared/services/base.service';
import { Patient } from '../models/patient.entity';

@Injectable({
    providedIn: 'root'
})
export class PatientApiService extends BaseService<Patient> {
    override resourceEndpoint = '/profiles/patients';

    constructor() {
        super();
    }
}
