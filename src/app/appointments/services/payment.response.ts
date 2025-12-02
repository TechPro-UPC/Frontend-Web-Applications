export interface PaymentResponse {
  Id: number;
  totalAmount: {
    amount: number;
    currency: string;
  };
  status: string;
}
