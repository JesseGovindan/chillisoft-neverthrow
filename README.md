# Intro
This deliberate practice is meant to teach the use of the Result class.
The Result class is a convenient helper class for wrapping the results of operations that could fail.

Begin by creating a branch off of `main` with your name i.e `jesse-dp`

# Exercise 1
To start. Look at the `Result.spec.ts file` and the `Result.ts` file.
Implement the Result class so that the tests pass.

Once the Result.spec tests are passing, take a look at `exercise-1.spec.ts` and `exercise-1.ts`.
Use the Result class and the `match` method to refactor and neaten the code within `exercise-1.ts`.
Use the tests to help verify your changes and ensure the new requirements have been met!

All the best!

P.S Do not commit changes to the `Result.spec.ts` file

When you are done with this exercise, merge the branch `exercise-2` into your branch and read this file again.

# Exercise 2
In this lesson we will be implementing the `map` method on the Result class.
Map, is a method that applies a function to the `ok` value but does nothing if it's an `err`
This allows us to apply a transformation to a result without worrying if the result was an error.

Lets look at the `Result.spec.ts` and the `Result.ts` files again.
You should see some new tests that define the behaviour for the `map` method.

Once your tests are passing, try to refactor the `exercise-2.ts` file using the `map` method.
Use the tests to check if the code still behaves as it should.

When you're done merge the branch `exercise-3` into your branch and read this file again.
