export type UserTemplate = {
  email: string
  name: string
  password: string
}

export type User = {
  id: string
  name: string
}

export function createUser(userTemplate: UserTemplate) {
  // Just for demonstration purposes
}

export function findUserById(id: string): Promise<User | undefined> {
  return Promise.resolve(undefined)
}
