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

# Exercise 3
Now that we know about the `match` and `map` methods, we may come across a situation where we need to map a result
using a function that returns a Result instance.
Handling this situation will cause us to end up with nested results (a structure like `Result<Result<T, E>, E>`).
This makes our code complex, especially if theres more processing that needs to be done.
Instead of manually handling these nested layers, we can use the `andThen` method to work with operations that return a Result.
This method works very similarly to `map` but handles the inner `Result` type correctly.

Lets look at the `Result.spec.ts` and the `Result.ts` files again.
You should see some new tests that define the behaviour for the `andThen` method.

Once your tests are passing, try to refactor the `exercise-3.ts` file using the `andThen` method.
Use the tests to check if the code still behaves as it should.

# Exercise 4
Great job on getting to stage. You've been able to implement a usuable Result type. In doing so you now understand how
the Result pattern works and how one may implement it. In this exercise we will be dropping our own implementation of Result
for the battle tested and feature rich library `neverthrow`.
This library provides its own implementation of the Result type as well as a host of other useful utilities. 

For this exercise, begin by first running `npm i` to get `neverthrow` installed.
Then look at `exercise-4.ts` and `exercise-4.spec.ts`.
The goal is to use your understanding of the Result type pattern to refactor and simplify the code in `exercise-4.ts`

Refer to the `neverthrow` github page `https://github.com/supermacro/neverthrow` for documentation
