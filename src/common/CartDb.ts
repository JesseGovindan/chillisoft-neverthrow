export type Item = {
  name: string
  price: number
  quantity: number
  discount: number
}

export type Cart = Item[]

export function getUserCart(userId: string): Cart {
  // Just for demonstration purposes
  return []
}

export function updateUserCart(userId: string, updatedCart: Cart): Cart {
  // Just for demonstration purposes
  return []
}

export function getDiscountForCode(discountCode: string) {
  return 0.1
}
