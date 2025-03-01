// Make whatever changes this to class to help you implement the functionality required
export class Result<V, E> {
  static ok<V>(value: V) {
  }

  static err<E>(error: E) {
  }

  match<R>(handleValue: (value: V) => R, handleError: (error: E) => R) {
  }
}
