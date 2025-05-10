import Joi from 'joi';

/**
 * Schéma de validation pour les données de connexion
 * @param {Object} data - Données à valider
 * @returns {Object} Résultat de la validation
 */
export const validateLoginInput = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .email({ minDomainSegments: 2 })
      .required()
      .messages({
        'string.email': 'Veuillez fournir une adresse email valide',
        'string.empty': 'L\'email ne peut pas être vide',
        'any.required': 'L\'email est requis'
      }),
    password: Joi.string()
      .required()
      .messages({
        'string.empty': 'Le mot de passe ne peut pas être vide',
        'any.required': 'Le mot de passe est requis'
      }),
    rememberMe: Joi.boolean().default(false)
  });

  return schema.validate(data, { abortEarly: false });
};



/**
 * Valide les données d'inscription
 * @param {Object} data - Données d'inscription à valider
 * @returns {Object} Résultat de la validation
 */
export const validateRegisterInput = (data) => {
  const schema = Joi.object({
    fullName: Joi.string().min(2).max(100).required()
      .messages({
        'string.empty': 'Le nom est requis',
        'string.min': 'Le nom doit contenir au moins {#limit} caractères',
        'string.max': 'Le nom ne peut pas dépasser {#limit} caractères',
        'any.required': 'Le nom est requis'
      }),
    
    email: Joi.string().email().allow('').optional()
      .messages({
        'string.email': 'Format d\'email invalide'
      }),
    
    phone: Joi.string().pattern(/^(\+\d{1,3}[- ]?)?\d{9,10}$/).allow('').optional()
      .messages({
        'string.pattern.base': 'Format de téléphone invalide'
      }),
    
    password: Joi.string().min(8).required()
      .messages({
        'string.empty': 'Le mot de passe est requis',
        'string.min': 'Le mot de passe doit contenir au moins {#limit} caractères',
        'any.required': 'Le mot de passe est requis'
      }),
    
    // Rendre confirmPassword optionnel
    confirmPassword: Joi.string().valid(Joi.ref('password')).optional()
      .messages({
        'any.only': 'Les mots de passe ne correspondent pas'
      })
  }).custom((value, helpers) => {
    // Vérifier qu'au moins un identifiant est fourni (email ou téléphone)
    if (!value.email && !value.phone) {
      return helpers.error('custom.missingIdentifier', {
        message: 'Vous devez fournir un email ou un numéro de téléphone'
      });
    }
    return value;
  });

  return schema.validate(data, { abortEarly: false });
};


/**
 * Valide les données pour la réinitialisation de mot de passe
 * @param {Object} data - Données à valider
 * @returns {Object} Résultat de la validation
 */
export const validateResetPasswordInput = (data) => {
  const schema = Joi.object({
    password: Joi.string()
      .min(8)
      .required()
      .messages({
        'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
        'any.required': 'Le mot de passe est requis'
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Les mots de passe ne correspondent pas',
        'any.required': 'La confirmation du mot de passe est requise'
      }),
    token: Joi.string()
      .required()
      .messages({
        'any.required': 'Le token est requis'
      })
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * Valide le code OTP et l'email
 * @param {Object} data - Données contenant l'email et le code
 * @returns {Object} Résultat de la validation
 */
export const validateOtpVerification = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required()
            .messages({
                'string.email': 'Veuillez fournir une adresse email valide',
                'any.required': 'L\'adresse email est requise'
            }),
        code: Joi.string().length(6).pattern(/^\d+$/).required()
            .messages({
                'string.length': 'Le code doit contenir exactement 6 chiffres',
                'string.pattern.base': 'Le code doit contenir uniquement des chiffres',
                'any.required': 'Le code est requis'
            })
    });

    return schema.validate(data, { abortEarly: false });
};

/**
 * Valide les données pour la mise à jour du profil utilisateur
 * @param {Object} data - Données du profil à mettre à jour
 * @returns {Object} Résultat de la validation
 */
export const validateProfileUpdate = (data) => {
    const schema = Joi.object({
        fullName: Joi.string().min(2).max(100)
            .messages({
                'string.min': 'Le nom complet doit contenir au moins 2 caractères',
                'string.max': 'Le nom complet ne peut pas dépasser 100 caractères'
            }),
        phone: Joi.string().pattern(/^(\+\d{1,3}[- ]?)?\d{9,10}$/).allow('', null)
            .messages({
                'string.pattern.base': 'Format de téléphone invalide'
            }),
        address: Joi.object({
            street: Joi.string().max(100).allow('', null),
            city: Joi.string().max(50).allow('', null),
            state: Joi.string().max(50).allow('', null),
            postalCode: Joi.string().max(20).allow('', null),
            country: Joi.string().max(50).allow('', null)
        }).allow(null),
        birthDate: Joi.date().iso().max('now').allow(null)
            .messages({
                'date.max': 'La date de naissance ne peut pas être dans le futur'
            }),
        bio: Joi.string().max(500).allow('', null)
            .messages({
                'string.max': 'La biographie ne peut pas dépasser 500 caractères'
            }),
        preferences: Joi.object().unknown(true).allow(null)
    });

    return schema.validate(data, { abortEarly: false });
};

/**
 * Valide les données pour le changement de mot de passe
 * @param {Object} data - Données pour le changement de mot de passe
 * @returns {Object} Résultat de la validation
 */
export const validatePasswordChange = (data) => {
    const schema = Joi.object({
        currentPassword: Joi.string().required()
            .messages({
                'any.required': 'Le mot de passe actuel est requis'
            }),
        newPassword: Joi.string().min(8).required()
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
            .messages({
                'string.min': 'Le nouveau mot de passe doit contenir au moins 8 caractères',
                'string.pattern.base': 'Le nouveau mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule et un chiffre',
                'any.required': 'Le nouveau mot de passe est requis'
            }),
        confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
            .messages({
                'any.only': 'Les mots de passe ne correspondent pas',
                'any.required': 'La confirmation du mot de passe est requise'
            })
    });

    return schema.validate(data, { abortEarly: false });
};


/**
 * Valide les données pour la vérification d'un code OTP
 * @param {Object} data - Données à valider
 * @returns {Object} Résultat de la validation
 */
export const validateVerifyOTPInput = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'L\'adresse email doit être valide',
        'string.empty': 'L\'adresse email est requise',
        'any.required': 'L\'adresse email est requise'
      }),
    code: Joi.string()
      .length(6)
      .pattern(/^[0-9]+$/)
      .required()
      .messages({
        'string.length': 'Le code doit contenir exactement 6 chiffres',
        'string.pattern.base': 'Le code doit contenir uniquement des chiffres',
        'string.empty': 'Le code est requis',
        'any.required': 'Le code est requis'
      })
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * Valide les données pour la demande de réinitialisation de mot de passe
 * @param {Object} data - Données à valider
 * @returns {Object} Résultat de la validation
 */
export const validateForgotPasswordInput = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'L\'adresse email doit être valide',
        'string.empty': 'L\'adresse email est requise',
        'any.required': 'L\'adresse email est requise'
      })
  });

  return schema.validate(data, { abortEarly: false });
};