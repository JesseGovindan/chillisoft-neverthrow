export type Product = {
  id: string
  stock: number
  price: number
}

export function findProductById(productId: string): Promise<Product | undefined> {
  return Promise.resolve(undefined)
}

export type OrderItem = {
  productId: string
  quantity: number
}

export type OrderTemplate = {
  userId: string
  items: OrderItem[]
  total: number
  paymentId: string
  createdAt: Date
}

// Might throw if unable to create order
export function createOrder(order: OrderTemplate): Promise<{ id: string }> {
  throw new Error('Unable to create order')
}
