import { processOrder } from '../exercises/exercise-4'

import * as notificationApi from '../common/NotificationApi'
import * as paymentApi from '../common/PaymentApi'
import * as userDb from '../common/UserDb'
import * as orderDb from '../common/OrderDb'

vi.mock('../common/NotificationApi')
vi.mock('../common/PaymentApi')
vi.mock('../common/UserDb')
vi.mock('../common/OrderDb')

describe(processOrder, () => {
  const sendOrderNotificationSpy = vi.spyOn(notificationApi, 'sendOrderNotification')
  const processPaymentSpy = vi.spyOn(paymentApi, 'processPayment')
  const findUserByIdSpy = vi.spyOn(userDb, 'findUserById')
  const findProductByIdSpy = vi.spyOn(orderDb, 'findProductById')
  const createOrderSpy = vi.spyOn(orderDb, 'createOrder')

  const validRequestBody = {
    userId: '123',
    items: [
      { productId: 'p1', quantity: 2 },
      { productId: 'p2', quantity: 1 }
    ],
    paymentMethod: 'credit_card'
  }

  beforeEach(() => {
    findUserByIdSpy.mockResolvedValue({ id: '123', name: 'Test User' })

    findProductByIdSpy.mockImplementation((productId) => {
      if (productId === 'p1') {
        return Promise.resolve({ id: 'p1', stock: 10, price: 50 })
      } else if (productId === 'p2') {
        return Promise.resolve({ id: 'p2', stock: 5, price: 100 })
      }
      return Promise.resolve(undefined)
    })

    processPaymentSpy.mockResolvedValue('pay_123')
    sendOrderNotificationSpy.mockResolvedValue()

    createOrderSpy.mockResolvedValue({ id: 'order_123', ...validRequestBody })
  })

  function sut(body: unknown) {
    return processOrder({ body })
  }

  it('should return 400 if required fields are missing', async () => {
    // Act
    const response = await sut({})
    // Assert
    expect(response.statusCode).toBe(400)
    expect(response.body.error).toBe('User ID and at least one order item are required.')
  })

  it('should return 400 if order items are invalid', async () => {
    // Arrange
    const body = { ...validRequestBody, items: [{ productId: 'p1', quantity: 0 }] }
    // Act
    const response = await sut(body)
    // Assert
    expect(response.statusCode).toBe(400)
    expect(response.body.error).toBe('Invalid order items provided.')
  })

  it('should return 404 if user is not found', async () => {
    // Arrange
    findUserByIdSpy.mockResolvedValue(undefined)
    // Act
    const response = await sut(validRequestBody)
    // Assert
    expect(response.statusCode).toBe(404)
    expect(response.body.error).toBe('User not found.')
  })

  it('should return 404 if product is not found', async () => {
    // Arrange
    findProductByIdSpy.mockImplementation((productId) => {
      if (productId === 'p2') return Promise.resolve({ id: 'p2', stock: 5, price: 100 })
      return Promise.resolve(undefined)
    })
    // Act
    const response = await sut(validRequestBody)
    // Assert
    expect(response.statusCode).toBe(404)
    expect(response.body.error).toBe('Product p1 not found.')
  })

  it('should return 400 if insufficient stock for a product', async () => {
    // Arrange
    findProductByIdSpy.mockImplementation((productId) => {
      if (productId === 'p1') return Promise.resolve({ id: 'p1', stock: 1, price: 50 })
      if (productId === 'p2') return Promise.resolve({ id: 'p2', stock: 5, price: 100 })
      return Promise.resolve(undefined)
    })
    // Act
    const response = await sut(validRequestBody)
    // Assert
    expect(response.statusCode).toBe(400)
    expect(response.body.error).toBe('Insufficient stock for product p1.')
  })

  it('should return 402 if payment fails', async () => {
    // Arrange
    processPaymentSpy.mockResolvedValue(undefined)
    // Act
    const response = await sut(validRequestBody)
    // Assert
    expect(response.statusCode).toBe(402)
    expect(response.body.error).toBe('Payment failed.')
  })

  it('should return 503 if payment service is unavailable', async () => {
    // Arrange
    processPaymentSpy.mockRejectedValue(new Error('Payment service down'))
    // Act
    const response = await sut(validRequestBody)
    // Assert
    expect(response.statusCode).toBe(503)
    expect(response.body.error).toBe('Payment service unavailable.')
  })

  it('should process the order successfully even if order confirmation email fails', async () => {
    // Arrange
    processPaymentSpy.mockResolvedValue('pay_123')
    sendOrderNotificationSpy.mockRejectedValue(new Error('Email service down'))
    // Act
    const response = await sut(validRequestBody)
    // Assert
    expect(response.statusCode).toBe(201)
    expect(response.body.message).toBe('Order processed successfully.')
    expect(response.body.order).toHaveProperty('id')
  })

  it('should return 500 if order creation fails', async () => {
    // Arrange
    createOrderSpy.mockRejectedValue(new Error('DB create error'))
    // Act
    const response = await sut(validRequestBody)
    // Assert
    expect(response.statusCode).toBe(500)
    expect(response.body.error).toBe('Error creating order record.')
  })

  it('should return 500 if calculating order total fails', async () => {
    // Arrange
    findProductByIdSpy.mockImplementation((productId) => {
      if (productId === 'p1') return Promise.reject(new Error('DB error on p1'))
      if (productId === 'p2') return Promise.resolve({ id: 'p2', stock: 5, price: 100 })
      return Promise.resolve(undefined)
    })
    // Act
    const response = await sut(validRequestBody)
    // Assert
    expect(response.statusCode).toBe(500)
    expect(response.body.error).toBe('Database error checking product p1.')
  })
})
