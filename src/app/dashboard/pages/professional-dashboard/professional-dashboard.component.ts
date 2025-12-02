import { Component, OnInit } from '@angular/core';
import { Worker } from '../../models/worker.entity';
import { WorkerApiService } from '../../services/worker-api.service';
import { StaffListComponent } from '../../components/staff-list/staff-list.component';
import { UpcomingAppointmentsComponent } from '../../components/upcoming-appointments/upcoming-appointments.component';
import { Review } from '../../../reviews/models/review.entity';
import { ReviewApiService } from '../../../reviews/services/review-api.service';
import { ReviewListComponent } from '../../components/review-list/review-list.component';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { TranslatePipe } from '@ngx-translate/core';
@Component({
  selector: 'app-professional-dashboard',
  imports: [
    StaffListComponent,
    UpcomingAppointmentsComponent,
    ReviewListComponent,
    MatCard,
    MatCardContent,
    TranslatePipe
  ],
  templateUrl: './professional-dashboard.component.html',
  styleUrl: './professional-dashboard.component.css'
})
export class ProfessionalDashboardComponent implements OnInit {
  worker: Worker[] = [];
  reviews: Review[] = [];

  constructor(private staffService: WorkerApiService, private reviewService: ReviewApiService) {
  }
  ngOnInit() {

    const providerId = Number(localStorage.getItem('providerId'));
    if (!providerId) {
      console.warn('⚠️ No se encontró providerId en localStorage');
      return;
    }
    console.log('providerId:', providerId);
    this.staffService.getWorkers().subscribe(worker => this.worker = worker.filter(w => w.providerId === providerId));
    this.reviewService.getReviewsByPsychologistId(providerId).subscribe(reviews => this.reviews = reviews);
  }
}
