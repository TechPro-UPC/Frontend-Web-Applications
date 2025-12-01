export class AccountEntity {
  id: number;
  email: string;
  passwordHash: string;
  role: string;
  isActive: boolean;

  constructor() {
    this.id = 0;
    this.email = '';
    this.passwordHash = '';
    this.role = '';
    this.isActive = false;
  }
}
