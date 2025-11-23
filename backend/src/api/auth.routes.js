const express = require('express');
const router = express.Router();
const prisma = require('../db');
const { verifyCloudProof } = require('@worldcoin/idkit');

// POST /api/auth/worldid/verify
// Verifies WorldID proof and updates user verification status
router.post('/worldid/verify', async (req, res) => {
    const { walletAddress, proof } = req.body;

    if (!walletAddress) {
        return res.status(400).json({ error: 'Wallet address required' });
    }

    if (!proof) {
        return res.status(400).json({ error: 'WorldID proof required' });
    }

    try {
        // Verify the proof using WorldID SDK
        // The proof contains: merkle_root, nullifier_hash, proof, verification_level, signal, etc.
        const app_id = process.env.WORLD_ID_APP_ID || 'app_staging_1234567890abcdef';
        const action = 'flyliquid-verification';
        const signal = walletAddress;

        // Verify the proof using cloud verification
        // Signature: verifyCloudProof(proof, app_id, action, signal, endpoint, headers)
        const verificationResult = await verifyCloudProof(
            proof,
            app_id,
            action,
            signal
        );

        // If verification succeeds, update user's WorldID status
        const user = await prisma.user.upsert({
            where: { address: walletAddress },
            update: {
                isWorldIdVerified: true,
            },
            create: {
                address: walletAddress,
                isWorldIdVerified: true,
            },
        });

        res.json({
            success: true,
            verified: true,
            user: {
                address: user.address,
                isWorldIdVerified: user.isWorldIdVerified,
            },
        });
    } catch (error) {
        console.error('WorldID verification error:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'WorldID verification failed',
        });
    }
});

// GET /api/auth/worldid/status/:address
// Check WorldID verification status for a user
router.get('/worldid/status/:address', async (req, res) => {
    const { address } = req.params;

    try {
        const user = await prisma.user.findUnique({
            where: { address },
            select: {
                address: true,
                isWorldIdVerified: true,
            },
        });

        if (!user) {
            return res.json({
                address,
                isWorldIdVerified: false,
            });
        }

        res.json({
            address: user.address,
            isWorldIdVerified: user.isWorldIdVerified,
        });
    } catch (error) {
        console.error('Error checking WorldID status:', error);
        res.status(500).json({ error: 'Failed to check verification status' });
    }
});

module.exports = router;

