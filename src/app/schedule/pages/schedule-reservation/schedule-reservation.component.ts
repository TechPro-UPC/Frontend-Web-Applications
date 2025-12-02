import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReservationCalendarComponent } from '../../components/reservation-calendar/reservation-calendar.component';
import { SidebarClientComponent } from '../../../public/components/sidebar-client/sidebar-client.component';

@Component({
    selector: 'app-schedule-reservation',
    standalone: true,
    imports: [ReservationCalendarComponent, SidebarClientComponent],
    template: `
    <div class="main-container">
      <div class="sidebar-section">
        <app-sidebar-client></app-sidebar-client>
      </div>
      <div class="content-grid">
        <h2>Schedule Reservation</h2>
        <app-reservation-calendar [psychologistId]="psychologistId"></app-reservation-calendar>
      </div>
    </div>
  `,
    styles: [`
    .main-container {
      display: flex;
      height: 100vh;
    }
    .sidebar-section {
      width: 250px;
      flex-shrink: 0;
    }
    .content-grid {
      flex-grow: 1;
      padding: 20px;
      overflow-y: auto;
    }
  `]
})
export class ScheduleReservationComponent implements OnInit {
    psychologistId!: number;
    private route = inject(ActivatedRoute);

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.psychologistId = Number(params.get('psychologistId'));
        });
    }
}
