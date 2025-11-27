import { offlineStorageService } from '../offlineStorageService';
import { PlaceCategory } from '../../types';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('OfflineStorageService', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  describe('saveTrips and loadTrips', () => {
    it('should save and load trips correctly', async () => {
      const trips = [
        {
          id: '1',
          userId: 'user1',
          title: 'Test Trip',
          destination: 'Paris',
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-01-07'),
          collaborators: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      await offlineStorageService.saveTrips(trips);
      const loadedTrips = await offlineStorageService.loadTrips();

      expect(loadedTrips).toHaveLength(1);
      expect(loadedTrips[0].id).toBe('1');
      expect(loadedTrips[0].title).toBe('Test Trip');
    });

    it('should return empty array when no trips are saved', async () => {
      const trips = await offlineStorageService.loadTrips();
      expect(trips).toEqual([]);
    });
  });

  describe('saveItineraries and loadItineraries', () => {
    it('should save and load itineraries correctly', async () => {
      const itineraries = [
        {
          tripId: '1',
          dayNumber: 1,
          date: new Date('2023-01-01'),
          destinations: [
            {
              id: 'dest1',
              tripId: '1',
              dayNumber: 1,
              name: 'Eiffel Tower',
              address: 'Champ de Mars, 5 Av. Anatole France, 75007 Paris, France',
              latitude: 48.8584,
              longitude: 2.2945,
              category: 'attraction' as PlaceCategory,
              order: 0,
            },
          ],
        },
      ];

      await offlineStorageService.saveItineraries(itineraries);
      const loadedItineraries = await offlineStorageService.loadItineraries();

      expect(loadedItineraries).toHaveLength(1);
      expect(loadedItineraries[0].dayNumber).toBe(1);
      expect(loadedItineraries[0].destinations).toHaveLength(1);
      expect(loadedItineraries[0].destinations[0].name).toBe('Eiffel Tower');
    });
  });

  describe('offline queue', () => {
    it('should queue and retrieve offline actions', async () => {
      const action = {
        type: 'create' as const,
        entity: 'trip' as const,
        data: { id: '1', title: 'Test Trip' },
      };

      await offlineStorageService.queueOfflineAction(action);
      const queue = await offlineStorageService.getOfflineQueue();

      expect(queue).toHaveLength(1);
      expect(queue[0].type).toBe('create');
      expect(queue[0].entity).toBe('trip');
      expect(queue[0].data.title).toBe('Test Trip');
    });

    it('should process offline queue with callback', async () => {
      const actions = [
        {
          type: 'create' as const,
          entity: 'trip' as const,
          data: { id: '1', title: 'Test Trip 1' },
        },
        {
          type: 'update' as const,
          entity: 'trip' as const,
          data: { id: '2', title: 'Test Trip 2' },
        },
      ];

      for (const action of actions) {
        await offlineStorageService.queueOfflineAction(action);
      }

      const mockCallback = jest.fn().mockResolvedValue(true);
      const processed = await offlineStorageService.processOfflineQueue(mockCallback);

      expect(processed).toBe(2);
      expect(mockCallback).toHaveBeenCalledTimes(2);
    });
  });

  describe('preferences', () => {
    it('should save and load user preferences', async () => {
      const preferences = {
        theme: 'dark',
        language: 'en',
        notifications: true,
      };

      await offlineStorageService.savePreferences(preferences);
      const loadedPreferences = await offlineStorageService.loadPreferences();

      expect(loadedPreferences).toEqual(preferences);
    });
  });

  describe('sync tracking', () => {
    it('should track last sync timestamp', async () => {
      const beforeSync = Date.now();
      await offlineStorageService.updateLastSync();
      const afterSync = Date.now();
      
      const lastSync = await offlineStorageService.getLastSync();
      
      expect(lastSync).toBeGreaterThanOrEqual(beforeSync);
      expect(lastSync).toBeLessThanOrEqual(afterSync);
    });
  });

  describe('network status', () => {
    it('should detect online status', () => {
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        writable: true,
      });
      
      expect(offlineStorageService.isOnline()).toBe(true);
    });
  });
});