export type Response = {
  statusCode: number
  body?: any
}

export const Ok = (details: Omit<Response, 'statusCode'> = {}): Response => ({
  statusCode: 200,
  ...details,
})

export const Created = (details: Omit<Response, 'statusCode'> = {}): Response => ({
  statusCode: 201,
  ...details,
})

export const BadRequest = (details: Omit<Response, 'statusCode'> = {}): Response => ({
  statusCode: 400,
  ...details,
})

export const PaymentRequired = (details: Omit<Response, 'statusCode'> = {}): Response => ({
  statusCode: 402,
  ...details,
})

export const NotFound = (details: Omit<Response, 'statusCode'> = {}): Response => ({
  statusCode: 404,
  ...details,
})

export const InternalServerError = (details: Omit<Response, 'statusCode'> = {}): Response => ({
  statusCode: 500,
  ...details,
})

export const ServiceUnavailable = (details: Omit<Response, 'statusCode'> = {}): Response => ({
  statusCode: 503,
  ...details,
})
