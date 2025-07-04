// Make whatever changes this to class to help you implement the functionality required
export class Result<V, E> {
  private constructor(
    private isOk: boolean,
    private value?: V,
    private error?: E
  ) {}

  static ok<V, E>(value: V): Result<V, E> {
    return new Result<V, E>(true, value, undefined)
  }

  static err<V, E>(error: E): Result<V, E> {
    return new Result<V, E>(false, undefined, error)
  }

  match<R>(handleValue: (value: V) => R, handleError: (error: E) => R): R {
    if (this.isOk) {
      return handleValue(this.value as V)
    } else {
      return handleError(this.error as E)
    }
  }

  map<R>(onValue: (value: V) => R): Result<R, E> {
    if (this.isOk) {
      const newValue = onValue(this.value as V)
      return Result.ok<R, E>(newValue)
    } else {
      return Result.err<R, E>(this.error as E)
    }
  }
}
