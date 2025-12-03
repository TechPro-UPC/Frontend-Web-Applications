export interface TimeSlot {
    id: number;
    startTime: string;
    endTime: string;
    psychologistId: number;
    isReserved: boolean;
}

export interface CreateTimeSlotRequest {
    startTime: string;
    endTime: string;
    psychologistId: number;
}
