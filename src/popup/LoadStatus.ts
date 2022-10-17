export abstract class LoadStatus {}

export class LoadStatusLoading extends LoadStatus {
  /// When a request for the resource is in-flight.
}

export class LoadStatusDone extends LoadStatus {
  /// When the resource has been successfully loaded.
}

export class LoadStatusError extends LoadStatus {
  /// Failed to load the resource.

    readonly error: unknown

    constructor (error: unknown) {
      super()
      this.error = error
    }
}

export class LoadStatusNotBegun extends LoadStatus {
  /// When the resource has not begun loading for the first time.
}
