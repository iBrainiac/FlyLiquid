'use client';

import Navbar from '@/components/Navbar';
import NetWorthRibbon from '@/components/dashboard/NetWorthRibbon';
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import { usePortfolio } from '@/hooks/useData';
import { usePrivy } from '@privy-io/react-auth';
import Spinner from '@/components/ui/Spinner';
import Footer from '@/components/landing/Footer';

export default function Dashboard() {
    const { user, ready } = usePrivy();
    const address = user?.wallet?.address;
    const { data: portfolio, isLoading } = usePortfolio(address);

    if (!ready) return <div className="min-h-screen bg-black flex items-center justify-center"><Spinner /></div>;

    return (
        <main className="min-h-screen bg-black text-white selection:bg-blue-500/30 pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Command Center</h1>
                    <p className="text-gray-400">Manage your flight assets, yield, and liquidity.</p>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Spinner className="w-8 h-8 text-blue-500" />
                    </div>
                ) : (
                    <>
                        <NetWorthRibbon portfolio={portfolio} />
                        <DashboardTabs portfolio={portfolio} />
                    </>
                )}
            </div>
            <Footer />
        </main>
    );
}
