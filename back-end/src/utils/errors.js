// Classe d'erreur personnalisée pour les erreurs de validation
export class ValidationError extends Error {
  constructor(message, errors = []) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

// Classe d'erreur personnalisée pour les erreurs d'authentification
export class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

// Classe d'erreur personnalisée pour les erreurs d'autorisation
export class AuthorizationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

// Classe d'erreur personnalisée pour les erreurs de ressource non trouvée
export class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
}

// Classe d'erreur personnalisée pour les erreurs de conflit
export class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConflictError';
  }
}

// Fonction utilitaire pour créer une réponse d'erreur standardisée
export function createErrorResponse(status, message, errorCode, details = null) {
  return {
    status,
    body: {
      success: false,
      message,
      error: errorCode,
      ...(details && { details })
    }
  };
}