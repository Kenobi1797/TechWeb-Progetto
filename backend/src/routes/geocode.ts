import { Router } from 'express';
import { getGeocode } from '../controllers/geocodeController';

const router = Router();

 router.get('/', getGeocode);

export default router;
