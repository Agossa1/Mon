import Joi from 'joi';

/**
 * Valide les données pour la création d'une boutique
 * @param {Object} data - Données à valider
 * @returns {Object} Résultat de la validation
 */
export const validatorShopInput = Joi.object({
    // Champs obligatoires
    name: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            'string.empty': 'Le nom de la boutique est requis',
            'string.min': 'Le nom de la boutique doit contenir au moins {#limit} caractères',
            'string.max': 'Le nom de la boutique ne peut pas dépasser {#limit} caractères',
            'any.required': 'Le nom de la boutique est requis'
        }),

    // Champs avec valeurs par défaut mais qui peuvent être fournis
    shopType: Joi.string()
        .valid('INDIVIDUAL', 'COMPANY', 'ASSOCIATION', 'OTHER')
        .default('INDIVIDUAL')
        .messages({
            'any.only': 'Le type de boutique doit être l\'un des suivants: INDIVIDUAL, COMPANY, ASSOCIATION, OTHER'
        }),

    category: Joi.string()
        .valid('FASHION', 'ELECTRONICS', 'HOME', 'BEAUTY', 'FOOD', 'SPORTS', 'TOYS', 'BOOKS', 'OTHER')
        .default('OTHER')
        .messages({
            'any.only': 'La catégorie doit être l\'une des suivantes: FASHION, ELECTRONICS, HOME, BEAUTY, FOOD, SPORTS, TOYS, BOOKS, OTHER'
        }),

    // Champs optionnels
    description: Joi.string()
        .max(2000)
        .allow(null, '')
        .messages({
            'string.max': 'La description ne peut pas dépasser {#limit} caractères'
        }),

    shortDescription: Joi.string()
        .max(200)
        .allow(null, '')
        .messages({
            'string.max': 'La description courte ne peut pas dépasser {#limit} caractères'
        }),

    // Tableaux optionnels
    subCategories: Joi.array()
        .items(Joi.string())
        .default([])
        .messages({
            'array.base': 'Les sous-catégories doivent être un tableau'
        }),

    tags: Joi.array()
        .items(Joi.string().max(50))
        .default([])
        .messages({
            'array.base': 'Les tags doivent être un tableau',
            'string.max': 'Un tag ne peut pas dépasser {#limit} caractères'
        }),

    languages: Joi.array()
        .items(Joi.string().min(2).max(5))
        .default(['fr'])
        .messages({
            'array.base': 'Les langues doivent être un tableau',
            'string.min': 'Le code de langue doit contenir au moins {#limit} caractères',
            'string.max': 'Le code de langue ne peut pas dépasser {#limit} caractères'
        }),

    // Autres champs optionnels
    currency: Joi.string()
        .min(3)
        .max(3)
        .default('EUR')
        .messages({
            'string.min': 'Le code de devise doit contenir {#limit} caractères',
            'string.max': 'Le code de devise doit contenir {#limit} caractères'
        }),

    timeZone: Joi.string()
        .default('Europe/Paris')
        .messages({
            'string.base': 'Le fuseau horaire doit être une chaîne de caractères valide'
        }),

    // Informations d'adresse optionnelles (peuvent être fournies ou récupérées du profil)
    address: Joi.string().max(200).allow(null, ''),
    city: Joi.string().max(100).allow(null, ''),
    state: Joi.string().max(100).allow(null, ''),
    postalCode: Joi.string().max(20).allow(null, ''),
    country: Joi.string().max(100).allow(null, '')
});

/**
 * Valide les données pour la mise à jour d'une boutique
 * @param {Object} data - Données à valider
 * @returns {Object} Résultat de la validation
 */
export const validateUpdateShopInput = Joi.object({
    // Tous les champs sont optionnels pour une mise à jour
    name: Joi.string()
        .min(3)
        .max(100)
        .messages({
            'string.min': 'Le nom de la boutique doit contenir au moins {#limit} caractères',
            'string.max': 'Le nom de la boutique ne peut pas dépasser {#limit} caractères'
        }),

    shopType: Joi.string()
        .valid('INDIVIDUAL', 'COMPANY', 'ASSOCIATION', 'OTHER')
        .messages({
            'any.only': 'Le type de boutique doit être l\'un des suivants: INDIVIDUAL, COMPANY, ASSOCIATION, OTHER'
        }),

    category: Joi.string()
        .valid('FASHION', 'ELECTRONICS', 'HOME', 'BEAUTY', 'FOOD', 'SPORTS', 'TOYS', 'BOOKS', 'OTHER')
        .messages({
            'any.only': 'La catégorie doit être l\'une des suivantes: FASHION, ELECTRONICS, HOME, BEAUTY, FOOD, SPORTS, TOYS, BOOKS, OTHER'
        }),

    description: Joi.string()
        .max(2000)
        .allow(null, '')
        .messages({
            'string.max': 'La description ne peut pas dépasser {#limit} caractères'
        }),

    shortDescription: Joi.string()
        .max(200)
        .allow(null, '')
        .messages({
            'string.max': 'La description courte ne peut pas dépasser {#limit} caractères'
        }),

    subCategories: Joi.array()
        .items(Joi.string())
        .messages({
            'array.base': 'Les sous-catégories doivent être un tableau'
        }),

    tags: Joi.array()
        .items(Joi.string().max(50))
        .messages({
            'array.base': 'Les tags doivent être un tableau',
            'string.max': 'Un tag ne peut pas dépasser {#limit} caractères'
        }),

    languages: Joi.array()
        .items(Joi.string().min(2).max(5))
        .messages({
            'array.base': 'Les langues doivent être un tableau',
            'string.min': 'Le code de langue doit contenir au moins {#limit} caractères',
            'string.max': 'Le code de langue ne peut pas dépasser {#limit} caractères'
        }),

    currency: Joi.string()
        .min(3)
        .max(3)
        .messages({
            'string.min': 'Le code de devise doit contenir {#limit} caractères',
            'string.max': 'Le code de devise doit contenir {#limit} caractères'
        }),

    timeZone: Joi.string(),

    address: Joi.string().max(200).allow(null, ''),
    city: Joi.string().max(100).allow(null, ''),
    state: Joi.string().max(100).allow(null, ''),
    postalCode: Joi.string().max(20).allow(null, ''),
    country: Joi.string().max(100).allow(null, ''),

    // Champs supplémentaires pour la mise à jour
    status: Joi.string()
        .valid('PENDING', 'ACTIVE', 'SUSPENDED', 'CLOSED')
        .messages({
            'any.only': 'Le statut doit être l\'un des suivants: PENDING, ACTIVE, SUSPENDED, CLOSED'
        }),

    firstName: Joi.string().max(100),
    lastName: Joi.string().max(100),
    email: Joi.string().email(),
    phone: Joi.string().pattern(/^(\+\d{1,3}[- ]?)?\d{9,10}$/).allow(null, '')
});


/**
 * Schéma de validation pour la mise à jour d'une boutique
 * Basé sur le schéma de création mais avec tous les champs optionnels
 */

export const updateShopSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .trim()
    .optional()
    .messages({
      'string.base': 'Le nom doit être une chaîne de caractères',
      'string.min': 'Le nom doit contenir au moins {#limit} caractères',
      'string.max': 'Le nom ne peut pas dépasser {#limit} caractères'
    }),
  
  description: Joi.string()
    .max(1000)
    .allow('')
    .optional()
    .messages({
      'string.base': 'La description doit être une chaîne de caractères',
      'string.max': 'La description ne peut pas dépasser {#limit} caractères'
    }),
  
  slug: Joi.string()
    .min(3)
    .max(100)
    .pattern(/^[a-z0-9-]+$/)
    .optional()
    .messages({
      'string.base': 'Le slug doit être une chaîne de caractères',
      'string.min': 'Le slug doit contenir au moins {#limit} caractères',
      'string.max': 'Le slug ne peut pas dépasser {#limit} caractères',
      'string.pattern.base': 'Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets'
    }),
  
  shopType: Joi.string()
    .valid('PHYSICAL', 'ONLINE', 'HYBRID')
    .optional()
    .messages({
      'string.base': 'Le type de boutique doit être une chaîne de caractères',
      'any.only': 'Le type de boutique doit être PHYSICAL, ONLINE ou HYBRID'
    }),
  
  category: Joi.string()
    .optional()
    .messages({
      'string.base': 'La catégorie doit être une chaîne de caractères'
    }),
  
  subCategory: Joi.string()
    .optional()
    .allow('')
    .messages({
      'string.base': 'La sous-catégorie doit être une chaîne de caractères'
    }),
  
  logo: Joi.string()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.base': 'Le logo doit être une chaîne de caractères',
      'string.uri': 'Le logo doit être une URL valide'
    }),
  
  coverImage: Joi.string()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.base': 'L\'image de couverture doit être une chaîne de caractères',
      'string.uri': 'L\'image de couverture doit être une URL valide'
    }),
  
  contactEmail: Joi.string()
    .email()
    .optional()
    .allow('')
    .messages({
      'string.base': 'L\'email de contact doit être une chaîne de caractères',
      'string.email': 'L\'email de contact doit être une adresse email valide'
    }),
  
  contactPhone: Joi.string()
    .pattern(/^(\+\d{1,3}[- ]?)?\d{9,15}$/)
    .optional()
    .allow('')
    .messages({
      'string.base': 'Le téléphone de contact doit être une chaîne de caractères',
      'string.pattern.base': 'Le téléphone de contact doit être un numéro de téléphone valide'
    }),
  
  website: Joi.string()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.base': 'Le site web doit être une chaîne de caractères',
      'string.uri': 'Le site web doit être une URL valide'
    }),
  
  socialLinks: Joi.object({
    facebook: Joi.string().uri().optional().allow(''),
    instagram: Joi.string().uri().optional().allow(''),
    twitter: Joi.string().uri().optional().allow(''),
    linkedin: Joi.string().uri().optional().allow(''),
    youtube: Joi.string().uri().optional().allow(''),
    tiktok: Joi.string().uri().optional().allow('')
  })
    .optional()
    .messages({
      'object.base': 'Les liens sociaux doivent être un objet'
    }),
  
  address: Joi.object({
    street: Joi.string().optional().allow(''),
    city: Joi.string().optional(),
    state: Joi.string().optional().allow(''),
    postalCode: Joi.string().optional().allow(''),
    country: Joi.string().optional()
  })
    .optional()
    .messages({
      'object.base': 'L\'adresse doit être un objet'
    }),
  
  businessHours: Joi.object({
    monday: Joi.object({
      open: Joi.boolean().default(true),
      openingTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
      closingTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).optional()
    }).optional(),
    tuesday: Joi.object({
      open: Joi.boolean().default(true),
      openingTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
      closingTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).optional()
    }).optional(),
    wednesday: Joi.object({
      open: Joi.boolean().default(true),
      openingTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
      closingTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).optional()
    }).optional(),
    thursday: Joi.object({
      open: Joi.boolean().default(true),
      openingTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
      closingTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).optional()
    }).optional(),
    friday: Joi.object({
      open: Joi.boolean().default(true),
      openingTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
      closingTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).optional()
    }).optional(),
    saturday: Joi.object({
      open: Joi.boolean().default(true),
      openingTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
      closingTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).optional()
    }).optional(),
    sunday: Joi.object({
      open: Joi.boolean().default(false),
      openingTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
      closingTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).optional()
    }).optional()
  })
    .optional()
    .messages({
      'object.base': 'Les horaires d\'ouverture doivent être un objet'
    }),
  
  tags: Joi.array()
    .items(Joi.string().max(30))
    .max(10)
    .optional()
    .messages({
      'array.base': 'Les tags doivent être un tableau',
      'array.max': 'Vous ne pouvez pas ajouter plus de {#limit} tags',
      'string.max': 'Un tag ne peut pas dépasser {#limit} caractères'
    }),
  
  settings: Joi.object({
    allowReviews: Joi.boolean().default(true),
    showContactInfo: Joi.boolean().default(true),
    showBusinessHours: Joi.boolean().default(true),
    showSocialLinks: Joi.boolean().default(true),
    allowMessages: Joi.boolean().default(true)
  })
    .optional()
    .messages({
      'object.base': 'Les paramètres doivent être un objet'
    })
});
/**
 * Schéma de validation pour le changement de statut d'une boutique
 */
export const changeShopStatusSchema = Joi.object({
  status: Joi.string()
    .valid('PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED')
    .required()
    .messages({
      'string.base': 'Le statut doit être une chaîne de caractères',
      'any.only': 'Le statut doit être PENDING, ACTIVE, INACTIVE, SUSPENDED ou BANNED',
      'any.required': 'Le statut est requis'
    }),
  
  reason: Joi.string()
    .when('status', {
      is: Joi.string().valid('SUSPENDED', 'BANNED'),
      then: Joi.string().required().min(10).max(500),
      otherwise: Joi.string().optional().allow('')
    })
    .messages({
      'string.base': 'La raison doit être une chaîne de caractères',
      'string.empty': 'La raison est requise pour ce statut',
      'string.min': 'La raison doit contenir au moins {#limit} caractères',
      'string.max': 'La raison ne peut pas dépasser {#limit} caractères',
      'any.required': 'La raison est requise pour ce statut'
    })
});

/**
 * Schéma de validation pour la mise en avant d'une boutique
 */
export const toggleShopFeaturedSchema = Joi.object({
  featured: Joi.boolean()
    .required()
    .messages({
      'boolean.base': 'La valeur doit être un booléen',
      'any.required': 'La valeur est requise'
    })
});

/**
 * Schéma de validation pour la vérification d'une boutique
 */
export const verifyShopSchema = Joi.object({
  verified: Joi.boolean()
    .required()
    .messages({
      'boolean.base': 'La valeur doit être un booléen',
      'any.required': 'La valeur est requise'
    }),
  
  notes: Joi.string()
    .max(500)
    .optional()
    .allow('')
    .messages({
        'string.base': 'Les notes doivent être une chaîne de caractères',
      'string.max': 'Les notes ne peuvent pas dépasser {#limit} caractères'
    })
});

/**
 * Schéma de validation pour l'invitation d'un membre à une boutique
 */
export const inviteShopMemberSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.base': 'L\'email doit être une chaîne de caractères',
      'string.email': 'L\'email doit être une adresse email valide',
      'any.required': 'L\'email est requis'
    }),
  
  role: Joi.string()
    .valid('ADMIN', 'MANAGER', 'STAFF', 'SUPPORT')
    .required()
    .messages({
      'string.base': 'Le rôle doit être une chaîne de caractères',
      'any.only': 'Le rôle doit être ADMIN, MANAGER, STAFF ou SUPPORT',
      'any.required': 'Le rôle est requis'
    }),
  
  permissions: Joi.object({
    manageProducts: Joi.boolean().default(false),
    manageOrders: Joi.boolean().default(false),
    manageCustomers: Joi.boolean().default(false),
    manageSettings: Joi.boolean().default(false),
    manageFinances: Joi.boolean().default(false),
    manageMarketing: Joi.boolean().default(false),
    manageMembers: Joi.boolean().default(false),
    fullAccess: Joi.boolean().default(false)
  })
    .optional()
    .default({})
    .messages({
      'object.base': 'Les permissions doivent être un objet'
    }),
  
  message: Joi.string()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.base': 'Le message doit être une chaîne de caractères',
      'string.max': 'Le message ne peut pas dépasser {#limit} caractères'
    })
});

/**
 * Schéma de validation pour la réponse à une invitation
 */
export const respondToInvitationSchema = Joi.object({
  accept: Joi.boolean()
    .required()
    .messages({
      'boolean.base': 'La valeur doit être un booléen',
      'any.required': 'La valeur est requise'
    })
});

/**
 * Schéma de validation pour la mise à jour des permissions d'un membre
 */
export const updateMemberPermissionsSchema = Joi.object({
  permissions: Joi.object({
    manageProducts: Joi.boolean().default(false),
    manageOrders: Joi.boolean().default(false),
    manageCustomers: Joi.boolean().default(false),
    manageSettings: Joi.boolean().default(false),
    manageFinances: Joi.boolean().default(false),
    manageMarketing: Joi.boolean().default(false),
    manageMembers: Joi.boolean().default(false),
    fullAccess: Joi.boolean().default(false)
  })
    .required()
    .messages({
      'object.base': 'Les permissions doivent être un objet',
      'any.required': 'Les permissions sont requises'
    })
});

/**
 * Schéma de validation pour la recherche de boutiques
 */
export const searchShopsSchema = Joi.object({
  query: Joi.string()
    .min(2)
    .optional()
    .allow('')
    .messages({
      'string.base': 'La requête doit être une chaîne de caractères',
      'string.min': 'La requête doit contenir au moins {#limit} caractères'
    }),
  
  category: Joi.string()
    .optional()
    .allow('')
    .messages({
      'string.base': 'La catégorie doit être une chaîne de caractères'
    }),
  
  shopType: Joi.string()
    .valid('PHYSICAL', 'ONLINE', 'HYBRID')
    .optional()
    .messages({
      'string.base': 'Le type de boutique doit être une chaîne de caractères',
      'any.only': 'Le type de boutique doit être PHYSICAL, ONLINE ou HYBRID'
    }),
  
  status: Joi.string()
    .valid('PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED')
    .optional()
    .messages({
      'string.base': 'Le statut doit être une chaîne de caractères',
      'any.only': 'Le statut doit être PENDING, ACTIVE, INACTIVE, SUSPENDED ou BANNED'
    }),
  
  verified: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'La valeur de vérification doit être un booléen'
    }),
  
  featured: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'La valeur de mise en avant doit être un booléen'
    }),
  
  country: Joi.string()
    .optional()
    .allow('')
    .messages({
      'string.base': 'Le pays doit être une chaîne de caractères'
    }),
  
  city: Joi.string()
    .optional()
    .allow('')
    .messages({
      'string.base': 'La ville doit être une chaîne de caractères'
    }),
  
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'La page doit être un nombre',
      'number.integer': 'La page doit être un nombre entier',
      'number.min': 'La page doit être supérieure ou égale à {#limit}'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .messages({
      'number.base': 'La limite doit être un nombre',
      'number.integer': 'La limite doit être un nombre entier',
      'number.min': 'La limite doit être supérieure ou égale à {#limit}',
      'number.max': 'La limite ne peut pas dépasser {#limit}'
    }),
  
  sortBy: Joi.string()
    .valid('createdAt', 'name', 'rating', 'popularity')
    .default('createdAt')
    .messages({
      'string.base': 'Le tri doit être une chaîne de caractères',
      'any.only': 'Le tri doit être createdAt, name, rating ou popularity'
    }),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'string.base': 'L\'ordre de tri doit être une chaîne de caractères',
      'any.only': 'L\'ordre de tri doit être asc ou desc'
    })
});

/**
 * Schéma de validation pour les coordonnées géographiques
 */
export const geoLocationSchema = Joi.object({
  latitude: Joi.number()
    .min(-90)
    .max(90)
    .required()
    .messages({
      'number.base': 'La latitude doit être un nombre',
      'number.min': 'La latitude doit être supérieure ou égale à {#limit}',
      'number.max': 'La latitude doit être inférieure ou égale à {#limit}',
      'any.required': 'La latitude est requise'
    }),
  
  longitude: Joi.number()
    .min(-180)
    .max(180)
    .required()
    .messages({
      'number.base': 'La longitude doit être un nombre',
      'number.min': 'La longitude doit être supérieure ou égale à {#limit}',
      'number.max': 'La longitude doit être inférieure ou égale à {#limit}',
      'any.required': 'La longitude est requise'
    }),
  
  radius: Joi.number()
    .positive()
    .default(10)
    .messages({
      'number.base': 'Le rayon doit être un nombre',
      'number.positive': 'Le rayon doit être un nombre positif'
    })
});

/**
 * Fonction utilitaire pour valider les données avec un schéma
 * @param {Object} schema - Schéma Joi
 * @param {Object} data - Données à valider
 * @returns {Object} Résultat de la validation
 */
export const validateWithSchema = (schema, data) => {
  return schema.validate(data, { abortEarly: false });
};