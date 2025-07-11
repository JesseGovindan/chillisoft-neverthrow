import { err, errAsync, ok, okAsync, Result, ResultAsync } from "neverthrow"
import { sendOrderNotification } from "../common/NotificationApi"
import { createOrder, findProductById, OrderItem } from "../common/OrderDb"
import { PaymentId, processPayment } from "../common/PaymentApi"
import { AsyncRequestHandler } from "../common/RequestHandler"
import { BadRequest, Created, InternalServerError, NotFound, PaymentRequired, ServiceUnavailable } from "../common/Response"
import { findUserById, User } from "../common/UserDb"
import { Response } from "../common/Response"
import { Request } from "../common/Request"

export type OrderRequestBody = {
  userId: string,
  items: OrderItem[],
  paymentMethod: string,
}

export type OrderRecord = {
  id: string;
}

// export const processOrder: AsyncRequestHandler = async (req) => {
//   let orderRecordResult = validateRequestBody(req)
//     .asyncAndThen(body => validateAndParseOrderItems(body)
//       .asyncAndThen(items => checkInventory(items)
//         .andThen(orderItems => calculateTotalOrderAmount(orderItems)
//           .andThen(orderTotal => getUserDetails(body)
//             .andThen(user => processPaymentViaGateway(orderTotal, user, body)
//               .andThen(paymentId => createOrderRecord(user, orderItems, orderTotal, paymentId)
//                 .andTee(orderRecord => sendEmail(user, orderRecord, orderTotal))))))));

//   return orderRecordResult.match(
//     (orderRecord) => Created(({ body: { message: 'Order processed successfully.', order: orderRecord } })),
//     (error) => error
//   );
// }

export const processOrder: AsyncRequestHandler = async (req) => {
  let body = validateRequestBody(req);
  let user = body.andThen(getUserDetails);

  let items = body
    .andThen(validateAndParseOrderItems)
    .andThen(checkInventory);

  let orderTotal = items.andThen(calculateTotalOrderAmount);

  let paymentId = ResultAsync.combine([orderTotal, user, body])
    .andThen(result => processPaymentViaGateway(...result));

  let orderRecordResult = ResultAsync.combine([user, items, orderTotal, paymentId])
    .andThen(result => createOrderRecord(...result));

  ResultAsync.combine([user, orderRecordResult, orderTotal])
    .andThen(result => sendEmail(...result));

  return orderRecordResult.match(
    (orderRecord) => Created(({ body: { message: 'Order processed successfully.', order: orderRecord } })),
    (error) => error
  );
}

function validateRequestBody(req: Request): ResultAsync<OrderRequestBody, Response> {
  return req.body.userId && req.body.items && Array.isArray(req.body.items) && req.body.items.length !== 0
    ? okAsync(req.body)
    : errAsync(BadRequest({ body: { error: 'User ID and at least one order item are required.' } }));
}

function validateAndParseOrderItems(body: OrderRequestBody): ResultAsync<OrderItem[], Response> {
  let orderItems = body.items.map(
    item => validateOrderItem(item));
  return ResultAsync.combine(orderItems);
}

function validateOrderItem(item: OrderItem): ResultAsync<OrderItem, Response> {
  return item.productId && item.quantity && item.quantity > 0
    ? okAsync({
      productId: item.productId,
      quantity: item.quantity
    })
    : errAsync(BadRequest({ body: { error: 'Invalid order items provided.' } }));
}

function getUserDetails(body: OrderRequestBody): ResultAsync<User, Response> {
  return ResultAsync.fromPromise(
    findUserById(body.userId),
    () => InternalServerError({ body: { error: 'Database error retrieving user.' } })

  ).andThen(user => user
    ? ok(user)
    : err(NotFound({ body: { error: 'User not found.' } }))
  );
}

function checkInventory(items: OrderItem[]): ResultAsync<OrderItem[], Response> {
  return ResultAsync.combine(
    items.map(item =>
      ResultAsync.fromPromise(
        findProductById(item.productId),
        () => InternalServerError({ body: { error: `Database error checking product ${item.productId}.` } })

      ).andThen(product => product
        ? ok(product)
        : err(NotFound({ body: { error: `Product ${item.productId} not found.` } }))

      ).andThen(product => product.stock >= item.quantity
        ? ok(item)
        : err(BadRequest({ body: { error: `Insufficient stock for product ${item.productId}.` } }))
      )
    )
  );
}

function calculateTotalOrderAmount(items: OrderItem[]): ResultAsync<number, Response> {
  let priceResults = items.map(item =>
    ResultAsync.fromPromise(
      findProductById(item.productId),
      () => InternalServerError({ body: { error: 'Error calculating order total.' } })

    ).andThen(product => product
      ? ok(product.price * item.quantity)
      : err(InternalServerError({ body: { error: 'Error calculating order total.' } }))
    )
  );

  return ResultAsync.combine(priceResults).map(
    prices => prices.reduce(
      (orderTotal, price) => orderTotal + price, 0));
}

function processPaymentViaGateway(orderTotal: number, user: User, body: OrderRequestBody): ResultAsync<PaymentId, Response> {
  return ResultAsync.fromPromise(
    processPayment({
      userId: user.id,
      amount: orderTotal,
      paymentMethod: body.paymentMethod
    }),
    () => ServiceUnavailable({ body: { error: 'Payment service unavailable.' } })

  ).andThen(paymentId => paymentId
    ? ok(paymentId)
    : err(PaymentRequired({ body: { error: 'Payment failed.' } }))
  );
}

function createOrderRecord(user: User, orderItems: OrderItem[], orderTotal: number, paymentId: PaymentId): ResultAsync<OrderRecord, Response> {
  return ResultAsync.fromPromise(
    createOrder({
      userId: user.id,
      items: orderItems,
      total: orderTotal,
      paymentId,
      createdAt: new Date(),
    }),
    () => InternalServerError({ body: { error: 'Error creating order record.' } })
  );
}

function sendEmail(user: User, orderRecord: OrderRecord, orderTotal: number): ResultAsync<void, void> {
  return ResultAsync.fromPromise(
    sendOrderNotification({
      userId: user.id,
      orderId: orderRecord.id,
      orderTotal: orderTotal
    }),
    () => { });
}