// Make whatever changes this to class to help you implement the functionality required
export class Result<V, E> {
  private constructor(private isOk: boolean, private value?: V, private error?: E) {
  }

  static ok<V, E>(value: V) {
    return new Result<V, E>(true, value, undefined)
  }

  static err<V, E>(error: E) {
    return new Result<V, E>(false, undefined, error)
  }

  match<R>(handleValue: (value: V) => R, handleError: (error: E) => R): R {
  }
}
