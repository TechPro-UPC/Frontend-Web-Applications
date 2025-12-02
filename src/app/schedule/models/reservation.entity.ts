export interface Reservation {
    id: number;
    patientId: number;
    psycologistId: number;
    timeSlotId: number;
    paymentId: number;
}

export interface CreateReservationRequest {
    patientId: number;
    psycologistId: number;
    timeSlotId: number;
    paymentId: number;
}
