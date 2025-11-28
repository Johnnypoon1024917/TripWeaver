import { Router } from 'express';
const router = Router();
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyBmFCy71VLlgNcbvEQNu2azuSM5flgArE4';
const PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place';
const DISTANCE_MATRIX_BASE_URL = 'https://maps.googleapis.com/maps/api/distancematrix';
/**
 * Autocomplete proxy endpoint
 * GET /api/v1/places/autocomplete?input=query&location=lat,lng&radius=50000
 */
router.get('/autocomplete', async (req, res) => {
    try {
        const { input, location, radius = '50000' } = req.query;
        if (!input || typeof input !== 'string') {
            return res.status(400).json({ error: 'Input parameter is required' });
        }
        let url = `${PLACES_BASE_URL}/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_MAPS_API_KEY}`;
        if (location && typeof location === 'string') {
            url += `&location=${location}&radius=${radius}`;
        }
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    }
    catch (error) {
        console.error('Autocomplete proxy error:', error);
        res.status(500).json({ error: 'Failed to fetch autocomplete results' });
    }
});
/**
 * Text search proxy endpoint
 * GET /api/v1/places/textsearch?query=search&location=lat,lng
 */
router.get('/textsearch', async (req, res) => {
    try {
        const { query, location, type } = req.query;
        if (!query || typeof query !== 'string') {
            return res.status(400).json({ error: 'Query parameter is required' });
        }
        let url = `${PLACES_BASE_URL}/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_API_KEY}`;
        if (location && typeof location === 'string') {
            url += `&location=${location}&radius=5000`;
        }
        if (type && typeof type === 'string') {
            url += `&type=${type}`;
        }
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    }
    catch (error) {
        console.error('Text search proxy error:', error);
        res.status(500).json({ error: 'Failed to fetch search results' });
    }
});
/**
 * Place details proxy endpoint
 * GET /api/v1/places/details?place_id=xxxxx
 */
router.get('/details', async (req, res) => {
    try {
        const { place_id } = req.query;
        if (!place_id || typeof place_id !== 'string') {
            return res.status(400).json({ error: 'place_id parameter is required' });
        }
        const url = `${PLACES_BASE_URL}/details/json?place_id=${place_id}&fields=name,formatted_address,formatted_phone_number,geometry,photos,rating,reviews,user_ratings_total,website,opening_hours,price_level,types&key=${GOOGLE_MAPS_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    }
    catch (error) {
        console.error('Place details proxy error:', error);
        res.status(500).json({ error: 'Failed to fetch place details' });
    }
});
/**
 * Nearby search proxy endpoint
 * GET /api/v1/places/nearbysearch?location=lat,lng&radius=5000&type=restaurant
 */
router.get('/nearbysearch', async (req, res) => {
    try {
        const { location, radius = '5000', type, keyword } = req.query;
        if (!location || typeof location !== 'string') {
            return res.status(400).json({ error: 'Location parameter is required' });
        }
        let url = `${PLACES_BASE_URL}/nearbysearch/json?location=${location}&radius=${radius}&key=${GOOGLE_MAPS_API_KEY}`;
        if (type && typeof type === 'string') {
            url += `&type=${type}`;
        }
        if (keyword && typeof keyword === 'string') {
            url += `&keyword=${encodeURIComponent(keyword)}`;
        }
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    }
    catch (error) {
        console.error('Nearby search proxy error:', error);
        res.status(500).json({ error: 'Failed to fetch nearby places' });
    }
});
/**
 * Photo proxy endpoint
 * GET /api/v1/places/photo?photo_reference=xxx&maxwidth=400&maxheight=400
 */
router.get('/photo', async (req, res) => {
    try {
        const { photo_reference, maxwidth = '400', maxheight = '400' } = req.query;
        if (!photo_reference || typeof photo_reference !== 'string') {
            return res.status(400).json({ error: 'photo_reference parameter is required' });
        }
        const url = `${PLACES_BASE_URL}/photo?maxwidth=${maxwidth}&maxheight=${maxheight}&photo_reference=${photo_reference}&key=${GOOGLE_MAPS_API_KEY}`;
        const response = await fetch(url);
        // Stream the image back to client
        res.set('Content-Type', response.headers.get('content-type') || 'image/jpeg');
        const buffer = await response.arrayBuffer();
        // Fix the Buffer.from call to properly handle ArrayBuffer
        res.send(Buffer.from(new Uint8Array(buffer)));
    }
    catch (error) {
        console.error('Photo proxy error:', error);
        res.status(500).json({ error: 'Failed to fetch photo' });
    }
});
/**
 * Distance Matrix proxy endpoint
 * GET /api/v1/places/distancematrix?origins=lat1,lng1&destinations=lat2,lng2&mode=driving
 */
router.get('/distancematrix', async (req, res) => {
    try {
        const { origins, destinations, mode = 'driving' } = req.query;
        if (!origins || typeof origins !== 'string') {
            return res.status(400).json({ error: 'origins parameter is required' });
        }
        if (!destinations || typeof destinations !== 'string') {
            return res.status(400).json({ error: 'destinations parameter is required' });
        }
        const url = `${DISTANCE_MATRIX_BASE_URL}/json?origins=${encodeURIComponent(origins)}&destinations=${encodeURIComponent(destinations)}&mode=${mode}&key=${GOOGLE_MAPS_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    }
    catch (error) {
        console.error('Distance Matrix proxy error:', error);
        res.status(500).json({ error: 'Failed to fetch distance matrix' });
    }
});
export default router;
