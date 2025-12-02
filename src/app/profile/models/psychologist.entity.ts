export class Psychologist {
    id: number;
    firstName: string;
    lastName: string;
    dni: string;
    phone: string;
    gender: string;
    licenseNumber: string;
    specialization: string;
    user: { id: number };

    constructor() {
        this.id = 0;
        this.firstName = '';
        this.lastName = '';
        this.dni = '';
        this.phone = '';
        this.gender = '';
        this.licenseNumber = '';
        this.specialization = '';
        this.user = { id: 0 };
    }
}
