export type Request = {
  body?: any
  query?: Record<string, string>
}

export type AuthenticatedRequest = {
  body: any
  session: Session
}

export type Session = {
  userId: string
}
