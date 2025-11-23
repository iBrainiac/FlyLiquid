const express = require('express');
const router = express.Router();
const prisma = require('../db');

// GET /api/market/listings
// Returns all active listings with Ticket and Seller details
router.get('/listings', async (req, res) => {
    try {
        const listings = await prisma.listing.findMany({
            include: {
                ticket: true,
                seller: true,
            },
            orderBy: {
                listedAt: 'desc',
            },
        });
        res.json(listings);
    } catch (error) {
        console.error('Error fetching listings:', error);
        res.status(500).json({ error: 'Failed to fetch listings' });
    }
});

module.exports = router;
