import { Component } from '@angular/core';
import { AppointmentsListComponent } from "../../components/appointments-list/appointments-list.component";
import { SidebarClientComponent } from "../../../public/components/sidebar-client/sidebar-client.component";
import { UpcomingAppointmentsComponent } from '../../../dashboard/components/upcoming-appointments/upcoming-appointments.component';
import { CalendarComponent } from '../../../schedule/components/calendar/calendar.component';
import { PsychologistListComponent } from '../../components/psychologist-list/psychologist-list.component';

@Component({
  selector: 'app-client-appointment-pages',
  imports: [
    AppointmentsListComponent,
    SidebarClientComponent,
    UpcomingAppointmentsComponent,
    CalendarComponent,
    PsychologistListComponent,
    SidebarClientComponent
  ],
  templateUrl: './client-appointment-pages.component.html',
  styleUrl: './client-appointment-pages.component.css',
  standalone: true
})
export class ClientAppointmentPagesComponent {

}
