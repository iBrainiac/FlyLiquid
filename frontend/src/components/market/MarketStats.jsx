export default function MarketStats() {
    // Mock data for the "Ticker Tape" effect
    const stats = [
        { label: 'Total Volume', value: '$52,400 USDC', color: 'text-blue-400' },
        { label: 'Floor Price (JFK-LHR)', value: '$350', color: 'text-white' },
        { label: 'Recent Sale', value: '#8822 sold for $400', color: 'text-green-400' },
        { label: 'Active Listings', value: '142', color: 'text-purple-400' },
    ];

    return (
        <div className="w-full bg-white/5 border-b border-white/10 overflow-hidden backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between overflow-x-auto no-scrollbar gap-8">
                {stats.map((stat, index) => (
                    <div key={index} className="flex items-center gap-2 whitespace-nowrap">
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                            {stat.label}
                        </span>
                        <span className={`text-sm font-bold font-mono ${stat.color}`}>
                            {stat.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
