import { RequestHandler } from "../common/RequestHandler";
import { BadRequest, Created } from "../common/Response";
import { createUser } from "../common/UserDb";
import { Result } from "../Result";

// Refactor this function so that it returns a better error responses.
// i.e 'Unable to create user. Invalid email address'
// Make use of the Result type, and its 'match' method, to simplify error handling in this function
//
// hint: You refactored code should not need a try-catch or a check if the userTemplate is defined :)
// hint: Enable the "extra validation" tests in the exercise-1.spec.ts to verify your work
export const addUser: RequestHandler = (request) => {
  return validateUserTemplate(request.body).match(
    (response) => {
      createUser(response!);
      return Created();
    },
    (error) => {
      return BadRequest({ body: error });
    }
  );
};

const validateUserTemplate = (
  possibleUser: any
): Result<{ name: string; email: string; password: string }, string> => {
  if (typeof possibleUser !== "object") {
    return Result.err("Unable to create new user. Body of request is not an object.");
  }


  const { email, name, password } = possibleUser;

  if(!email) {
    return Result.err('Unable to create new user. No email provided.')
  }

  if(!name){
    return Result.err('Unable to create new user. No name provided.')
  }

  if(!password){
    return Result.err('Unable to create new user. No password provided.')
  }

  if (!isAValidString(email)) {
    return Result.err("Invalid string");
  }

  if (!isAValidString(name)) {
    return Result.err("Invalid string");
  }

  if (!isAValidString(password)) {
    return Result.err("Invalid string");
  }

  return Result.ok({
    email,
    name,
    password,
  });
};

const isAValidString = (value: any): value is string => {
  return typeof value === "string" && !!value;
}
