import { Component, OnInit, Input } from '@angular/core';
import { NgForOf, NgIf, CommonModule } from '@angular/common';
import { ReservationComponent } from '../reservation/reservation.component';
import { SchedulingService } from '../../services/scheduling.service';
import { TimeSlot } from '../../models/time-slot.entity';
import { Reservation } from '../../models/reservation.entity';
import { PsychologistApiService } from '../../../profile/services/psychologist-api.service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    ReservationComponent,
    CommonModule
  ],
})
export class CalendarComponent implements OnInit {
  days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  hours = [
    '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00',
    '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
  ];

  workers: string[] = ['Todos'];
  currentWorkerIndex: number = 0;
  currentPsychologistId: number | null = null;

  @Input() isPatient: boolean = false;

  timeSlots: TimeSlot[] = [];
  reservations: Reservation[] = [];

  constructor(private schedulingService: SchedulingService, private psychologistService: PsychologistApiService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    if (!this.isPatient) {
      const userId = Number(localStorage.getItem('clientId'));
      this.psychologistService.getAll().subscribe(psychologists => {
        const psychologist = psychologists.find(p => p.userId === userId);
        if (psychologist) {
          this.currentPsychologistId = psychologist.id;
          this.schedulingService.getAllTimeSlots().subscribe(slots => {
            this.timeSlots = slots;
          });

          this.schedulingService.getAllReservations().subscribe(res => {
            this.reservations = res;
          });
        }
      });
    }
  }

  get currentWorker(): string {
    return this.workers[this.currentWorkerIndex];
  }

  swapWorker(): void {
    this.currentWorkerIndex = (this.currentWorkerIndex + 1) % this.workers.length;
  }

  formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  formatDay(dateStr: string): string {
    const date = new Date(dateStr);
    const day = date.toLocaleDateString('en-US', { weekday: 'long' });
    return day.charAt(0).toUpperCase() + day.slice(1);
  }

  isSameDay(dateStr: string, day: string): boolean {
    const date = new Date(dateStr);
    const formattedDay = date.toLocaleDateString('en-US', { weekday: 'long' });
    return formattedDay.toLowerCase() === day.toLowerCase();
  }

  isWithinHour(dateStr: string, hourStr: string): boolean {
    const date = new Date(dateStr);
    const hour = parseInt(hourStr.split(':')[0], 10);
    return date.getHours() === hour;
  }

  // Helper to find reservation for a specific slot if needed
  getReservationForSlot(slotId: number): Reservation | undefined {
    return this.reservations.find(r => r.timeSlotId === slotId);
  }

  handleSlotClick(day: string, hour: string, slot?: TimeSlot): void {
    if (this.isPatient) {
      if (slot) {
        this.createReservation(slot);
      } else {
        console.log('No slot available to book');
      }
    } else {
      // Provider creates slot
      this.createTimeSlot(day, hour);
    }
  }

  createReservation(slot: TimeSlot): void {
    const newReservation = {
      patientId: Number(localStorage.getItem('clientId')) || 0,
      psychologistId: this.currentPsychologistId ?? 0,
      timeSlotId: slot.id,
      paymentId: 0 // mock payment id – replace with real logic when available
    };

    this.schedulingService.createReservation(newReservation).subscribe(created => {
      console.log('Created reservation:', created);
      this.reservations.push(created);
      alert('Reservation created!');
    });
  }

  createTimeSlot(day: string, hour: string): void {
    // Logic to create a time slot
    // We need to construct a real date from 'day' and 'hour' relative to "current week"
    // For simplicity, let's assume we are viewing the current week.

    const now = new Date();
    const currentDayIndex = now.getDay() || 7; // 1 (Mon) - 7 (Sun)
    const targetDayIndex = this.days.indexOf(day) + 1;

    const diff = targetDayIndex - currentDayIndex;
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + diff);

    const [h, m] = hour.split(':').map(Number);
    targetDate.setHours(h, m, 0, 0);

    // Format to Local ISO String to avoid UTC conversion
    const formatLocalISO = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const h = String(date.getHours()).padStart(2, '0');
      const m = String(date.getMinutes()).padStart(2, '0');
      const s = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${d}T${h}:${m}:${s}`;
    };

    const startTime = formatLocalISO(targetDate);
    const endDate = new Date(targetDate.getTime() + 60 * 60 * 1000); // +1 hour
    const endTime = formatLocalISO(endDate);

    const newSlot = {
      startTime: startTime,
      endTime: endTime,
      psychologistId: this.currentPsychologistId || 0
    };

    this.schedulingService.createTimeSlot(newSlot).subscribe(created => {
      console.log('Created slot:', created);
      this.timeSlots.push(created);
    });
  }
}
