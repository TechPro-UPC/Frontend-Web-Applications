export class Patient {
    id: number;
    firstName: string;
    lastName: string;
    dni: string;
    phone: string;
    gender: string;
    userId: number;

    constructor() {
        this.id = 0;
        this.firstName = '';
        this.lastName = '';
        this.dni = '';
        this.phone = '';
        this.gender = '';
        this.userId = 0;
    }
}
