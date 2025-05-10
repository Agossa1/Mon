/**
 * Renvoie un email de vérification
 * @async
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @returns {Object} Réponse JSON confirmant l'envoi
 */
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Adresse email requise',
        error: 'MISSING_EMAIL'
      });
    }
    
    // Rechercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        fullName: true,
        emailVerified: true
      }
    });
    
    if (!user) {
      // Pour des raisons de sécurité, ne pas révéler si l'email existe ou non
      return res.status(200).json({
        success: true,
        message: 'Si cette adresse email est associée à un compte, un email de vérification a été envoyé'
      });
    }
    
    // Vérifier si l'email est déjà vérifié
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Cette adresse email est déjà vérifiée',
        error: 'EMAIL_ALREADY_VERIFIED'
      });
    }
    
    // Générer un nouveau token de vérification
    const verificationToken = await generateVerificationToken(user.id);
    
    // Envoyer l'email de vérification
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    await sendVerificationEmail({
      to: user.email,
      name: user.fullName || user.name,
      verificationUrl
    });
    
    logger.info('Email de vérification renvoyé', { 
      userId: user.id,
      email: user.email,
      ip: req.ip
    });
    
    return res.status(200).json({
      success: true,
      message: 'Email de vérification envoyé avec succès'
    });
    
  } catch (error) {
    logger.error('Erreur lors du renvoi de l\'email de vérification', { 
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de l\'envoi de l\'email de vérification',
      error: process.env.NODE_ENV === 'development' ? error.message : 'SERVER_ERROR'
    });
  }
};