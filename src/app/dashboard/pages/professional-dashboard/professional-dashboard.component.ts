import { Component, OnInit } from '@angular/core';
import { Review } from '../../../reviews/models/review.entity';
import { ReviewApiService } from '../../../reviews/services/review-api.service';
import { ReviewListComponent } from '../../components/review-list/review-list.component';
import { MatCard, MatCardContent } from '@angular/material/card';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-professional-dashboard',
  imports: [
    ReviewListComponent,
    MatCard,
    MatCardContent,
    TranslatePipe
  ],
  templateUrl: './professional-dashboard.component.html',
  styleUrl: './professional-dashboard.component.css'
})
export class ProfessionalDashboardComponent implements OnInit {
  reviews: Review[] = [];

  constructor(private reviewService: ReviewApiService) {
  }

  ngOnInit() {
    const providerId = Number(localStorage.getItem('providerId'));
    if (!providerId) {
      console.warn('⚠️ No se encontró providerId en localStorage');
      return;
    }
    console.log('providerId:', providerId);
    this.reviewService.getReviewsByPsychologistId(providerId).subscribe(reviews => this.reviews = reviews);
  }
}
