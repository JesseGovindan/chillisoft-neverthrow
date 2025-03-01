import { UserTemplate } from '../common/UserDb'
import { addUser } from '../exercises/exercise-1'

describe('addUser', () => {
  function createValidUser() {
    return {
      name: 'John Doe',
      email: 'john.doe@yahoo.com',
      password: 'DoeADeerAFemailDeer',
    }
  }

  function createValidUserWithout<T extends keyof UserTemplate>(key: T) {
    const user: any = createValidUser()
    delete user[key]
    return user
  }

  it('returns status 201 when all user field provided in request', () => {
    // Arrange
    const user = createValidUser()
    // Act
    const response = addUser({ body: user })
    // Assert
    expect(response.statusCode).toEqual(201)
  })

  it('returns status 400 when request body is not an object', () => {
    // Act
    const response = addUser({ body: '' })
    // Assert
    expect(response).toEqual({
      statusCode: 400,
      body: 'Unable to create new user. Body of request is not an object.',
    })
  })

  // Remove this skip when working on exercise-1
  describe.skip('extra validation', () => {
    it('returns status 400 when request body is missing email', () => {
      // Arrange
      const user: any = createValidUserWithout('email')
      // Act
      const response = addUser({ body: user })
      // Assert
      expect(response).toEqual({
        statusCode: 400,
        body: 'Unable to create new user. No email provided.',
      })
    })

    it('returns status 400 when request body is missing password', () => {
      // Arrange
      const user: any = createValidUserWithout('password')
      // Act
      const response = addUser({ body: user })
      // Assert
      expect(response).toEqual({
        statusCode: 400,
        body: 'Unable to create new user. No password provided.',
      })
    })

    it('returns status 400 when request body is missing name', () => {
      // Arrange
      const user: any = createValidUserWithout('name')
      // Act
      const response = addUser({ body: user })
      // Assert
      expect(response).toEqual({
        statusCode: 400,
        body: 'Unable to create new user. No name provided.',
      })
    })
  })
})
