import { Component, inject, Input, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { ClientAppointment } from '../../../appointments/model/appointment.entity';
import { AppointmentApiService } from '../../../appointments/services/appointment-api-service.service';
import { PsychologistApiService } from '../../../profile/services/psychologist-api.service';
import { PatientApiService } from '../../../profile/services/patient-api.service';
import { TimeSlotApiService } from '../../../appointments/services/time-slot-api.service';
import { PaymentApiService } from '../../../appointments/services/payment-api.service';
import { Reservation } from '../../../schedule/models/reservation.entity';
import { forkJoin, map, switchMap, catchError, of } from 'rxjs';
import jsPDF from 'jspdf';


@Component({
  selector: 'app-upcoming-appointments',
  templateUrl: './upcoming-appointments.component.html',
  styleUrls: ['./upcoming-appointments.component.css'],
  imports: [CommonModule, TranslatePipe]
})
export class UpcomingAppointmentsComponent implements OnInit {
  upcomingAppointments: ClientAppointment[] = [];
  @Input() isClient: boolean = false;

  constructor(
    private appointmentService: AppointmentApiService,
    private psychologistService: PsychologistApiService,
    private timeSlotService: TimeSlotApiService,
    private paymentService: PaymentApiService,
    private patientApiService: PatientApiService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.appointmentService.getReservationsDetails().pipe(
      switchMap((reservations: Reservation[]) => {
        const userId = Number(localStorage.getItem('clientId'));

        if (this.isClient) {
          // Client View: Filter by Patient ID
          return this.patientApiService.getAll().pipe(
            map(patients => {
              const patient = patients.find(p => p.userId === userId);
              if (patient) {
                return reservations.filter(r => r.patientId === patient.id);
              } else {
                return [];
              }
            }),
            catchError(err => {
              console.error('Error fetching patients:', err);
              return of([]);
            })
          );
        } else {
          // Psychologist View: Filter by Psychologist ID
          return this.psychologistService.getAll().pipe(
            map(psychologists => {
              const psychologist = psychologists.find(p => p.userId === userId);
              if (psychologist) {
                return reservations.filter(r => r.psychologistId === psychologist.id);
              } else {
                return [];
              }
            }),
            catchError(err => {
              console.error('Error fetching psychologists:', err);
              return of([]);
            })
          );
        }
      }),
      switchMap((filteredReservations: Reservation[]) => {
        if (filteredReservations.length === 0) {
          return of([]);
        }

        // Create an array of observables to fetch details for each reservation
        const detailsObservables = filteredReservations.map(reservation => {
          return forkJoin({
            psychologist: this.psychologistService.getById(reservation.psychologistId).pipe(catchError(e => { console.error('Error fetching psychologist', e); return of(null); })),
            patient: !this.isClient ? this.patientApiService.getById(reservation.patientId).pipe(catchError(e => { console.error('Error fetching patient', e); return of(null); })) : of(null),
            timeSlot: this.timeSlotService.getById(reservation.timeSlotId).pipe(catchError(e => { console.error('Error fetching timeSlot', e); return of(null); })),
            payment: this.paymentService.getById(reservation.paymentId).pipe(catchError(e => { console.error('Error fetching payment', e); return of(null); }))
          }).pipe(
            map(({ psychologist, patient, timeSlot, payment }) => {
              if (!psychologist || !timeSlot) {
                return null;
              }
              // Map to ClientAppointment structure
              const appointment = new ClientAppointment();
              appointment.id = reservation.id;
              appointment.clientId = reservation.patientId;

              // Map Psychologist to Provider/Worker
              appointment.provider = {
                id: psychologist.id,
                name: `${psychologist.firstName} ${psychologist.lastName}`,
                companyName: 'MindBridge' // Default or fetch if available
              };

              // If Psychologist view, show Patient Name. Else show Psychologist Name.
              if (!this.isClient && patient) {
                appointment.workerId = {
                  id: patient.id,
                  name: `${patient.firstName} ${patient.lastName}`,
                  specialization: psychologist.specialization // Keep specialization or change? User asked for patient data.
                };
              } else {
                appointment.workerId = {
                  id: psychologist.id,
                  name: `${psychologist.firstName} ${psychologist.lastName}`,
                  specialization: psychologist.specialization
                };
              }

              // Map TimeSlot
              appointment.timeSlot = {
                id: timeSlot.id,
                startTime: timeSlot.startTime,
                endTime: timeSlot.endTime,
                status: timeSlot.status, // Now boolean
                type: timeSlot.type
              };

              // Map Payment (handle missing)
              if (payment) {
                appointment.paymentId = {
                  id: payment.Id,
                  amount: payment.totalAmount.amount,
                  currency: payment.totalAmount.currency,
                  status: payment.status === 'AUTHORIZED' || payment.status === 'DONE'
                };
              } else {
                appointment.paymentId = {
                  id: 0,
                  amount: 0,
                  currency: 'USD',
                  status: false
                };
              }

              return appointment;
            })
          );
        });

        return forkJoin(detailsObservables).pipe(map(results => results.filter(r => r !== null) as ClientAppointment[]));
      })
    ).subscribe({
      next: (appointments) => {
        const now = new Date();
        this.upcomingAppointments = appointments
          .sort((a, b) => new Date(a.timeSlot.startTime).getTime() - new Date(b.timeSlot.endTime).getTime());
      },
      error: (err) => console.error('Error in upcoming appointments subscription:', err)
    });
  }

  formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const currentLang = this.translate.currentLang || 'en';
    return date.toLocaleTimeString(currentLang, { hour: 'numeric', minute: '2-digit' });
  }

  formatDay(dateStr: string): string {
    const date = new Date(dateStr);
    const currentLang = this.translate.currentLang || 'en';
    return date.toLocaleDateString(currentLang, { weekday: 'long', day: 'numeric' });
  }


  isToday(dateStr: string): boolean {
    const today = new Date();
    const date = new Date(dateStr);
    return today.toDateString() === date.toDateString();
  }

  exportToPDF(appointment: ClientAppointment): void {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(40, 116, 240);
    doc.text('MindBridge', 105, 20, { align: 'center' });

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Session Report', 105, 35, { align: 'center' });

    // Line separator
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 42, 190, 42);

    // Patient Information
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Patient Information:', 20, 55);

    doc.setFont('helvetica', 'normal');
    doc.text(`Patient Name: ${appointment.workerId.name}`, 20, 65);
    doc.text(`Service: ${appointment.workerId.specialization}`, 20, 73);

    // Session Details
    doc.setFont('helvetica', 'bold');
    doc.text('Session Details:', 20, 90);

    doc.setFont('helvetica', 'normal');
    const startDate = new Date(appointment.timeSlot.startTime);
    const endDate = new Date(appointment.timeSlot.endTime);

    doc.text(`Date: ${startDate.toLocaleDateString()}`, 20, 100);
    doc.text(`Start Time: ${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 20, 108);
    doc.text(`End Time: ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 20, 116);
    doc.text(`Payment Status: ${appointment.paymentId.status ? 'Paid' : 'Pending'}`, 20, 124);

    // Description
    doc.setFont('helvetica', 'bold');
    doc.text('Session Description:', 20, 140);

    doc.setFont('helvetica', 'normal');
    const description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';
    const splitDescription = doc.splitTextToSize(description, 170);
    doc.text(splitDescription, 20, 150);

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 105, 280, { align: 'center' });

    // Save PDF
    const fileName = `session-${appointment.workerId.name.replace(/\s+/g, '-')}-${startDate.toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }
}
