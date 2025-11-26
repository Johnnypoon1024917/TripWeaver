import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Trip } from '../models/Trip';
import { Destination } from '../models/Destination';
import { AuthRequest } from '../middleware/auth';

const tripRepository = AppDataSource.getRepository(Trip);
const destinationRepository = AppDataSource.getRepository(Destination);

export const getTrips = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const trips = await tripRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    res.json(trips);
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTripById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const trip = await tripRepository.findOne({
      where: { id, userId },
      relations: ['destinations', 'budgets'],
    });

    if (!trip) {
      res.status(404).json({ message: 'Trip not found' });
      return;
    }

    res.json(trip);
  } catch (error) {
    console.error('Get trip error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createTrip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { title, destination, startDate, endDate, description, coverImage } = req.body;

    const trip = tripRepository.create({
      userId,
      title,
      destination,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      description,
      coverImage,
      collaborators: [],
    });

    await tripRepository.save(trip);

    res.status(201).json(trip);
  } catch (error) {
    console.error('Create trip error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateTrip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const trip = await tripRepository.findOne({ where: { id, userId } });

    if (!trip) {
      res.status(404).json({ message: 'Trip not found' });
      return;
    }

    Object.assign(trip, req.body);
    await tripRepository.save(trip);

    res.json(trip);
  } catch (error) {
    console.error('Update trip error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteTrip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const result = await tripRepository.delete({ id, userId });

    if (result.affected === 0) {
      res.status(404).json({ message: 'Trip not found' });
      return;
    }

    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getItinerary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      // Return empty itinerary for non-UUID IDs (e.g., mock data)
      res.json([]);
      return;
    }

    const trip = await tripRepository.findOne({
      where: { id, userId },
      relations: ['destinations'],
    });

    if (!trip) {
      res.status(404).json({ message: 'Trip not found' });
      return;
    }

    // Group destinations by dayNumber
    const itinerary: any[] = [];
    const destinationsByDay = new Map<number, any[]>();

    trip.destinations?.forEach((dest: any) => {
      const day = dest.dayNumber || 1;
      if (!destinationsByDay.has(day)) {
        destinationsByDay.set(day, []);
      }
      destinationsByDay.get(day)!.push(dest);
    });

    destinationsByDay.forEach((destinations, dayNumber) => {
      // Sort by order
      destinations.sort((a, b) => (a.order || 0) - (b.order || 0));
      
      // Calculate total distance for the day
      let totalDistance = 0;
      for (let i = 0; i < destinations.length - 1; i++) {
        const lat1 = destinations[i].latitude;
        const lon1 = destinations[i].longitude;
        const lat2 = destinations[i + 1].latitude;
        const lon2 = destinations[i + 1].longitude;
        
        // Simple distance calculation (haversine would be better)
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        totalDistance += R * c;
      }

      itinerary.push({
        tripId: trip.id,
        dayNumber,
        date: new Date(new Date(trip.startDate).getTime() + (dayNumber - 1) * 24 * 60 * 60 * 1000),
        destinations,
        totalDistance,
      });
    });

    itinerary.sort((a, b) => a.dayNumber - b.dayNumber);
    res.json(itinerary);
  } catch (error) {
    console.error('Get itinerary error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const addDestination = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id: tripId } = req.params;
    const userId = req.user!.userId;
    const destinationData = req.body;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(tripId)) {
      res.status(400).json({ message: 'Invalid trip ID format' });
      return;
    }

    // Verify trip ownership
    const trip = await tripRepository.findOne({ where: { id: tripId, userId } });
    if (!trip) {
      res.status(404).json({ message: 'Trip not found' });
      return;
    }

    const destination = destinationRepository.create({
      ...destinationData,
      tripId,
    });

    await destinationRepository.save(destination);
    res.status(201).json(destination);
  } catch (error) {
    console.error('Add destination error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateDestination = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tripId, destId } = req.params;
    const userId = req.user!.userId;
    const updates = req.body;

    // Verify trip ownership
    const trip = await tripRepository.findOne({ where: { id: tripId, userId } });
    if (!trip) {
      res.status(404).json({ message: 'Trip not found' });
      return;
    }

    const destination = await destinationRepository.findOne({ where: { id: destId, tripId } });
    if (!destination) {
      res.status(404).json({ message: 'Destination not found' });
      return;
    }

    Object.assign(destination, updates);
    await destinationRepository.save(destination);
    res.json(destination);
  } catch (error) {
    console.error('Update destination error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteDestination = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tripId, destId } = req.params;
    const userId = req.user!.userId;

    // Verify trip ownership
    const trip = await tripRepository.findOne({ where: { id: tripId, userId } });
    if (!trip) {
      res.status(404).json({ message: 'Trip not found' });
      return;
    }

    const result = await destinationRepository.delete({ id: destId, tripId });
    if (result.affected === 0) {
      res.status(404).json({ message: 'Destination not found' });
      return;
    }

    res.json({ message: 'Destination deleted successfully' });
  } catch (error) {
    console.error('Delete destination error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
