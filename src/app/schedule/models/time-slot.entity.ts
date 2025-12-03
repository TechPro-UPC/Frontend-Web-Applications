export interface TimeSlot {
    id: number;
    startTime: string;
    endTime: string;
    psychologistId: number;
}

export interface CreateTimeSlotRequest {
    startTime: string;
    endTime: string;
    psychologistId: number;
}
