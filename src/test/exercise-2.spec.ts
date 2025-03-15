import { applyDiscountCode } from '../exercises/exercise-2'
import * as cartDb from '../common/CartDb'
import { randomBytes } from 'crypto'
import { BadRequest, Ok } from '../common/Response'

describe('applyDiscountCode', () => {
  const getCartMock = vi.spyOn(cartDb, 'getUserCart')
  const getDiscountForCodeMock = vi.spyOn(cartDb, 'getDiscountForCode')
  const updateUserCartMock = vi.spyOn(cartDb, 'updateUserCart')

  it("returns the user's cart with the discount applied to every item", () => {
    // Arrange
    const userCart = [createCartItem({ discount: 0 }), createCartItem({ discount: 0 })] 
    getCartMock.mockReturnValue(userCart)
    const discount = 0.23
    getDiscountForCodeMock.mockReturnValue(discount)
    // Act
    const response = sut()
    // Assert
    expect(response).toEqual(Ok({
      body: [
        {
          ...userCart[0],
          discount,
        },
        {
          ...userCart[1],
          discount,
        },
      ],
    }))
  })

  it(`updates the user's cart with discount applied to every item`, () => {
    // Arrange
    const userCart = [createCartItem({ discount: 0 }), createCartItem({ discount: 0 })] 
    getCartMock.mockReturnValue(userCart)
    const discount = 0.23
    getDiscountForCodeMock.mockReturnValue(discount)
    const userId = randomString()
    // Act
    sut({ userId })
    // Assert
    expect(updateUserCartMock).toHaveBeenCalledWith(userId, [
      {
        ...userCart[0],
        discount,
      },
      {
        ...userCart[1],
        discount,
      },
    ])
  })

  it('returns a BadRequest when body of request is not a string', () => {
    // Act
    const result = sut({ discountCode: 123 })
    // Assert
    expect(result).toEqual(BadRequest({ body: 'Unable to apply discount code. Invalid discount code provided.' }))
  })

  it('returns a BadRequest when discount code is not valid', () => {
    // Arrange
    getDiscountForCodeMock.mockReturnValue(0)
    // Act
    const result = sut({ discountCode: randomString() })
    // Assert
    expect(result).toEqual(BadRequest({
      body: 'Unable to apply discount code. No discount found for the given discount code.'
    }))
  })

  function sut(params: { discountCode?: any; userId?: string } = {}) {
    const { discountCode = randomString(), userId = randomString() } = params
    return applyDiscountCode({ body: discountCode, session: { userId } })
  }

  function randomString() {
    return randomBytes(4).toString('hex')
  }

  function createCartItem(overrides: Partial<cartDb.Item> = {}): cartDb.Item {
    return {
      discount: 10,
      name: 'Glasses',
      price: 10,
      quantity: 2,
      ...overrides,
    }
  }
})
