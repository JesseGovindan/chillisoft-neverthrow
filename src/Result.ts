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

  match<Result>(handleValue: (value: V) => Result, handleError: (error: E) => Result)  {
    return this.isOk ?
      handleValue(this.value as V) :
      handleError(this.error as E)
  }

  map<R>(onValue: (value: V) => R): Result<R, E> {
    return this.isOk ?
      new Result<R, E>(this.isOk, onValue(this.value!), undefined) :
      new Result<R, E>(false, undefined, this.error)
  }
}
