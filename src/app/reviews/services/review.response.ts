export interface ReviewResponse {
  id: number;
  patientId: number;
  psychologistId: number;
  rating: number;
  comment: string;
  isRead: boolean;
}
