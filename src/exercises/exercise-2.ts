import { getUserCart, getDiscountForCode, updateUserCart, Cart } from "../common/CartDb";
import { AuthenticatedRequestHandler } from "../common/RequestHandler";
import { BadRequest, Ok } from "../common/Response";
import { Result } from "../Result";

// The 'OK' portion of the 'match' method below is becoming quite large.
// It is doing a bunch of business logic and http response generation all together.
// Refactor this code to make use of Result's map method to simplify the cart processing and separate the business logic
// from the http response generation.
//
// hint: Your final match call should be no longer than 5 - 6 lines. It is even possible to get it down to 1 - 2 lines!
export const applyDiscountCode: AuthenticatedRequestHandler = (request) => {
  return validateDiscountCode(request.body)
    .map(
      discount => createDiscountedCart(request.session.userId, discount)
    ).match(
      discountedCart => Ok({ body: discountedCart }),
      createErrorResponse
    );
}

function validateDiscountCode(discountCode: any): Result<number, string> {
  if (typeof discountCode !== 'string') {
    return Result.err('Invalid discount code provided')
  }

  const discount = getDiscountForCode(discountCode)

  if (!discount) {
    return Result.err('No discount found for the given discount code')
  }

  return Result.ok(discount)
}

function createDiscountedCart(userId: string, discount: number): Cart {
  const userCart = getUserCart(userId);
  const discountedCart = userCart.map(item => ({
    ...item,
    discount: discount,
  }));
  updateUserCart(userId, discountedCart);
  return discountedCart;
}

function createErrorResponse(validationError: string) {
  return BadRequest({ body: `Unable to apply discount code. ${validationError}.` })
}
