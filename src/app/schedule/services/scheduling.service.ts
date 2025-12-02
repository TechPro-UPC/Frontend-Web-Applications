import { Injectable } from '@angular/core';
import { BaseService } from '../../shared/services/base.service';
import { Observable } from 'rxjs';
import { TimeSlot, CreateTimeSlotRequest } from '../models/time-slot.entity';
import { Reservation, CreateReservationRequest } from '../models/reservation.entity';

@Injectable({
    providedIn: 'root'
})
export class SchedulingService extends BaseService<any> {

    constructor() {
        super();
        this.resourceEndpoint = '';
    }

    getAllTimeSlots(): Observable<TimeSlot[]> {
        return this.http.get<TimeSlot[]>(`${this.resourcePath()}/time-slots`);
    }

    createTimeSlot(data: CreateTimeSlotRequest): Observable<TimeSlot> {
        return this.http.post<TimeSlot>(`${this.resourcePath()}/time-slots`, data);
    }

    getAllReservations(): Observable<Reservation[]> {
        return this.http.get<Reservation[]>(`${this.resourcePath()}/reservationsDetails`);
    }

    createReservation(data: CreateReservationRequest): Observable<Reservation> {
        return this.http.post<Reservation>(`${this.resourcePath()}/reservationsDetails`, data);
    }

    getAllReservationsDetails(): Observable<any[]> {
        return this.http.get<any[]>(`${this.resourcePath()}/reservationsDetails/details`);
    }
}
