export type OrderNotificationDetails = {
  userId: string
  orderId: string
  orderTotal: number
}

// Might throw if notification service is unnavailable
export function sendOrderNotification(notificationDetails: OrderNotificationDetails): Promise<void> {
  throw new Error('Notification service unnavailable')
}
