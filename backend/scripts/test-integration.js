require('dotenv').config();
const { ethers } = require('ethers');
const fetch = require('node-fetch'); // Ensure node-fetch is available or use native fetch in Node 18+

// --- CONFIGURATION ---
const API_URL = 'http://localhost:4000/api';
const RPC_URL = process.env.HTTP_RPC_URL;
const PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY;

const TICKET_NFT_ADDRESS = process.env.TICKET_NFT_ADDRESS;
const MARKETPLACE_ADDRESS = process.env.MARKETPLACE_ADDRESS;

// ABIs (Minimal)
const TicketNFTABI = require('../src/abis/TicketNFT.json').abi;
const MarketplaceABI = require('../src/abis/Marketplace.json').abi;

// Utilities
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
    console.log('🚀 Starting Integration Test: Backend + Contracts');
    console.log('===============================================');

    if (!PRIVATE_KEY) {
        throw new Error('❌ Missing SEPOLIA_PRIVATE_KEY in .env');
    }

    // 1. Setup Provider & Wallet
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    console.log(`👤 Wallet: ${wallet.address}`);

    // 2. Connect Contracts
    const ticketNFT = new ethers.Contract(TICKET_NFT_ADDRESS, TicketNFTABI, wallet);
    const marketplace = new ethers.Contract(MARKETPLACE_ADDRESS, MarketplaceABI, wallet);

    // 3. Mint a New Ticket
    const tokenId = Math.floor(Math.random() * 1000000); // Random ID to avoid collisions
    console.log(`\n1️⃣  Minting Token ID ${tokenId}...`);

    const flightDetails = {
        routeHash: ethers.encodeBytes32String("JFK-LHR"),
        departureTimestamp: Math.floor(Date.now() / 1000) + 86400, // Tomorrow
        fareTierIdentifier: ethers.encodeBytes32String("economy"),
    };

    try {
        const txMint = await ticketNFT.mint(
            wallet.address,
            tokenId,
            flightDetails,
            `https://api.flightstake.fi/meta/${tokenId}.json`
        );
        console.log(`   Tx Sent: ${txMint.hash}`);
        await txMint.wait(1);
        console.log('   ✅ Minted on-chain');
    } catch (e) {
        console.error('   ❌ Mint Failed:', e);
        process.exit(1);
    }

    // 4. Poll API for Portfolio Update (Indexer Check)
    console.log(`\n2️⃣  Waiting for Indexer to sync Mint (Polling API)...`);
    let synced = false;
    for (let i = 0; i < 30; i++) { // Wait up to 60s
        try {
            const res = await fetch(`${API_URL}/user/${wallet.address}/portfolio`);
            const data = await res.json();

            const ticket = data.tickets.find(t => t.tokenId === tokenId);
            if (ticket) {
                console.log(`   ✅ Found Token ${tokenId} in API!`);
                synced = true;
                break;
            }
        } catch (e) {
            process.stdout.write('.');
        }
        await sleep(2000);
        process.stdout.write('.');
    }

    if (!synced) {
        console.error('\n   ❌ Timeout waiting for Indexer to sync Mint.');
        process.exit(1);
    }

    // 5. List the Ticket
    console.log(`\n3️⃣  Listing Token ${tokenId} on Marketplace...`);
    const price = ethers.parseUnits("10", 6); // 10 USDC

    try {
        // Approve
        console.log('   Approving...');
        const txApprove = await ticketNFT.approve(MARKETPLACE_ADDRESS, tokenId);
        await txApprove.wait(1);

        // List
        console.log('   Listing...');
        const txList = await marketplace.listItem(tokenId, price);
        await txList.wait(1);
        console.log('   ✅ Listed on-chain');
    } catch (e) {
        console.error('   ❌ Listing Failed:', e);
        process.exit(1);
    }

    // 6. Poll API for Marketplace Update
    console.log(`\n4️⃣  Waiting for Indexer to sync Listing (Polling API)...`);
    synced = false;
    for (let i = 0; i < 30; i++) {
        try {
            const res = await fetch(`${API_URL}/market/listings`);
            const listings = await res.json();

            const listing = listings.find(l => l.ticketId === tokenId);
            if (listing) {
                console.log(`   ✅ Found Listing for Token ${tokenId} in API!`);
                console.log(`      Price: ${listing.price} (Expected: 10000000)`);
                synced = true;
                break;
            }
        } catch (e) {
            process.stdout.write('.');
        }
        await sleep(2000);
        process.stdout.write('.');
    }

    if (!synced) {
        console.error('\n   ❌ Timeout waiting for Indexer to sync Listing.');
        process.exit(1);
    }

    console.log('\n===============================================');
    console.log('🎉 INTEGRATION TEST PASSED!');
    console.log('===============================================');
}

main().catch(console.error);
