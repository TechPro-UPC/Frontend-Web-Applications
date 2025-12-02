import { Component, Input, OnInit } from '@angular/core';
import { Review } from '../../../reviews/models/review.entity';
import { CommonModule } from '@angular/common';
import { ReviewItemComponent } from '../review-item/review-item.component';
import { ReviewApiService } from '../../../reviews/services/review-api.service';
import { TranslatePipe } from '@ngx-translate/core';
import { ReviewAssembler } from '../../../reviews/services/review.assembler';

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [CommonModule, ReviewItemComponent, TranslatePipe],
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.css']
})
export class ReviewListComponent implements OnInit {
  profileReviews: Review[] = [];
  constructor(private reviewService: ReviewApiService) { }

  ngOnInit() {
    //this.reviewService.getReviews().subscribe(reviews => this.profileReviews = reviews);
    const providerId = Number(localStorage.getItem('providerId'));
    this.reviewService.getReviewsByPsychologistId(providerId).subscribe(reviews => {
      this.profileReviews = reviews;
      console.log(this.profileReviews);
    })// Recibe las reviews desde el padre (como ya lo haces en Dashboard)
  }

}
