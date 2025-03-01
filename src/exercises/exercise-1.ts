import { RequestHandler } from "../common/RequestHandler";
import { BadRequest, Created } from "../common/Response";
import { createUser } from "../common/UserDb";

// Refactor this function so that it returns a better error responses.
// i.e 'Unable to create user. Invalid email address'
// Make use of the Result type, and its 'match' method, to simplify error handling in this function
//
// hint: You refactored code should not need a try-catch or a check if the userTemplate is defined :)
// hint: Enable the "extra validation" tests in the exercise-1.spec.ts to verify your work
export const addUser: RequestHandler = (request) => {
  try {
    const userTemplate = validateUserTemplate(request.body)

    if (!userTemplate) {
      return BadRequest({ body: 'Unable to create new user. Invalid user details provided.' })
    }

    createUser(userTemplate)

    return Created()
  } catch {
    return BadRequest({ body: 'Unable to create new user. Body of request is not an object.' })
  }
}

function validateUserTemplate(possibleUser: any) {
  if (typeof possibleUser !== 'object') {
    throw new Error('Invalid body')
  }

  const { email, name, password } = possibleUser

  if (!isAValidString(email)) {
    return undefined
  }

  if (!isAValidString(name)) {
    return undefined
  }

  if (!isAValidString(password)) {
    return undefined
  }

  return {
    email,
    name,
    password,
  }
}

function isAValidString(value: any): value is string {
  return typeof value === 'string' && !!value
}
