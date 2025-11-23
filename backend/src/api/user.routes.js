const express = require('express');
const router = express.Router();
const prisma = require('../db');

// GET /api/user/:address/portfolio
// Returns the full state of a user: Tickets, Loans, Stakes, Listings
router.get('/:address/portfolio', async (req, res) => {
    const { address } = req.params;

    try {
        const user = await prisma.user.findUnique({
            where: { address: address },
            include: {
                tickets: {
                    include: {
                        loan: true,
                        stake: true,
                        listing: true,
                    },
                },
                loans: {
                    include: {
                        ticket: true,
                    },
                },
                stakes: {
                    include: {
                        ticket: true,
                    },
                },
                listings: {
                    include: {
                        ticket: true,
                    },
                },
            },
        });

        if (!user) {
            // If user doesn't exist on-chain/in-db yet, return empty structure
            // This prevents frontend crashes for new users
            return res.json({
                address,
                tickets: [],
                loans: [],
                stakes: [],
                listings: [],
            });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching portfolio:', error);
        res.status(500).json({ error: 'Failed to fetch portfolio' });
    }
});

module.exports = router;
