import { sendOrderNotification } from "../common/NotificationApi"
import { createOrder, findProductById, updateProductStock } from "../common/OrderDb"
import { processPayment } from "../common/PaymentApi"
import { AsyncRequestHandler } from "../common/RequestHandler"
import { BadRequest, Created, InternalServerError, NotFound, PaymentRequired, ServiceUnavailable } from "../common/Response"
import { findUserById } from "../common/UserDb"

export const processOrder: AsyncRequestHandler = async (req) => {
  try {
    // Validate request body for userId and order items
    if (!req.body.userId || !req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
      return BadRequest({ body: { error: 'User ID and at least one order item are required.' } })
    }

    // Validate and parse order items
    let orderItems = []
    try {
      orderItems = req.body.items.map((item: any) => {
        if (!item.productId || !item.quantity || item.quantity <= 0) {
          throw new Error('Invalid order item')
        }
        return {
          productId: item.productId,
          quantity: item.quantity,
        }
      })
    } catch (itemError) {
      return BadRequest({ body: { error: 'Invalid order items provided.' } })
    }

    // Retrieve user details from the database
    let user
    try {
      user = await findUserById(req.body.userId)
      if (!user) {
        return NotFound({ body: { error: 'User not found.' } })
      }
    } catch (dbError) {
      return InternalServerError({ body: { error: 'Database error retrieving user.' } })
    }

    // Check inventory for each order item
    for (const item of orderItems) {
      try {
        const product = await findProductById(item.productId)
        if (!product) {
          return NotFound({ body: { error: `Product ${item.productId} not found.` } })
        }
        if (product.stock < item.quantity) {
          return BadRequest({ body: { error: `Insufficient stock for product ${item.productId}.` } })
        }
      } catch (dbError) {
        return InternalServerError({ body: { error: `Database error checking product ${item.productId}.` } })
      }
    }

    // Calculate the total order amount
    let orderTotal = 0
    try {
      for (const item of orderItems) {
        const product = await findProductById(item.productId)
        orderTotal += product!.price * item.quantity
      }
    } catch (calcError) {
      return InternalServerError({ body: { error: 'Error calculating order total.' } })
    }

    // Process payment via a third-party payment gateway
    let paymentId
    try {
      paymentId = await processPayment({
        userId: user.id,
        amount: orderTotal,
        paymentMethod: req.body.paymentMethod
      })
      if (!paymentId) {
        return PaymentRequired({ body: { error: 'Payment failed.' } })
      }
    } catch (paymentError) {
      return ServiceUnavailable({ body: { error: 'Payment service unavailable.' } })
    }

    // Create an order record in the database
    let orderRecord
    try {
      orderRecord = await createOrder({
        userId: user.id,
        items: orderItems,
        total: orderTotal,
        paymentId,
        createdAt: new Date(),
      })
    } catch (orderError) {
      return InternalServerError({ body: { error: 'Error creating order record.' } })
    }

    // Send order confirmation email
    try {
      await sendOrderNotification({
        userId: user.id,
        orderId: orderRecord.id,
        orderTotal: orderTotal
      })
    } catch (emailError) {
      // Non-critical: order processing succeeded even if the email fails.
    }

    return Created(({ body: { message: 'Order processed successfully.', order: orderRecord } }))
  } catch (error) {
    return InternalServerError({ body: { error: 'An unexpected error occurred while processing the order.' } })
  }
}
