import { Component, inject, Input, OnInit } from '@angular/core';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { FullCalendarModule } from '@fullcalendar/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { TimeSlotApiService } from '../../../appointments/services/time-slot-api.service';
import { ReservationApiService } from '../../../appointments/services/reservation-api.service';
import { AppointmentApiService } from '../../../appointments/services/appointment-api-service.service';
import { AppointmentAssembler } from '../../../appointments/services/appointment.assembler';
import { PaymentApiService } from '../../../appointments/services/payment-api.service';
import { PatientApiService } from '../../../profile/services/patient-api.service';

@Component({
    selector: 'app-reservation-calendar',
    template: '<full-calendar [options]="calendarOptions"></full-calendar>',
    standalone: true,
    imports: [FullCalendarModule]
})
export class ReservationCalendarComponent implements OnInit {

    @Input() psychologistId!: number;

    calendarOptions: CalendarOptions = {
        plugins: [interactionPlugin, timeGridPlugin],
        initialView: 'timeGridWeek',
        selectable: true,
        slotDuration: '00:30:00',
        headerToolbar: { left: 'prev,next today', center: 'title', right: 'timeGridWeek,timeGridDay' },
        events: [],
        select: this.handleDateSelect.bind(this)
    };

    private timeSlotApi = inject(TimeSlotApiService);
    private reservationApi = inject(ReservationApiService);
    private appointmentApi = inject(AppointmentApiService);
    private paymentApi = inject(PaymentApiService);
    private router = inject(Router);

    private patientApi = inject(PatientApiService);

    ngOnInit(): void {
        this.loadAppointments();
    }

    private loadAppointments(): void {
        if (!this.psychologistId) return;

        this.appointmentApi.getAll().subscribe(res => {
            const appointments = AppointmentAssembler.toEntitiesFromResponse(res)
                .filter(a => a.provider.id === this.psychologistId);

            const events: EventInput[] = appointments.map(a => ({
                title: 'Occupied',
                start: a.timeSlot.startTime,
                end: a.timeSlot.endTime,
                color: '#ff9f89' // Visual indication of occupied slots
            }));

            this.calendarOptions = { ...this.calendarOptions, events };
        });
    }

    private handleDateSelect(sel: any): void {
        const start = new Date(sel.start);
        const end = new Date(sel.end);

        if (!confirm(`Book reservation from ${start.toLocaleTimeString()} to ${end.toLocaleTimeString()}?`)) return;

        const userId = Number(localStorage.getItem('clientId')) || 0;
        console.log('Current User ID from localStorage:', userId);

        this.patientApi.getAll().subscribe({
            next: (patients: any[]) => {
                console.log('All patients fetched from API:', patients);
                if (patients.length > 0) {
                    console.log('First patient raw JSON:', JSON.stringify(patients[0]));
                }

                // Try to find patient by matching userId in various possible fields
                const patient = patients.find(p => {
                    // Check for nested user object
                    if (p.user && p.user.id === userId) return true;

                    // Check for flat userId property (camelCase)
                    if ((p as any).userId === userId) return true;

                    // Check for flat user_id property (snake_case)
                    if ((p as any).user_id === userId) return true;

                    return false;
                });

                if (!patient) {
                    alert('Patient profile not found for current user.');
                    return;
                }

                const patientId = patient.id;

                // Helper to format date to ISO string without timezone conversion issues for local time
                const toLocalISOString = (date: Date): string => {
                    const offsetMs = date.getTimezoneOffset() * 60000;
                    return new Date(date.getTime() - offsetMs).toISOString();
                };

                const startTime = toLocalISOString(start);
                const endTime = toLocalISOString(end);

                // 1. Create TimeSlot
                this.timeSlotApi.post({
                    id: 0,
                    startTime: startTime,
                    endTime: endTime,
                    psychologistId: this.psychologistId
                } as any).subscribe({
                    next: (timeSlot: any) => {
                        console.log('TimeSlot created:', timeSlot);

                        // 2. Create Payment
                        const paymentPayload = {
                            totalAmount: {
                                amount: 100,
                                currency: 'USD'
                            },
                            status: 'AUTHORIZED'
                        };
                        console.log('Sending Payment Payload:', paymentPayload);

                        this.paymentApi.post(paymentPayload as any).subscribe({
                            next: (payment: any) => {
                                console.log('Payment created:', payment);

                                // 3. Create Reservation
                                const reservationPayload = {
                                    patientId: patientId,
                                    psycologistId: this.psychologistId,
                                    timeSlotId: timeSlot.id,
                                    paymentId: payment.Id // Note: Capital 'I' based on API response
                                };
                                console.log('Sending Reservation Payload:', reservationPayload);

                                this.reservationApi.post(reservationPayload as any).subscribe({
                                    next: () => {
                                        alert('Reservation created successfully!');
                                        this.loadAppointments(); // Refresh calendar
                                        this.router.navigate(['/client/appointment']);
                                    },
                                    error: (err) => {
                                        console.error('Error creating reservation:', err);
                                        alert('Failed to create reservation.');
                                    }
                                });
                            },
                            error: (err) => {
                                console.error('Error creating payment:', err);
                                alert('Failed to create payment.');
                            }
                        });
                    },
                    error: (err) => {
                        console.error('Error creating time slot:', err);
                        alert('Failed to create time slot.');
                    }
                });
            },
            error: (err) => {
                console.error('Error fetching patients:', err);
                alert('Failed to verify patient identity.');
            }
        });
    }
}
