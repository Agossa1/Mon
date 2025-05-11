import express from 'express';
import {createStore} from "../controllers/store/createStoreController.js";
import {getAllShops, getMyStores, getShopById, getShopBySlug} from "../controllers/store/getStoreController.js";
import {deleteStore} from "../controllers/store/deleteStoreController.js";
import {requireAuth} from "../middleware/authMiddleware.js";
import {updateStore} from "../controllers/store/updateStoreController.js";


const router = express.Router();

// Appliquer le middleware d'authentification à toutes les routes
router.use(requireAuth);
// Appliquer le middleware de vérification du rôle vendeur ou admin à toutes les routes

router.post('/create-shops', createStore)
router.get('/get-shop/:id', getShopById)
router.get('/get-all-shops', getAllShops)
router.get('/get-shops-slug/:slug', getShopBySlug)
router.get('/my-shops', getMyStores)
router.put('/update-shops/:id', updateStore)
router.delete('/delete-shops/:id', deleteStore)

export { router as sellerRoutes };