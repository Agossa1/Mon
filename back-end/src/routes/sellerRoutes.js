import express from 'express';
import {createStore} from "../controllers/store/createStoreController.js";
import {getAllShops, getMyStores, getShopById} from "../controllers/store/getStoreController.js";
import {deleteStore} from "../controllers/store/deleteStoreController.js";
import {requireAuth} from "../middleware/authMiddleware.js";
import {updateStore} from "../controllers/store/updateStoreController.js";


const router = express.Router();

// Appliquer le middleware d'authentification à toutes les routes
router.use(requireAuth);
// Appliquer le middleware de vérification du rôle vendeur ou admin à toutes les routes

router.post('/shops', createStore)
router.get('/shops/:id', getShopById)
router.get('/shops', getAllShops)
router.delete('/shops/:id', deleteStore)
router.get('/my-shops', getMyStores)
router.put('/shops/:id', updateStore) // Pour mettre à jour une boutique existante

export { router as sellerRoutes };