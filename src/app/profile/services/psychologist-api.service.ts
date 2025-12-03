import { Injectable } from '@angular/core';
import { BaseService } from '../../shared/services/base.service';
import { Psychologist } from '../models/psychologist.entity';
import { catchError, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class PsychologistApiService extends BaseService<Psychologist> {
    override resourceEndpoint = '/profiles/psychologists';

    constructor() {
        super();
    }

    getPsychologistByUserId(userId: number) {
        return this.http.get<Psychologist>(`${this.serverBaseUrl}/psychologists/user/${userId}`, this.httpOptions)
            .pipe(
                catchError(() => {
                    // Fallback: Fetch all psychologists and filter by userId
                    return this.getAll().pipe(
                        map((psychologists: Psychologist[]) => {
                            const psychologist = psychologists.find((p: Psychologist) => p.userId === userId);
                            if (!psychologist) throw new Error('Psychologist not found');
                            return psychologist;
                        })
                    );
                })
            );
    }
}
