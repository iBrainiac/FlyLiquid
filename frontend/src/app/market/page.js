'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/landing/Footer';
import MarketStats from '@/components/market/MarketStats';
import MarketFilters from '@/components/market/MarketFilters';
import MarketCard from '@/components/market/MarketCard';
import Spinner from '@/components/ui/Spinner';
import { useMarket } from '@/hooks/useData';

export default function Market() {
    const { data: listings, isLoading } = useMarket();

    // Filter State
    const [filters, setFilters] = useState({
        destination: 'ALL',
        maxPrice: 1000,
    });

    // Client-side filtering for velocity
    const filteredListings = listings?.filter(listing => {
        const price = parseFloat(listing.price) / 1e6;
        const route = listing.ticket.route;
        const dest = route.split('-')[1];

        if (filters.destination !== 'ALL' && dest !== filters.destination) return false;
        if (price > filters.maxPrice) return false;

        return true;
    }) || [];

    return (
        <main className="min-h-screen bg-black text-white selection:bg-blue-500/30 pb-20">
            <Navbar />
            <MarketStats />

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">The Exchange</h1>
                    <p className="text-gray-400">Spot arbitrage opportunities and acquire liquid flight assets.</p>
                </div>

                <MarketFilters filters={filters} setFilters={setFilters} />

                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Spinner className="w-8 h-8 text-blue-500" />
                    </div>
                ) : filteredListings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredListings.map((listing) => (
                            <MarketCard key={listing.tokenId} listing={listing} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 border border-dashed border-white/10 rounded-xl bg-white/5">
                        <div className="text-4xl mb-4">📭</div>
                        <h3 className="text-xl font-bold text-white mb-2">No Inventory Found</h3>
                        <p className="text-gray-400">Try adjusting your filters or check back later.</p>
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}
