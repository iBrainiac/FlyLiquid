const prisma = require('../src/db');

async function main() {
    console.log('🛡️  Starting "4 Superpowers" Stress Test Suite...\n');

    // --- Setup: Clean Slate ---
    await prisma.priceUpdate.deleteMany();
    await prisma.loan.deleteMany();
    await prisma.stake.deleteMany();
    await prisma.listing.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.user.deleteMany();

    console.log('🧹 DB Cleaned.');

    // --- Setup: Create a User ---
    const user = await prisma.user.create({
        data: { address: '0xUser1', email: 'test@test.com' }
    });
    console.log('👤 User Created:', user.address);

    // =================================================================
    // 🛡️ SUPERPOWER 1: IDEMPOTENCY (The "Restart" Shield)
    // =================================================================
    console.log('\n🧪 Test 1: Idempotency (The "Restart" Shield)');
    try {
        const ticketData = {
            tokenId: 100,
            ownerAddress: user.address,
            price: '100',
            departureTime: 1700000000,
            route: 'JFK -> LHR'
        };

        // First Write
        await prisma.ticket.upsert({
            where: { tokenId: 100 },
            update: {},
            create: ticketData
        });

        // Second Write (Simulating Restart)
        await prisma.ticket.upsert({
            where: { tokenId: 100 },
            update: { price: '200' }, // Should update, not crash
            create: ticketData
        });

        const ticket = await prisma.ticket.findUnique({ where: { tokenId: 100 } });
        if (ticket.price === '200') {
            console.log('   ✅ SUCCESS: DB handled duplicate write via Upsert.');
        } else {
            console.error('   ❌ FAILED: Ticket not updated or state mismatch.');
            process.exit(1);
        }
    } catch (e) {
        console.error('   ❌ FAILED: DB crashed on duplicate write:', e);
        process.exit(1);
    }

    // =================================================================
    // 🛡️ SUPERPOWER 2: ATOMICITY (The "All-or-Nothing" Shield)
    // =================================================================
    console.log('\n🧪 Test 2: Atomicity (The "All-or-Nothing" Shield)');
    try {
        const ticketId = 200;

        // Attempt a transaction that fails halfway
        try {
            await prisma.$transaction(async (tx) => {
                // Step 1: Create Ticket (Success)
                await tx.ticket.create({
                    data: {
                        tokenId: ticketId,
                        ownerAddress: user.address,
                        price: '500',
                        departureTime: 1700000000,
                        route: 'LAX -> NRT'
                    }
                });

                // Step 2: Create Stake for NON-EXISTENT User (Fail)
                await tx.stake.create({
                    data: { ticketId: ticketId, userAddress: '0xFakeUser' }
                });
            });
        } catch (e) {
            // Expected failure
            console.log('   ℹ️  Transaction failed as expected (simulating crash).');
        }

        // Verify Rollback: Ticket should NOT exist
        const ghostTicket = await prisma.ticket.findUnique({ where: { tokenId: ticketId } });
        if (!ghostTicket) {
            console.log('   ✅ SUCCESS: DB rolled back. No "Ghost State" left behind.');
        } else {
            console.error('   ❌ FAILED: Atomicity broken! Ticket exists despite transaction failure.');
            process.exit(1);
        }
    } catch (e) {
        console.error('   ❌ FAILED: Unexpected error in Atomicity test:', e);
        process.exit(1);
    }

    // =================================================================
    // 🛡️ SUPERPOWER 3: CONCURRENCY (The "Traffic Cop")
    // =================================================================
    console.log('\n🧪 Test 3: Concurrency (The "Traffic Cop")');
    const raceTicketId = 300;

    const promises = [];
    for (let i = 0; i < 20; i++) {
        promises.push(
            prisma.ticket.upsert({
                where: { tokenId: raceTicketId },
                update: { price: i.toString() },
                create: {
                    tokenId: raceTicketId,
                    ownerAddress: user.address,
                    price: i.toString(),
                    departureTime: 1700000000,
                    route: 'JFK -> LHR'
                }
            })
        );
    }

    try {
        await Promise.all(promises);
        const count = await prisma.ticket.count({ where: { tokenId: raceTicketId } });
        if (count === 1) {
            console.log('   ✅ SUCCESS: 20 concurrent updates resulted in 1 record.');
        } else {
            console.error(`   ❌ FAILED: Found ${count} records for same ID.`);
            process.exit(1);
        }
    } catch (e) {
        console.error('   ❌ FAILED: Concurrency error:', e);
        process.exit(1);
    }

    // =================================================================
    // 🛡️ SUPERPOWER 4: PRECISION (The "Math" Shield)
    // =================================================================
    console.log('\n🧪 Test 4: Precision (The "Math" Shield)');
    try {
        const massiveNumber = "100000000000000000000000000000000000000000000000000"; // 10^50
        await prisma.ticket.create({
            data: {
                tokenId: 400,
                ownerAddress: user.address,
                price: massiveNumber,
                departureTime: 1700000000,
                route: 'JFK -> LHR'
            }
        });

        const savedTicket = await prisma.ticket.findUnique({ where: { tokenId: 400 } });
        if (savedTicket.price === massiveNumber) {
            console.log('   ✅ SUCCESS: Massive number stored precisely as String.');
        } else {
            console.error('   ❌ FAILED: Number mismatch or truncation.');
            process.exit(1);
        }
    } catch (e) {
        console.error('   ❌ FAILED: Error storing massive number:', e);
        process.exit(1);
    }

    // =================================================================
    // 🛡️ BONUS: MUTUAL EXCLUSIVITY (The "Global Lock")
    // =================================================================
    console.log('\n🧪 Bonus: Mutual Exclusivity (The "Global Lock")');
    try {
        // 1. Create Ticket
        await prisma.ticket.create({
            data: {
                tokenId: 500,
                ownerAddress: user.address,
                price: '100',
                departureTime: 1700000000,
                route: 'JFK -> LHR'
            }
        });

        // 2. Create Stake
        await prisma.stake.create({
            data: { ticketId: 500, userAddress: user.address }
        });

        // 3. Try to Create Loan (Should Fail)
        await prisma.loan.create({
            data: {
                ticketId: 500,
                userAddress: user.address,
                debt: '50',
                healthFactor: '100'
            }
        });
        console.error('   ❌ FAILED: Loan created on staked ticket!');
        process.exit(1);
    } catch (e) {
        // P2002 = Unique Constraint (Prisma)
        // P0001 = Raise Exception (Postgres Trigger) - Prisma wraps this in UnknownRequestError
        if (e.code === 'P2002' || e.message.includes('Ticket is already Staked')) {
            console.log('   ✅ SUCCESS: Database blocked double spend (Mutual Exclusivity Enforced).');
        } else {
            console.error('   ❌ FAILED: Unexpected error:', e);
            process.exit(1);
        }
    }

    console.log('\n🎉 ALL STRESS TESTS PASSED. THE DATABASE IS IRONCLAD.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
