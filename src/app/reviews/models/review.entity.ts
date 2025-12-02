export class Review {
  id: number;
  patientId: number;
  psychologistId: number;
  rating: number;
  comment: string;
  isRead: boolean;

  constructor() {
    this.id = 0;
    this.patientId = 0;
    this.psychologistId = 0;
    this.rating = 0;
    this.comment = '';
    this.isRead = false;
  }
}
