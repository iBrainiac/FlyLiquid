require('dotenv').config();
const { ethers } = require('ethers');
const prisma = require('../db');

// --- Load ABIs ---
const StakingVaultABI = require('../abis/StakingVault.json').abi;
const LendingPoolABI = require('../abis/LendingPool.json').abi;
const MarketplaceABI = require('../abis/Marketplace.json').abi;
const TicketNFTABI = require('../abis/TicketNFT.json').abi;

// --- Configuration ---
const HTTP_RPC_URL = process.env.HTTP_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY';
const WS_RPC_URL = process.env.WS_RPC_URL || 'wss://eth-sepolia.g.alchemy.com/v2/YOUR_KEY';

const ADDRESSES = {
    StakingVault: process.env.STAKING_VAULT_ADDRESS || '0x0000000000000000000000000000000000000000',
    LendingPool: process.env.LENDING_POOL_ADDRESS || '0x0000000000000000000000000000000000000000',
    Marketplace: process.env.MARKETPLACE_ADDRESS || '0x0000000000000000000000000000000000000000',
    TicketNFT: process.env.TICKET_NFT_ADDRESS || '0x0000000000000000000000000000000000000000'
};

// Block range configuration for free tier
const BLOCK_RANGE_LIMIT = 10; // Alchemy free tier limit
const LOOKBACK_BLOCKS = Number(process.env.LOOKBACK_BLOCKS) || 10000; // How far back to sync (adjust as needed)
const RATE_LIMIT_DELAY = 150; // ms between requests to avoid rate limiting

// --- Providers ---
const httpProvider = new ethers.JsonRpcProvider(HTTP_RPC_URL);
const wsProvider = new ethers.WebSocketProvider(WS_RPC_URL);

// --- Contracts (Read-Only) ---
const contracts = {
    http: {
        StakingVault: new ethers.Contract(ADDRESSES.StakingVault, StakingVaultABI, httpProvider),
        LendingPool: new ethers.Contract(ADDRESSES.LendingPool, LendingPoolABI, httpProvider),
        Marketplace: new ethers.Contract(ADDRESSES.Marketplace, MarketplaceABI, httpProvider),
        TicketNFT: new ethers.Contract(ADDRESSES.TicketNFT, TicketNFTABI, httpProvider),
    },
    ws: {
        StakingVault: new ethers.Contract(ADDRESSES.StakingVault, StakingVaultABI, wsProvider),
        LendingPool: new ethers.Contract(ADDRESSES.LendingPool, LendingPoolABI, wsProvider),
        Marketplace: new ethers.Contract(ADDRESSES.Marketplace, MarketplaceABI, wsProvider),
        TicketNFT: new ethers.Contract(ADDRESSES.TicketNFT, TicketNFTABI, wsProvider),
    }
};

// --- Utilities ---
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- Event Handlers (Idempotent & Atomic) ---
async function handleTokenStaked(event) {
    const user = event.args[0];
    const tokenId = Number(event.args[1]);
    const timestamp = Number(event.args[2] || Math.floor(Date.now() / 1000));

    console.log(`[STAKE] Processing Token ${tokenId} for ${user}`);

    try {
        await prisma.$transaction([
            prisma.user.upsert({
                where: { address: user },
                update: {},
                create: { address: user }
            }),
            prisma.ticket.upsert({
                where: { tokenId: tokenId },
                update: { status: 'STAKED' },
                create: {
                    tokenId: tokenId,
                    ownerAddress: user,
                    status: 'STAKED',
                    departureTime: 0,
                    route: 'UNKNOWN'
                }
            }),
            prisma.stake.upsert({
                where: { ticketId: tokenId },
                update: {
                    userAddress: user,
                    stakedAt: new Date(timestamp * 1000)
                },
                create: {
                    ticketId: tokenId,
                    userAddress: user,
                    stakedAt: new Date(timestamp * 1000),
                },
            }),
        ]);
        console.log(`[STAKE] ✅ Synced Token ${tokenId}`);
    } catch (e) {
        console.error(`[STAKE] ❌ Error:`, e);
    }
}

async function handleCollateralDeposited(event) {
    const user = event.args[0];
    const tokenId = Number(event.args[1]);

    console.log(`[COLLATERAL] Deposited Token ${tokenId}`);

    try {
        await prisma.$transaction([
            prisma.user.upsert({ where: { address: user }, update: {}, create: { address: user } }),
            prisma.ticket.upsert({
                where: { tokenId: tokenId },
                update: { status: 'COLLATERALIZED' },
                create: { tokenId: tokenId, ownerAddress: user, status: 'COLLATERALIZED', departureTime: 0, route: 'UNKNOWN' }
            })
        ]);
        console.log(`[COLLATERAL] ✅ Synced Token ${tokenId}`);
    } catch (e) {
        console.error(`[COLLATERAL] ❌ Error:`, e);
    }
}

async function handleBorrowed(event) {
    const user = event.args[0];
    const amount = event.args[1];
    const debtString = amount.toString();

    console.log(`[BORROW] User ${user} borrowed ${debtString}`);

    try {
        const collateralIds = await contracts.http.LendingPool.getCollateralTokenIds(user);
        if (collateralIds.length === 0) {
            console.warn(`[BORROW] ⚠️ User ${user} has no collateral? Cannot link loan.`);
            return;
        }

        const primaryTokenId = Number(collateralIds[0]);
        await prisma.$transaction([
            prisma.user.upsert({ where: { address: user }, update: {}, create: { address: user } }),
            prisma.loan.upsert({
                where: { ticketId: primaryTokenId },
                update: { debt: debtString, updatedAt: new Date() },
                create: {
                    ticketId: primaryTokenId,
                    userAddress: user,
                    debt: debtString,
                    healthFactor: '100',
                }
            })
        ]);
        console.log(`[BORROW] ✅ Synced Loan for Ticket ${primaryTokenId}`);
    } catch (e) {
        console.error(`[BORROW] ❌ Error:`, e);
    }
}

async function handleRepaid(event) {
    const user = event.args[0];
    const amount = event.args[1];

    console.log(`[REPAY] User ${user} repaid ${amount}`);

    try {
        const collateralIds = await contracts.http.LendingPool.getCollateralTokenIds(user);
        if (collateralIds.length === 0) return;

        const primaryTokenId = Number(collateralIds[0]);
        const currentDebt = await contracts.http.LendingPool.getOutstandingDebt(user);

        await prisma.loan.update({
            where: { ticketId: primaryTokenId },
            data: { debt: currentDebt.toString(), updatedAt: new Date() }
        });

        console.log(`[REPAY] ✅ Updated Loan for Ticket ${primaryTokenId}`);
    } catch (e) {
        console.error(`[REPAY] ❌ Error:`, e);
    }
}

async function handleCollateralWithdrawn(event) {
    const user = event.args[0];
    const tokenId = Number(event.args[1]);

    console.log(`[WITHDRAW] Token ${tokenId}`);

    try {
        await prisma.$transaction([
            prisma.ticket.update({
                where: { tokenId: tokenId },
                data: { status: 'IDLE' }
            }),
            prisma.loan.deleteMany({
                where: { ticketId: tokenId }
            })
        ]);
        console.log(`[WITHDRAW] ✅ Synced Token ${tokenId}`);
    } catch (e) {
        console.error(`[WITHDRAW] ❌ Error:`, e);
    }
}

async function handleItemListed(event) {
    const seller = event.args[0];
    const tokenId = Number(event.args[1]);
    const price = event.args[2];

    console.log(`[LIST] Token ${tokenId} for ${price}`);

    try {
        await prisma.$transaction([
            prisma.user.upsert({ where: { address: seller }, update: {}, create: { address: seller } }),
            prisma.ticket.upsert({
                where: { tokenId: tokenId },
                update: { status: 'LISTED' },
                create: { tokenId: tokenId, ownerAddress: seller, status: 'LISTED', departureTime: 0, route: 'UNKNOWN' }
            }),
            prisma.listing.upsert({
                where: { ticketId: tokenId },
                update: { price: price.toString(), listedAt: new Date() },
                create: {
                    ticketId: tokenId,
                    sellerAddress: seller,
                    price: price.toString(),
                    listedAt: new Date()
                }
            })
        ]);
        console.log(`[LIST] ✅ Synced Token ${tokenId}`);
    } catch (e) {
        console.error(`[LIST] ❌ Error:`, e);
    }
}

async function handleItemSold(event) {
    const seller = event.args[0];
    const buyer = event.args[1];
    const tokenId = Number(event.args[2]);
    const price = event.args[3];

    console.log(`[SOLD] Token ${tokenId} to ${buyer}`);

    try {
        await prisma.$transaction([
            prisma.user.upsert({ where: { address: buyer }, update: {}, create: { address: buyer } }),
            prisma.ticket.update({
                where: { tokenId: tokenId },
                data: {
                    ownerAddress: buyer,
                    status: 'IDLE'
                }
            }),
            prisma.listing.delete({
                where: { ticketId: tokenId }
            })
        ]);
        console.log(`[SOLD] ✅ Synced Token ${tokenId}`);
    } catch (e) {
        console.error(`[SOLD] ❌ Error:`, e);
    }
}

async function handleListingCancelled(event) {
    const seller = event.args[0];
    const tokenId = Number(event.args[1]);

    console.log(`[CANCEL] Listing Token ${tokenId}`);

    try {
        await prisma.$transaction([
            prisma.ticket.update({
                where: { tokenId: tokenId },
                data: { status: 'IDLE' }
            }),
            prisma.listing.delete({
                where: { ticketId: tokenId }
            })
        ]);
        console.log(`[CANCEL] ✅ Synced Token ${tokenId}`);
    } catch (e) {
        console.error(`[CANCEL] ❌ Error:`, e);
    }
}

async function handleTransfer(from, to, tokenId, event) {
    // Check if Minting (From 0x000...)
    if (from === ethers.ZeroAddress) {
        console.log(`[MINT] Token #${tokenId} Minted to ${to}`);

        try {
            await prisma.$transaction([
                prisma.user.upsert({
                    where: { address: to },
                    update: {},
                    create: { address: to }
                }),
                prisma.ticket.upsert({
                    where: { tokenId: Number(tokenId) },
                    update: {
                        ownerAddress: to,
                    },
                    create: {
                        tokenId: Number(tokenId),
                        ownerAddress: to,
                        status: 'IDLE',
                        departureTime: 0,
                        route: 'UNKNOWN'
                    }
                })
            ]);
            console.log(`[MINT] ✅ Synced Token ${tokenId}`);
        } catch (e) {
            console.error(`[MINT] ❌ Error:`, e);
        }
    }
}

// --- History Sync with Chunking ---
async function syncHistory() {
    console.log('🔄 Starting History Sync (Backfill)...');

    const currentBlock = await httpProvider.getBlockNumber();
    const startBlock = Math.max(currentBlock - LOOKBACK_BLOCKS, 0);

    console.log(`   Scanning from Block ${startBlock} to ${currentBlock} (${currentBlock - startBlock} blocks)...`);
    console.log(`   Using chunk size: ${BLOCK_RANGE_LIMIT} blocks`);

    let allTransferEvents = [];
    let processedChunks = 0;
    const totalChunks = Math.ceil((currentBlock - startBlock + 1) / BLOCK_RANGE_LIMIT);

    try {
        // Query in chunks to respect free tier limits
        for (let fromBlock = startBlock; fromBlock <= currentBlock; fromBlock += BLOCK_RANGE_LIMIT) {
            const toBlock = Math.min(fromBlock + BLOCK_RANGE_LIMIT - 1, currentBlock);
            processedChunks++;

            console.log(`   [${processedChunks}/${totalChunks}] Querying blocks ${fromBlock} to ${toBlock}...`);

            const events = await contracts.http.TicketNFT.queryFilter(
                'Transfer',
                fromBlock,
                toBlock
            );

            if (events.length > 0) {
                console.log(`      Found ${events.length} Transfer events in this chunk`);
                allTransferEvents.push(...events);
            }

            // Rate limiting to avoid API throttling
            await sleep(RATE_LIMIT_DELAY);
        }

        console.log(`\n   📊 Total Transfer events found: ${allTransferEvents.length}`);

        // Process mint events
        let mintCount = 0;
        for (const event of allTransferEvents) {
            const from = event.args[0];
            const to = event.args[1];
            const tokenId = Number(event.args[2]);

            // Check if Minting (From 0x000...)
            if (from === ethers.ZeroAddress) {
                mintCount++;
                const block = await event.getBlock();
                const timestamp = new Date(block.timestamp * 1000).toISOString();

                console.log(`   📜 [${mintCount}] Token #${tokenId} Minted to ${to.slice(0, 10)}... at ${timestamp}`);

                // Upsert to DB
                await prisma.$transaction([
                    prisma.user.upsert({
                        where: { address: to },
                        update: {},
                        create: { address: to }
                    }),
                    prisma.ticket.upsert({
                        where: { tokenId: tokenId },
                        update: {
                            ownerAddress: to,
                        },
                        create: {
                            tokenId: tokenId,
                            ownerAddress: to,
                            status: 'IDLE',
                            departureTime: 0,
                            route: 'UNKNOWN'
                        }
                    })
                ]);

                // Small delay to avoid overwhelming the DB
                if (mintCount % 10 === 0) {
                    await sleep(100);
                }
            }
        }

        console.log(`\n✅ History Sync Complete. Processed ${mintCount} minting events.`);
    } catch (e) {
        console.error('❌ Error during History Sync:', e);
        console.log(`   Last successful block: ${processedChunks * BLOCK_RANGE_LIMIT + startBlock}`);
    }
}

// --- WebSocket Connection Management ---
function setupWebSocketErrorHandling() {
    // Access the underlying WebSocket connection
    const ws = wsProvider.websocket;

    if (ws) {
        ws.on('error', (error) => {
            console.error('❌ WebSocket error:', error);
        });

        ws.on('close', (code, reason) => {
            console.warn(`⚠️ WebSocket connection closed (code: ${code}, reason: ${reason})`);
            console.log('   The indexer will need to be manually restarted.');
            // Note: Automatic reconnection is complex with ethers v6
            // Consider using a process manager like PM2 for auto-restart
        });

        ws.on('open', () => {
            console.log('✅ WebSocket connection established');
        });
    } else {
        console.warn('⚠️ Could not access WebSocket for connection monitoring');
    }
}

// --- Main Pipeline ---
async function main() {
    console.log('🚀 FlightStakeFi Indexer Starting...\n');

    // Validate contract addresses
    const invalidAddresses = Object.entries(ADDRESSES).filter(
        ([_, addr]) => addr === '0x0000000000000000000000000000000000000000'
    );

    if (invalidAddresses.length > 0) {
        console.warn('⚠️ WARNING: Some contract addresses are not set:');
        invalidAddresses.forEach(([name, _]) => console.warn(`   - ${name}`));
        console.warn('   Please update your .env file with deployed contract addresses.\n');
    }

    // 1. Run History Sync FIRST
    await syncHistory();

    // 2. Setup WebSocket error handling
    setupWebSocketErrorHandling();

    // 3. Start Live Listeners
    console.log('\n🎧 Starting Real-Time Event Listeners...');

    contracts.ws.StakingVault.on('TokenStaked', (...args) => {
        handleTokenStaked(args[args.length - 1]);
    });

    contracts.ws.LendingPool.on('CollateralDeposited', (...args) =>
        handleCollateralDeposited(args[args.length - 1])
    );

    contracts.ws.LendingPool.on('Borrowed', (...args) =>
        handleBorrowed(args[args.length - 1])
    );

    contracts.ws.LendingPool.on('Repaid', (...args) =>
        handleRepaid(args[args.length - 1])
    );

    contracts.ws.LendingPool.on('CollateralWithdrawn', (...args) =>
        handleCollateralWithdrawn(args[args.length - 1])
    );

    contracts.ws.Marketplace.on('ItemListed', (...args) =>
        handleItemListed(args[args.length - 1])
    );

    contracts.ws.Marketplace.on('ItemSold', (...args) =>
        handleItemSold(args[args.length - 1])
    );

    contracts.ws.Marketplace.on('ListingCancelled', (...args) =>
        handleListingCancelled(args[args.length - 1])
    );

    contracts.ws.TicketNFT.on('Transfer', (from, to, tokenId, event) => {
        handleTransfer(from, to, tokenId, event);
    });

    console.log('✅ All event listeners active!\n');
    console.log('📡 Listening for blockchain events...');
    console.log('   Press Ctrl+C to stop\n');
}

// --- Graceful Shutdown ---
process.on('SIGINT', async () => {
    console.log('\n\n🛑 Shutting down gracefully...');

    try {
        await wsProvider.destroy();
        await prisma.$disconnect();
        console.log('✅ Cleanup complete. Goodbye!');
        process.exit(0);
    } catch (e) {
        console.error('❌ Error during shutdown:', e);
        process.exit(1);
    }
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled Rejection:', error);
});

main().catch(console.error);