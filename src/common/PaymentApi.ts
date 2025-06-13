export type PaymentDetails = {
  userId: string
  amount: number
  paymentMethod: string
}

export type PaymentId = string

export async function processPayment(paymentDetails: PaymentDetails): Promise<PaymentId | undefined> {
  return undefined
}
