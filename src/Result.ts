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
      return handleValue(this.value!);
    } else {
      return handleError(this.error!);
    }
  }

  map<R>(onValue: (value: V) => R): Result<R, E> {
    if (this.isOk) {
      return Result.ok<R>(onValue(this.value!));
    } else {
      return Result.err<E>(this.error!);
    }
  }

  andThen<R, E2>(onValue: (value: V) => Result<R, E2>): Result<R, E | E2> {
    if (this.isOk) {
      return onValue(this.value!);
    } else {
      return Result.err<E>(this.error!);
    }
  }
}
