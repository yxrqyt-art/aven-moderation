export class ApplicationError extends Error {
  public constructor(
    message: string,
    public readonly userMessage: string = 'An unexpected error occurred.',
  ) {
    super(message);
    this.name = new.target.name;
  }
}
