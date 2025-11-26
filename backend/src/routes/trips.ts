import { Router } from 'express';
import { getTrips, getTripById, createTrip, updateTrip, deleteTrip, addDestination, updateDestination, deleteDestination, getItinerary } from '../controllers/tripController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getTrips);
router.get('/:id', getTripById);
router.get('/:id/itinerary', getItinerary);
router.post('/', createTrip);
router.post('/:id/destinations', addDestination);
router.put('/:id', updateTrip);
router.put('/:tripId/destinations/:destId', updateDestination);
router.delete('/:id', deleteTrip);
router.delete('/:tripId/destinations/:destId', deleteDestination);

export default router;
