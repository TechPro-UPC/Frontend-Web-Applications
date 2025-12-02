import { Review } from '../models/review.entity';
import { ReviewResponse } from './review.response';

export class ReviewAssembler {
  static toEntityFromResource(resource: ReviewResponse): Review {
    return {
      id: resource.id,
      patientId: resource.patientId,
      psychologistId: resource.psychologistId,
      rating: resource.rating,
      comment: resource.comment,
      isRead: resource.isRead
    };
  }

  static toEntitiesFromResponse(resources: ReviewResponse[]): Review[] {
    return resources.map(this.toEntityFromResource);
  }
}
