import { Injectable } from '@angular/core';
import { BaseService } from '../../shared/services/base.service';
import { Patient } from '../models/patient.entity';
import { catchError, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class PatientApiService extends BaseService<Patient> {
    override resourceEndpoint = '/profiles/patients';

    constructor() {
        super();
    }

    getPatientByUserId(userId: number) {
        return this.http.get<Patient>(`${this.serverBaseUrl}/patients/user/${userId}`, this.httpOptions)
            .pipe(
                catchError(() => {
                    // Fallback: Fetch all patients and filter by userId
                    return this.getAll().pipe(
                        map((patients: Patient[]) => {
                            const patient = patients.find((p: Patient) => p.userId === userId);
                            if (!patient) throw new Error('Patient not found');
                            return patient;
                        })
                    );
                })
            );
    }
}
