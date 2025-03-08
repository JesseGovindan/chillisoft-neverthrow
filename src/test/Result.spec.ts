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
})
