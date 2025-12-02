import { Component, inject, Input, OnInit } from '@angular/core';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { FullCalendarModule } from '@fullcalendar/angular';

import { ClientAppointment } from '../../model/appointment.entity';



import { ActivatedRoute, Route } from '@angular/router';
import { Service } from '../../../services/model/service.entity';
import { Worker } from '../../../dashboard/models/worker.entity';
import { AppointmentApiService } from '../../services/appointment-api-service.service';
import { AppointmentAssembler } from '../../services/appointment.assembler';
import { AppointmentResponse } from '../../services/appointment.response';
import { TimeSlotApiService } from '../../services/time-slot-api.service';
import { PaymentApiService } from '../../services/payment-api.service';
import { ReservationApiService } from '../../services/reservation-api.service';
import { loadStripe } from '@stripe/stripe-js';

@Component({
  selector: 'app-week-calendar',
  template: '<full-calendar [options]="calendarOptions"></full-calendar>',
  standalone: true,
  imports: [FullCalendarModule]
})
export class WeekCalendarComponent implements OnInit {

  @Input({ required: true }) service!: Service;   // servicio elegido
  @Input({ required: false }) worker!: Worker;     // staff elegido

  calendarOptions: CalendarOptions = {
    plugins: [interactionPlugin, timeGridPlugin],
    initialView: 'timeGridWeek',
    selectable: true,
    slotDuration: '00:30:00',
    headerToolbar: { left: 'prev,next today', center: 'title', right: 'timeGridWeek,timeGridDay' },
    events: [],
    select: this.handleDateSelect.bind(this)
  };

  private appointments: ClientAppointment[] = [];
  private api = inject(AppointmentApiService);
  private route = inject(ActivatedRoute);

  private timeSlotApi = inject(TimeSlotApiService);
  private paymentApi = inject(PaymentApiService);
  private reservationApi = inject(ReservationApiService);

  ngOnInit(): void { this.loadAppointments(); }

  /* ---------- Carga citas existentes ---------- */
  private loadAppointments(): void {
    const providerId = Number(this.route.snapshot.paramMap.get('id'));

    this.api.getAll().subscribe(res => {
      this.appointments = AppointmentAssembler.toEntitiesFromResponse(res)
        .filter(a => a.provider.id === providerId);

      const events: EventInput[] = this.appointments.map(a => ({
        title: `${a.workerId.specialization} - cliente ${a.clientId}`,
        start: a.timeSlot.startTime,
        end: a.timeSlot.endTime,
        extendedProps: { appointmentId: a.id }
      }));

      this.calendarOptions = { ...this.calendarOptions, events };
    });
  }

  /* ---------- Selección y POST ---------- */
  private handleDateSelect(sel: any): void {
    const duration = this.service?.duration ?? 30;
    const start = new Date(sel.start);
    const end = new Date(start.getTime() + duration * 60000);

    const overlaps = this.appointments.some(ap => {
      const s = new Date(ap.timeSlot.startTime).getTime() - 10 * 60000;
      const e = new Date(ap.timeSlot.endTime).getTime() + 10 * 60000;
      return start.getTime() < e && end.getTime() > s;
    });
    if (overlaps) { alert('⚠ Hay otra cita muy cerca.'); return; }

    if (!confirm(`Reservar de ${start.toLocaleTimeString()} a ${end.toLocaleTimeString()}?`)) return;

    const providerId = Number(this.route.snapshot.paramMap.get('id'));
    const clientId = Number(localStorage.getItem('clientId'));
    if (!clientId) {
      alert('No se encontró clientId en sesión. Vuelve a iniciar sesión.');
      return;
    }
    const workerId = this.worker.id;
    function toLocalISOString(date: Date): string {
      const offsetMs = date.getTimezoneOffset() * 60000;
      const localISOTime = new Date(date.getTime() - offsetMs).toISOString().slice(0, 19);
      return localISOTime;
    }
    const startIsoLocal = toLocalISOString(start);
    const endIsoLocal = toLocalISOString(end);

    // 👉 Paso 1: Crear TimeSlot
    this.timeSlotApi.post({
      id: 0,
      startTime: startIsoLocal,
      endTime: endIsoLocal,
      status: true,
      type: this.worker.specialization,
    }).subscribe(timeSlot => {

      // 👉 Paso 2: Crear Payment
      const paymentPayload = {
        totalAmount: {
          amount: this.service.price,
          currency: 'USD'
        },
        status: 'AUTHORIZED'
      };

      this.paymentApi.post(paymentPayload as any).subscribe({
        next: (payment: any) => {

          // 👉 Paso 3: Crear la Reservation
          this.reservationApi.post({
            clientId,
            providerId,
            paymentId: payment.Id, // Note: Capital 'I' based on API response
            timeSlotId: timeSlot.id,
            workerId
          }).subscribe({
            next: () => {
              alert('✅ Cita reservada'); this.loadAppointments();
              window.location.href = 'https://buy.stripe.com/test_eVq00l2Dz6EJ4iN2Wz5os00';
            },

            error: e => alert('❌ Error en reserva: ' + e.message)
          });

        }, error: err => alert('❌ Error en pago: ' + err.message)
      });

    }, err => alert('❌ Error en horario: ' + err.message));


    //Quiero ponerlo aqui despues del post para el pago
    const stripePromise = loadStripe('pk_test_51RO93KQjzoQNilXPLpic68sHjDYb1tcVKSpYNcjqQv0uZUB7dg7mxLL2JzkjmTNzwyf9WCWa8sDAEcB0qcLX7Uw100WAGbxwW4');
    stripePromise.then(stripe => {
      if (!stripe) {
        alert('Stripe no se cargó correctamente');
        return;
      }

      stripe.redirectToCheckout({
        lineItems: [
          {
            price: 'price_1RhIY5QjzoQNilXPLxfTT1JP', // 🔁 Tu Price ID desde Stripe Dashboard
            quantity: 1
          }
        ],
        mode: 'payment',
        successUrl: window.location.origin + '/client/homeClient',
        cancelUrl: window.location.origin + '/client/homeClient'
      }).then(result => {
        if (result.error) {
          alert('Error en checkout: ' + result.error.message);
        }
      });
    });
  }

}

