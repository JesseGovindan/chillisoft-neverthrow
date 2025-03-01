export type Response = {
  statusCode: number
  body?: any
}

export const Created = (details: Omit<Response, 'statusCode'> = {}): Response => ({
  statusCode: 201,
  ...details,
})

export const BadRequest = (details: Omit<Response, 'statusCode'> = {}): Response => ({
  statusCode: 400,
  ...details,
})

