import { useState } from 'react';
import TicketCard from './TicketCard';

export default function DashboardTabs({ portfolio }) {
    const [activeTab, setActiveTab] = useState('wallet');

    const tabs = [
        { id: 'wallet', label: 'My Wallet', count: portfolio?.tickets?.length || 0 },
        { id: 'vault', label: 'The Vault', count: portfolio?.stakes?.length || 0 },
        { id: 'loans', label: 'Active Loans', count: portfolio?.loans?.length || 0 },
    ];

    // Filter data based on tab (Mock logic for now, assuming all tickets are IDLE if not staked/loaned)
    // In reality, we'd check the ticket status or existence in stakes/loans arrays
    const getContent = () => {
        if (activeTab === 'wallet') {
            return portfolio?.tickets?.map(t => <TicketCard key={t.tokenId} ticket={t} status="IDLE" />);
        }
        if (activeTab === 'vault') {
            // Mock staked items if none exist for demo
            if (!portfolio?.stakes?.length) return <div className="col-span-full text-center text-gray-500 py-12">No assets in the Vault. Stake a ticket to earn yield.</div>
            return portfolio?.stakes?.map(s => <TicketCard key={s.id} ticket={s} status="STAKED" />);
        }
        if (activeTab === 'loans') {
            if (!portfolio?.loans?.length) return <div className="col-span-full text-center text-gray-500 py-12">No active loans.</div>
            return portfolio?.loans?.map(l => <TicketCard key={l.id} ticket={l} status="LOANED" />);
        }
    };

    return (
        <div>
            {/* Tab Headers */}
            <div className="flex border-b border-white/10 mb-8">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-4 text-sm font-medium transition-all relative ${activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        {tab.label}
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-500'
                            }`}>
                            {tab.count}
                        </span>
                        {/* Active Line */}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                        )}
                    </button>
                ))}
            </div>

            {/* Grid Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getContent()}
            </div>
        </div>
    );
}
