// Make whatever changes this to class to help you implement the functionality required
export class Result<V, E> {
  private constructor(private isOk: boolean, private value?: V, private error?: E) {
  }

  static ok<V>(value: V) {
    return new Result<V, never>(true, value, undefined)
  }

  static err<E>(error: E) {
    return new Result<never, E>(false, undefined, error)
  }

  match<R>(handleValue: (value: V) => R, handleError: (error: E) => R): R {
    if (this.isOk) {
      return handleValue(this.value as V)
    } else {
      return handleError(this.error as E)
    }
  }

    map<R>(f: (value: V) => R): Result<R, E> {
    if (this.isOk) {
      return Result.ok(f(this.value as V))
    } else {
      return Result.err(this.error as E)
    }
  }

    andThen<R, E2>(f: (value: V) => Result<R, E2>): Result<R, E | E2> {
    if (this.isOk) {
      return f(this.value as V)
    } else {
      return Result.err(this.error as E)
    }
  }
}
