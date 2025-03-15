import { describe } from "vitest"
import { Result } from "../Result"

describe(Result.name, () => {
  describe('match', () => {
    it('only calls value handler when result is OK', () => {
      // Arrange
      const valueHandler = vi.fn()
      const errorHandler = vi.fn()
      const sut = Result.ok(3)
      // Act
      sut.match(valueHandler, errorHandler)
      // Assert
      expect(valueHandler).toHaveBeenCalledWith(3)
      expect(errorHandler).not.toHaveBeenCalled()
    })

    it('returns the value from the value handler', () => {
      // Arrange
      const valueHandler = () => 5
      const errorHandler = () => 6
      const sut = Result.ok(3)
      // Act
      const result = sut.match(valueHandler, errorHandler)
      // Assert
      expect(result).toBe(5)
    })

    it('only calls error handler when result is ERROR', () => {
      // Arrange
      const valueHandler = vi.fn()
      const errorHandler = vi.fn()
      const sut = Result.err(3)
      // Act
      sut.match(valueHandler, errorHandler)
      // Assert
      expect(valueHandler).not.toHaveBeenCalled()
      expect(errorHandler).toHaveBeenCalledWith(3)
    })

    it('returns the value from the error handler', () => {
      // Arrange
      const valueHandler = () => 5
      const errorHandler = () => 6
      const sut = Result.err(3)
      // Act
      const result = sut.match(valueHandler, errorHandler)
      // Assert
      expect(result).toBe(6)
    })
  })

  function getValue<T>(result: Result<T, any>) {
    return result.match(
      receivedValue => receivedValue, 
      () => { throw new Error('Expected to be ok, but was error') },
    )
  }

  function getError<E>(result: Result<any, E>) {
    return result.match(
      () => { throw new Error('Expected to be error, but was ok') },
      error => error, 
    )
  }

  describe('map', () => {
    // HINT: The function signature of map should be:
    // map<R>(onValue: (value: V) => R): Result<R, E>

    it('calls provided function when result is OK', () => {
      // Arrange
      const mappingFunction = vi.fn()
      const sut = Result.ok(3)
      // Act
      sut.map(mappingFunction)
      // Assert
      expect(mappingFunction).toHaveBeenCalledWith(3)
    })

    it('maps the ok value of the Result using the provided function', () => {
      // Arrange
      const sut = Result.ok(3)
      // Act
      const result = sut.map(value => value * 2)
      // Assert
      expect(getValue(result)).toBe(6)
    })

    it('does not call the provided function when result is ERROR', () => {
      // Arrange
      const mappingFunction = vi.fn()
      const sut = Result.err(3)
      // Act
      sut.map(mappingFunction)
      // Assert
      expect(mappingFunction).not.toHaveBeenCalled()
    })

    it('keeps the error of the Result type', () => {
      // Arrange
      const sut: Result<number, number> = Result.err(3)
      // Act
      const result = sut.map(value => value * 2)
      // Assert
      expect(getError(result)).toBe(3)
    })
  })
})
