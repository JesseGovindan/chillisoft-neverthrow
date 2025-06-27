import { RequestHandler } from "../common/RequestHandler";
import { BadRequest, Created } from "../common/Response";
import { createUser, UserTemplate } from "../common/UserDb";
import { Result } from "../Result";

// Refactor this function so that it returns a better error responses.
// i.e 'Unable to create user. Invalid email address'
// Make use of the Result type, and its 'match' method, to simplify error handling in this function
//
// hint: You refactored code should not need a try-catch or a check if the userTemplate is defined :)
// hint: Enable the "extra validation" tests in the exercise-1.spec.ts to verify your work
export const addUser: RequestHandler = (request) => {
  return validateUserTemplate(request.body).match(
    (val) => {
      createUser(val);
      return Created();
    },
    (err) => {
      return BadRequest({ body: `Unable to create new user. ${err}` });
    }
  );
};

function validateUserTemplate(possibleUser: any): Result<UserTemplate, string> {
  if (typeof possibleUser !== "object") {
    return Result.err("Body of request is not an object.");
  }

  const { email, name, password } = possibleUser;

  if (!isAValidString(email)) {
    return Result.err("No email provided.");
  }

  if (!isAValidString(name)) {
    return Result.err("No name provided.");
  }

  if (!isAValidString(password)) {
    return Result.err("No password provided.");
  }

  return Result.ok({
    email,
    name,
    password,
  });
}

function isAValidString(value: any): value is string {
  return typeof value === "string" && !!value;
}
