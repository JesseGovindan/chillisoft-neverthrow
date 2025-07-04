// Make whatever changes this to class to help you implement the functionality required
export class Result<V, E> {
  private constructor(
    private isOk: boolean,
    private value?: V,
    private error?: E
  ) {}

  static ok<V>(value: V) {
    return new Result<V, never>(true, value, undefined);
  }

  static err<E>(error: E) {
    return new Result<never, E>(false, undefined, error);
  }

  match<R>(handleValue: (value: V) => R, handleError: (error: E) => R): R {
    return this.isOk ? handleValue(this.value!) : handleError(this.error!);
  }

  map<R>(onValue: (value: V) => R): Result<R, E> {
    return this.match<Result<R, E>>(
      (value) => Result.ok(onValue(value)),
      Result.err
    );
  }

  andThen<R, E2>(onValue: (value: V) => Result<R, E2>): Result<R, E | E2> {
    return this.match<Result<R, E | E2>>(onValue, Result.err);
  }
}
