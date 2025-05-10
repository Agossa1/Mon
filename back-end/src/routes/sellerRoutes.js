import express from 'express';
import { requireAuth, requireAdminOrSeller } from '../middleware/authMiddleware.js';
import {createShop} from "../controllers/shops/shop.controller.js";
import {getShop} from "../controllers/shops/getShop.controller.js";
import {deleteShop} from "../controllers/shops/deleteShop.controller.js";

const router = express.Router();

// Appliquer le middleware d'authentification à toutes les routes
router.use(requireAuth);
// Appliquer le middleware de vérification du rôle vendeur ou admin à toutes les routes
router.use(requireAdminOrSeller);
router.post('/shops', createShop)
router.get('/shops/:id', getShop)
router.delete('/shops/:id', deleteShop)

export default router;