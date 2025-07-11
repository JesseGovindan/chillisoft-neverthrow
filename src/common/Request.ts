export type Request = {
  body: any
}

export type AuthenticatedRequest = {
  body: any
  session: Session
}

export type Session = {
  userId: string
}
