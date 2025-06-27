import { err, errAsync, fromPromise, ok, okAsync, Result, ResultAsync } from "neverthrow"
import { sendOrderNotification } from "../common/NotificationApi"
import { createOrder, findProductById } from "../common/OrderDb"
import { processPayment } from "../common/PaymentApi"
import { AsyncRequestHandler } from "../common/RequestHandler"
import { BadRequest, Created, InternalServerError, NotFound, PaymentRequired, ServiceUnavailable } from "../common/Response"
import { findUserById, User } from "../common/UserDb"
import { Response } from "../common/Response"
import { Request } from "../common/Request"

function validateRequestBody(req: Request): Result<any, Response> {
  if (!req.body.userId || !req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
    return err(BadRequest({ body: { error: 'User ID and at least one order item are required.' } }))
  }
  return ok(req);
}

function validateAndParseOrderItems(body: any): Result<any[], Response> {
  let orderItems: Result<any, Response>[] = body.items.map(
    (item: any) => { validateOrderItem(item) });

  return Result.combine(orderItems);
}

function validateOrderItem(item: any): Result<any, Response> {
  if (!item.productId || !item.quantity || item.quantity <= 0) {
    return err(BadRequest({ body: { error: 'Invalid order items provided.' } }));
  }
  return ok({
    productId: item.productId,
    quantity: item.quantity,
  });
}

function getUserDetails(body: any): ResultAsync<User, Response> {
  return ResultAsync.fromPromise(findUserById(body.userId), () => {
    return InternalServerError({ body: { error: 'Database error retrieving user.' } });

  }).andThen(user => {
    if (!user) {
      return err(NotFound({ body: { error: 'User not found.' } }));
    }
    return ok(user);
  });
}

function checkInventory(item: any): ResultAsync<any, Response> {
  return ResultAsync.fromPromise(findProductById(item.productId), () => {
    return InternalServerError({ body: { error: `Database error checking product ${item.productId}.` } })

  }).andThen(product => {
    if (!product) {
      return err(NotFound({ body: { error: `Product ${item.productId} not found.` } }));
    }
    return ok(product);

  }).andThen(product => {
    if (product.stock < item.quantity) {
      return err(BadRequest({ body: { error: `Insufficient stock for product ${item.productId}.` } }));
    }
    return ok(product);
  });
}

export const processOrder: AsyncRequestHandler = async (req) => {
  try {
    // Validate request body for userId and order items
    let orderItems = validateRequestBody(req)
      .andThen(validateAndParseOrderItems)
      .map(checkInventory)
      //andThen calculate total
      //andThen process payments
      //andThen create order record
      //andThen send email

    // Retrieve user details from the database
    let user = getUserDetails(req.body);

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
