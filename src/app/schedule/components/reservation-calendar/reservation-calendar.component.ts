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
import { PsychologistApiService } from '../../../profile/services/psychologist-api.service';

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
    private psychologistApi = inject(PsychologistApiService);

    private patientApi = inject(PatientApiService);

    private psychologistSpecialization: string = '';

    timeSlots: any[] = [];

    ngOnInit(): void {
        this.loadAppointments();
        this.loadPsychologistDetails();
        this.loadTimeSlots();
    }

    private loadPsychologistDetails(): void {
        if (!this.psychologistId) return;
        this.psychologistApi.getById(this.psychologistId).subscribe({
            next: (psychologist) => {
                console.log('Psychologist details fetched:', psychologist);
                this.psychologistSpecialization = psychologist.specialization;
            },
            error: (err) => console.error('Error fetching psychologist details:', err)
        });
    }

    private loadTimeSlots(): void {
        this.timeSlotApi.getAll().subscribe({
            next: (slots: any[]) => {
                console.log('All TimeSlots (raw):', slots);
                if (slots.length > 0) {
                    console.log('First TimeSlot structure:', slots[0]);
                    console.log('Current Psychologist ID:', this.psychologistId);
                }

                // TEMPORARY: Remove filter to debug rendering
                // this.timeSlots = slots.filter(s => s.psychologistId === this.psychologistId && !s.isReserved);
                this.timeSlots = slots;

                const events: EventInput[] = this.timeSlots.map(s => ({
                    title: 'Available',
                    start: s.startTime,
                    end: s.endTime,
                    display: 'background',
                    color: '#00cc00' // Green for available
                }));

                console.log('Generated Events:', events);

                // Merge with existing events (appointments)
                this.calendarOptions = {
                    ...this.calendarOptions,
                    events: [
                        ...(this.calendarOptions.events as EventInput[] || []).filter(e => e.display !== 'background'), // Remove old background events
                        ...events
                    ]
                };
            },
            error: (err) => console.error('Error fetching TimeSlots:', err)
        });
    }

    private loadAppointments(): void {
        if (!this.psychologistId) return;

        this.appointmentApi.getAll().subscribe(res => {
            const appointments = AppointmentAssembler.toEntitiesFromResponse(res)
                .filter(a => a.provider.id === this.psychologistId);

            const appointmentEvents: EventInput[] = appointments.map(a => ({
                title: 'Occupied',
                start: a.timeSlot.startTime,
                end: a.timeSlot.endTime,
                color: '#ff9f89' // Visual indication of occupied slots
            }));

            this.calendarOptions = {
                ...this.calendarOptions,
                events: [
                    ...(this.calendarOptions.events as EventInput[] || []).filter(e => e.display === 'background'),
                    ...appointmentEvents
                ]
            };
        });
    }

    private handleDateSelect(sel: any): void {
        const start = new Date(sel.start);
        const end = new Date(sel.end);

        console.log('Selection Start:', start.toISOString());
        console.log('Selection End:', end.toISOString());

        // Prevent booking in the past
        const now = new Date();
        if (start < now) {
            alert('Cannot create a reservation in the past. Please select a future date.');
            return;
        }

        // Check if there is a matching TimeSlot
        const matchingSlot = this.timeSlots.find(s => {
            const slotStart = new Date(s.startTime);
            const slotEnd = new Date(s.endTime);

            const startDiff = Math.abs(slotStart.getTime() - start.getTime());
            const endDiff = Math.abs(slotEnd.getTime() - end.getTime());

            // Check if start time matches (within 1 second)
            const startMatches = startDiff < 1000;

            if (startMatches) {
                console.log(`Found potential match slot ${s.id}:`);
                console.log(`  Slot Start: ${slotStart.toISOString()}`);
                console.log(`  Sel Start : ${start.toISOString()}`);
                console.log(`  Slot End  : ${slotEnd.toISOString()}`);
                console.log(`  Sel End   : ${end.toISOString()}`);
                console.log(`  Start Diff: ${startDiff}ms`);
                console.log(`  End Diff  : ${endDiff}ms`);

                if (endDiff >= 1000) {
                    console.warn(`Slot ${s.id} end time mismatch. Ignoring end time for match.`);
                }
                return true;
            }

            return false;
        });

        if (!matchingSlot) {
            console.error('❌ NO MATCHING SLOT FOUND');
            console.error('Selection details:');
            console.error('  Start:', start.toISOString());
            console.error('  End:', end.toISOString());
            console.error('Available timeSlots count:', this.timeSlots.length);
            console.error('All timeSlots:', this.timeSlots.map(s => ({
                id: s.id,
                start: new Date(s.startTime).toISOString(),
                end: new Date(s.endTime).toISOString()
            })));
            alert('Please select an available (green) time slot.');
            return;
        }

        if (!confirm(`Book reservation from ${start.toLocaleTimeString()} to ${end.toLocaleTimeString()}?`)) return;

        const userId = Number(localStorage.getItem('clientId')) || 0;
        console.log('Current User ID from localStorage:', userId);

        this.patientApi.getAll().subscribe({
            next: (patients: any[]) => {
                console.log('All patients fetched from API:', patients);

                const patient = patients.find(p => {
                    if (p.user && p.user.id === userId) return true;
                    if ((p as any).userId === userId) return true;
                    if ((p as any).user_id === userId) return true;
                    return false;
                });

                if (!patient) {
                    alert('Patient profile not found for current user.');
                    return;
                }

                const patientId = patient.id;

                // Use existing TimeSlot ID
                console.log('Using existing TimeSlot:', matchingSlot);

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
                            psychologistId: this.psychologistId,
                            timeSlotId: matchingSlot.id,
                            paymentId: payment.Id
                        };
                        console.log('Sending Reservation Payload:', reservationPayload);

                        this.reservationApi.post(reservationPayload as any).subscribe({
                            next: () => {
                                alert('Reservation created successfully!');
                                this.loadAppointments(); // Refresh calendar
                                this.loadTimeSlots(); // Refresh slots
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
                console.error('Error fetching patients:', err);
                alert('Failed to verify patient identity.');
            }
        });
    }
}
