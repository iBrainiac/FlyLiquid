import { ethers } from 'ethers';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Config
const RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY;
const ORACLE_ADDRESS = process.env.PRICING_ORACLE_ADDRESS;

// Artifact
const ARTIFACT_PATH = path.resolve(__dirname, '../contracts/artifacts/contracts/PricingOracle.sol/PricingOracle.json');
const artifact = JSON.parse(fs.readFileSync(ARTIFACT_PATH, 'utf8'));

async function main() {
    console.log('🤖 Starting Price Update Bot...');

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const oracle = new ethers.Contract(ORACLE_ADDRESS, artifact.abi, wallet);

    console.log(`🔑 Wallet: ${wallet.address}`);
    console.log(`🔮 Oracle: ${ORACLE_ADDRESS}`);

    // Hackathon Loop: Update every 60 seconds
    while (true) {
        try {
            console.log('-----------------------------------');
            console.log('⏰ Checking for stale prices...');

            // In a real app, we'd check which tickets need updates.
            // For the Hackathon, we just update a random ticket to show activity.
            // Or we update a specific "Demo Ticket" (e.g. #1).

            const demoTicketId = 1;
            const newPrice = Math.floor(Math.random() * (600 - 400) + 400); // Random price 400-600

            console.log(`📝 Updating Ticket #${demoTicketId} to ${newPrice} USDC...`);

            const tx = await oracle.updatePrice(demoTicketId, ethers.parseUnits(newPrice.toString(), 18));
            console.log(`⏳ Tx sent: ${tx.hash}`);
            await tx.wait();

            console.log(`✅ Price Updated!`);
        } catch (error) {
            console.error(`❌ Error:`, error.message);
        }

        console.log('💤 Sleeping for 60s...');
        await new Promise(r => setTimeout(r, 60000));
    }
}

main();
