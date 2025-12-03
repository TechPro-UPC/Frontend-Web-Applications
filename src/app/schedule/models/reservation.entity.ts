export interface Reservation {
    id: number;
    patientId: number;
    psychologistId: number;
    timeSlotId: number;
    paymentId: number;
}

export interface CreateReservationRequest {
    patientId: number;
    psychologistId: number;
    timeSlotId: number;
    paymentId: number;
}
