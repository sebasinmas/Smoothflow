/**
 * Error de aplicación con código HTTP para mapeo en el adaptador HTTP.
 * Los errores de negocio puros viven en domain/scheduling y domain/staff-rules.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}
