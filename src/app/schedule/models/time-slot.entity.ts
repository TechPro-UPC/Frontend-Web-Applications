export interface TimeSlot {
    id: number;
    startTime: string;
    endTime: string;
}

export interface CreateTimeSlotRequest {
    startTime: string;
    endTime: string;
    psychologistId: number;
}
