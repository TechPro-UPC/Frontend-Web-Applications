export interface AccountResponse {
  id: number;
  email: string;
  passwordHash: string;
  role: string;
  isActive: boolean;
}
