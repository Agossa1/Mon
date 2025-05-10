import { V3 } from 'paseto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from './logger.js';
import ms from 'ms';
import crypto from 'crypto';

// Obtenir le répertoire actuel en utilisant ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Clé secrète pour PASETO
let secretKey;

/**
 * Initialise la clé PASETO
 * @async
 * @returns {Promise<Buffer>} La clé secrète
 */
export const initPasetoKey = async () => {
  try {
    if (process.env.PASETO_SECRET_KEY) {
      secretKey = Buffer.from(process.env.PASETO_SECRET_KEY, 'hex');
      logger.info('Clé PASETO chargée depuis les variables d\'environnement');
      return secretKey;
    }

    const keyPath = process.env.PASETO_KEY_PATH || path.join(__dirname, '../../../paseto_local_key');

    try {
      secretKey = await fs.readFile(keyPath);
      logger.info('Clé PASETO chargée depuis le fichier', { path: keyPath });
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Utiliser crypto pour générer une clé symétrique
        secretKey = crypto.randomBytes(32); // 32 octets pour une clé de 256 bits
        await fs.writeFile(keyPath, secretKey);
        logger.info('Nouvelle clé PASETO V3 générée et sauvegardée', { path: keyPath });
      } else {
        logger.error('Erreur lors de la lecture de la clé PASETO', {
          error: error.message,
          stack: error.stack
        });
        throw new Error('Impossible de lire la clé PASETO');
      }
    }

    return secretKey;
  } catch (error) {
    logger.error('Erreur lors de l\'initialisation de la clé PASETO', {
      error: error.message,
      stack: error.stack
    });
    throw new Error('Impossible d\'initialiser la clé PASETO');
  }
};

// Initialiser la clé au démarrage
initPasetoKey().catch(error => {
  logger.error('Échec de l\'initialisation de la clé PASETO', {
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});

/**
 * Génère un token PASETO
 * @async
 * @param {Object} payload - Données à inclure dans le token
 * @param {Object} options - Options pour le token
 * @param {string} options.expiry - Durée de validité du token (ex: "1h", "7d")
 * @param {string} options.purpose - But du token (ex: "access", "refresh")
 * @returns {Promise<string>} Token PASETO généré
 */
export const generateToken = async (payload, { expiry, purpose = 'access' }) => {
  try {
    if (!secretKey) {
      await initPasetoKey();
    }

    const now = Math.floor(Date.now() / 1000);
    const expiryInSeconds = parseExpiry(expiry);

    const tokenPayload = {
      ...payload,
      iat: now,
      exp: now + expiryInSeconds,
      purpose,
      aud: process.env.TOKEN_AUDIENCE || 'app:api',
      iss: process.env.TOKEN_ISSUER || 'ecommerce:auth'
    };

    return await V3.encrypt(tokenPayload, secretKey, {
      expiresIn: `${expiryInSeconds}s`
    });
  } catch (error) {
    logger.error('Erreur lors de la génération du token PASETO', {
      error: error.message,
      stack: error.stack
    });
    throw new Error('Impossible de générer le token PASETO');
  }
};

/**
 * Génère les tokens d'authentification (access token et refresh token)
 * @async
 * @param {Object} user - Données de l'utilisateur
 * @param {boolean} rememberMe - Si l'utilisateur a coché "Se souvenir de moi"
 * @returns {Promise<Object>} Tokens générés et leur expiration
 */
export const generateAuthTokens = async (user, rememberMe = false) => {
  try {
    const accessTokenExpiry = rememberMe
      ? (process.env.REMEMBER_ME_EXPIRY || '7d')
      : (process.env.ACCESS_TOKEN_EXPIRY || '1h');

    const refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY || '30d';
    const sessionId = crypto.randomBytes(16).toString('hex');

    const basePayload = {
      sub: user.id,
      fullName: user.fullName || '',
      email: user.email,
      role: user.role || 'user',
      verified: user.emailVerified || false,
      sid: sessionId
    };

    const accessToken = await generateToken(
      basePayload,
      { expiry: accessTokenExpiry, purpose: 'access' }
    );

    const refreshToken = await generateToken(
      { ...basePayload, tokenVersion: user.tokenVersion || 0 },
      { expiry: refreshTokenExpiry, purpose: 'refresh' }
    );

    const accessTokenExpiryMs = parseExpiry(accessTokenExpiry) * 1000;
    const refreshTokenExpiryMs = parseExpiry(refreshTokenExpiry) * 1000;

    return {
      accessToken,
      refreshToken,
      accessTokenExpiry: new Date(Date.now() + accessTokenExpiryMs),
      refreshTokenExpiry: new Date(Date.now() + refreshTokenExpiryMs),
      sessionId
    };
  } catch (error) {
    logger.error('Erreur lors de la génération des tokens d\'authentification', {
      error: error.message,
      stack: error.stack,
      userId: user.id
    });
    throw new Error('Impossible de générer les tokens d\'authentification');
  }
};

/**
 * Génère un token à usage unique
 * @async
 * @param {string} userId - ID de l'utilisateur
 * @param {string} purpose - But du token (ex: "email_verification", "password_reset")
 * @param {string} expiresIn - Durée de validité du token (ex: "15m")
 * @returns {Promise<string>} Token PASETO généré
 */
export const generateOneTimeToken = async (userId, purpose, expiresIn = '15m') => {
  try {
    if (!secretKey) {
      await initPasetoKey();
    }

    // Assurez-vous que userId est une chaîne
    const userIdStr = String(userId);
    
    const now = Math.floor(Date.now() / 1000);
    const expiryInSeconds = parseExpiry(expiresIn);

    const payload = {
      sub: userIdStr,
      purpose,
      jti: crypto.randomBytes(16).toString('hex'),
      iat: now,
      exp: now + expiryInSeconds,
      aud: process.env.TOKEN_AUDIENCE || 'app:api',
      iss: process.env.TOKEN_ISSUER || 'ecommerce:auth'
    };

    logger.debug('Génération de token à usage unique', {
      userId: userIdStr,
      purpose,
      expiresIn,
      payload
    });

    // Utiliser la même structure d'options que pour verifyToken
    const options = {
      audience: process.env.TOKEN_AUDIENCE || 'app:api',
      issuer: process.env.TOKEN_ISSUER || 'ecommerce:auth',
      expiresIn
    };

    console.log('Payload à chiffrer:', JSON.stringify(payload, null, 2));
    console.log('Options de chiffrement:', JSON.stringify(options, null, 2));

    const token = await V3.encrypt(payload, secretKey, options);
    console.log('Token généré:', token.substring(0, 20) + '...');

    logger.info('Token à usage unique généré avec succès', { userId: userIdStr, purpose });
    return token;
  } catch (error) {
    console.error('Erreur complète lors de la génération du token:', error);
    logger.error('Erreur lors de la génération du token à usage unique', {
      error: error.message,
      stack: error.stack,
      userId,
      purpose
    });
    throw new Error('Impossible de générer le token à usage unique');
  }
};
/**
 * Vérifie et décode un token PASETO
 * @async
 * @param {string} token - Token PASETO à vérifier
 * @param {Object|string} options - Options pour la vérification ou type de token
 * @param {string} [options.purpose] - But attendu du token
 * @param {string} [options.audience] - Audience attendue
 * @returns {Promise<Object>} Payload décodé du token
 */
export const verifyToken = async (token, options = {}) => {
  try {
    if (!token || typeof token !== 'string' || !token.startsWith('v3.local.')) {
      logger.warn('Format de token PASETO invalide', {
        tokenPrefix: token ? token.substring(0, 10) : 'absent',
        tokenLength: token ? token.length : 0
      });
      throw new Error('Format de token PASETO invalide');
    }

    let tokenType = 'access';
    let verifyOptions = {
      audience: process.env.TOKEN_AUDIENCE || 'app:api',
      issuer: process.env.TOKEN_ISSUER || 'ecommerce:auth',
      clockTolerance: '30s'
    };

    if (typeof options === 'object' && options !== null) {
      verifyOptions = { ...verifyOptions, ...options };
      tokenType = options.purpose || 'access';
    } else if (typeof options === 'string') {
      tokenType = options;
    }

    if (!secretKey) {
      await initPasetoKey();
    }

    console.log('Token à décrypter:', token);
    console.log('Options de vérification:', JSON.stringify(verifyOptions, null, 2));

    // Utiliser directement V3.decrypt sans destructuration
    const result = await V3.decrypt(token, secretKey, verifyOptions);
    
    // Vérifier comment le résultat est structuré
    console.log('Structure du résultat:', Object.keys(result));
    console.log('Résultat complet:', JSON.stringify(result, null, 2));
    
    // Adapter en fonction de la structure réelle
    const payload = typeof result === 'object' ? (result.payload || result) : result;
    
    console.log('Payload extrait:', JSON.stringify(payload, null, 2));
    
    if (!payload || typeof payload !== 'object') {
      logger.warn('Token déchiffré mais payload invalide', {
        tokenPrefix: token ? token.substring(0, 10) : 'absent',
        resultType: typeof result,
        payloadType: typeof payload
      });
      throw new Error('Token invalide: payload manquant ou invalide');
    }
    
    if (typeof payload.sub !== 'string') {
      console.error('payload.sub n\'est pas une chaîne ou est manquant:', payload.sub);
      throw new Error('Invalid payload: sub is not a string or is missing');
    }

    if (payload.purpose && tokenType && payload.purpose !== tokenType) {
      logger.warn('Type de token différent de celui attendu', {
        expected: tokenType,
        received: payload.purpose
      });

      if (tokenType !== 'password_reset' && payload.purpose !== 'password_reset') {
        throw new Error(`Type de token invalide: attendu ${tokenType}, reçu ${payload.purpose}`);
      }
    }

    if (!payload.sub) {
      logger.warn('Token invalide - payload incomplet', {
        payload: { ...payload, sub: payload.sub }
      });
      throw new Error('Token invalide: ID utilisateur manquant');
    }

    return {
      ...payload,
      id: payload.sub
    };

  } catch (error) {
    console.error('Erreur complète lors de la vérification du token:', error);
    logger.error('Erreur lors de la vérification du token PASETO', {
      error: error.message,
      stack: error.stack,
      tokenPrefix: token ? token.substring(0, 10) : 'absent',
      tokenLength: token ? token.length : 0
    });
    throw new Error('Token PASETO invalide ou expiré');
  }
};

/**
 * Convertit une chaîne d'expiration en secondes
 * @param {string} expiry - Chaîne d'expiration (ex: "1h", "7d")
 * @returns {number} Expiration en secondes
 */
function parseExpiry(expiry) {
  const match = expiry.match(/^(\d+)([smhdw])$/);
  if (!match) {
    throw new Error(`Format d'expiration invalide: ${expiry}`);
  }

  const [, value, unit] = match;
  const numValue = parseInt(value, 10);

  switch (unit) {
    case 's': return numValue;
    case 'm': return numValue * 60;
    case 'h': return numValue * 60 * 60;
    case 'd': return numValue * 24 * 60 * 60;
    case 'w': return numValue * 7 * 24 * 60 * 60;
    default: throw new Error(`Unité d'expiration invalide: ${unit}`);
  }
}

