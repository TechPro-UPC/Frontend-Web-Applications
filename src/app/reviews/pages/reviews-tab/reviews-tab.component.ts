import { Component, OnInit } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { Review } from '../../models/review.entity';
import { ReviewApiService } from '../../services/review-api.service';
import { ReviewListComponent } from '../../../dashboard/components/review-list/review-list.component';
import { ReviewAssembler } from '../../services/review.assembler';

@Component({
  selector: 'app-reviews-tab',
  imports: [
    TranslatePipe,
    MatCard,
    MatCardContent,
    ReviewListComponent
  ],
  templateUrl: './reviews-tab.component.html',
  styleUrl: './reviews-tab.component.css'
})
export class ReviewsTabComponent implements OnInit {
  reviews: Review[] = [];
  average = 0;
  constructor(private reviewService: ReviewApiService) {
  }
  ngOnInit() {
    const providerId = Number(localStorage.getItem('providerId'));
    this.reviewService.getReviewsByPsychologistId(providerId).subscribe(reviews => {
      this.reviews = reviews;
      console.log(this.reviews);
      this.reviews.forEach(review => this.average += review.rating);
      this.average /= this.reviews.length;
    })

  }
}
