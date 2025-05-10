import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Appliquer le middleware d'authentification à toutes les routes
router.use(requireAuth);
// Appliquer le middleware de vérification du rôle admin à toutes les routes
router.use(requireAdmin);

// Route pour obtenir des statistiques (accessible uniquement aux administrateurs)
router.get('/dashboard', async (req, res) => {
  try {
    // Logique pour récupérer les statistiques du tableau de bord
    
    return res.status(200).json({
      success: true,
      message: 'Statistiques récupérées avec succès',
      data: {
        // Données du tableau de bord
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération des statistiques',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Route pour gérer les utilisateurs (accessible uniquement aux administrateurs)
router.get('/users', async (req, res) => {
  try {
    // Logique pour récupérer la liste des utilisateurs
    
    return res.status(200).json({
      success: true,
      message: 'Utilisateurs récupérés avec succès',
      data: {
        // Liste des utilisateurs
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération des utilisateurs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;