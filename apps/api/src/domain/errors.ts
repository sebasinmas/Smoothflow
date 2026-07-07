/**
 * Jerarquía de errores de dominio, sin semántica del protocolo de entrega (HTTP).
 * El mapeo a códigos de estado ocurre en el adaptador HTTP (error-handler).
 */
export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class NotFoundError extends DomainError {}
export class ConflictError extends DomainError {}
export class ValidationError extends DomainError {}
export class AuthError extends DomainError {}       // no autenticado
export class ForbiddenError extends DomainError {}  // sin permiso
export class UnavailableError extends DomainError {} // dependencia no disponible (503)
