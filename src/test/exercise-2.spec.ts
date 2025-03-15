import { applyDiscountCode } from '../exercises/exercise-2'
import * as cartDb from '../common/CartDb'
import { randomBytes } from 'crypto'
import { Ok } from '../common/Response'

describe('applyDiscountCode', () => {
  const getCartMock = vi.spyOn(cartDb, 'getUserCart')
  const getDiscountForCodeMock = vi.spyOn(cartDb, 'getDiscountForCode')

  it("returns the user's cart with the discount applied to every item", () => {
    // Arrange
    const userCart = [createCartItem({ discount: 0 }), createCartItem({ discount: 0 })] 
    getCartMock.mockReturnValue(userCart)
    const discount = 0.23
    getDiscountForCodeMock.mockReturnValue(discount)
    // Act
    const response = sut(randomString())
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

  function sut(discountCode: string, userId: string = randomString()) {
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
